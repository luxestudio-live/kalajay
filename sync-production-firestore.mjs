/**
 * KALAJAY HANDCRAFTED LUXURIES
 * Production Firestore Cloudinary Synchronization & Rollback Tool
 * 
 * Complies with strict data migration safeguards:
 * 1. Uses authorized Firebase Admin credentials.
 * 2. Reads existing documents before updating.
 * 3. Never creates missing products/categories unexpectedly.
 * 4. Detects existing image-field conflicts (e.g. admin edits).
 * 5. Backs up original image values prior to mutation.
 * 6. Updates ONLY approved image fields (coverImage, images, variant.image, category.image).
 * 7. Preserves variant attributes, prices, inventory, and all unrelated fields.
 * 8. Supports safe, idempotent retries (skips already-synced documents).
 * 9. Produces a detailed execution receipt.
 * 10. Supports field-level rollback via `--rollback <backup-file>`.
 * 
 * Usage:
 *   Dry-run mode (read-only validation):
 *     node sync-production-firestore.mjs --dry-run
 * 
 *   Execute sync:
 *     node sync-production-firestore.mjs
 * 
 *   Execute rollback from backup:
 *     node sync-production-firestore.mjs --rollback firestore-backup-<timestamp>.json
 * 
 * Prerequisites:
 *   FIREBASE_SERVICE_ACCOUNT_KEY must be set in the environment or passed via file path.
 */

import fs from 'fs';
import path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Parse CLI flags
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');
const rollbackIndex = args.indexOf('--rollback');
const rollbackFile = rollbackIndex !== -1 ? args[rollbackIndex + 1] : null;

// Validate Firebase Admin Credentials
function getServiceAccount() {
  let credEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!credEnv) {
    if (fs.existsSync('credentials/serviceAccountKey.json')) {
      credEnv = 'credentials/serviceAccountKey.json';
    } else if (fs.existsSync('C:/Users/Sonali/Downloads/kalajay-667ff-firebase-adminsdk-fbsvc-65836c67d5.json')) {
      credEnv = 'C:/Users/Sonali/Downloads/kalajay-667ff-firebase-adminsdk-fbsvc-65836c67d5.json';
    }
  }

  if (!credEnv) {
    console.error('\n[SAFEGUARD BLOCKED] FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not defined.');
    console.error('To run this script against live Firestore, supply Firebase Admin credentials:\n');
    console.error('  $env:FIREBASE_SERVICE_ACCOUNT_KEY=\'{"type":"service_account",...}\'');
    console.error('  or point to a valid service account JSON file.\n');
    process.exit(1);
  }

  try {
    if (fs.existsSync(credEnv)) {
      return JSON.parse(fs.readFileSync(credEnv, 'utf8'));
    }
    return JSON.parse(credEnv);
  } catch (err) {
    console.error('\n[ERROR] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it is valid JSON or a valid file path.');
    console.error(err.message);
    process.exit(1);
  }
}

// Rollback Handler
async function executeRollback(db, backupPath) {
  console.log(`\n=== EXECUTING FIRESTORE FIELD-LEVEL ROLLBACK ===`);
  console.log(`Source backup: ${backupPath}\n`);

  if (!fs.existsSync(backupPath)) {
    console.error(`Backup file not found: ${backupPath}`);
    process.exit(1);
  }

  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const results = { restored: 0, skipped: 0, errors: [] };

  for (const entry of backupData.entries) {
    try {
      const docRef = db.collection(entry.collection).doc(entry.id);
      const snap = await docRef.get();

      if (!snap.exists) {
        console.warn(`[SKIP] Document no longer exists: ${entry.collection}/${entry.id}`);
        results.skipped++;
        continue;
      }

      const restorePayload = {};
      if (entry.collection === 'products') {
        if (entry.original.coverImage !== undefined) restorePayload.coverImage = entry.original.coverImage;
        if (entry.original.images !== undefined) restorePayload.images = entry.original.images;
        // Strictly limit variant rollback to image fields to prevent overwriting concurrent Admin edits
        if (entry.original.variants !== undefined) {
          const currentVariants = snap.data().variants || [];
          if (Array.isArray(currentVariants) && Array.isArray(entry.original.variants)) {
            restorePayload.variants = currentVariants.map((cv, idx) => {
              const origV = entry.original.variants.find(ov => ov.id === cv.id) || entry.original.variants[idx];
              return origV && origV.image !== undefined ? { ...cv, image: origV.image } : cv;
            });
          } else {
            restorePayload.variants = entry.original.variants;
          }
        }
      } else if (entry.collection === 'categories') {
        if (entry.original.image !== undefined) restorePayload.image = entry.original.image;
      }

      if (Object.keys(restorePayload).length > 0) {
        restorePayload.updatedAt = new Date().toISOString();
        await docRef.update(restorePayload);
        results.restored++;
        console.log(`[RESTORED] ${entry.collection}/${entry.id}`);
      }
    } catch (err) {
      console.error(`[ERROR] Failed to restore ${entry.collection}/${entry.id}:`, err.message);
      results.errors.push({ id: entry.id, error: err.message });
    }
  }

  console.log(`\n=== ROLLBACK COMPLETE ===`);
  console.log(`Restored: ${results.restored}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`);
}

// Main Synchronization Handler
async function executeSync(db) {
  const manifestPath = path.resolve('media-sync-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest file missing: ${manifestPath}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`\n=== KALAJAY PRODUCTION FIRESTORE CLOUDINARY SYNC ===`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (Read-Only)' : 'LIVE EXECUTION'}`);
  console.log(`Loaded manifest: ${manifest.products.length} products, ${manifest.categories.length} categories\n`);

  const timestamp = Date.now();
  const backupEntries = [];
  const updateQueue = [];
  const receipt = {
    startedAt: new Date(timestamp).toISOString(),
    isDryRun,
    summary: {
      totalProductsTargeted: manifest.products.length,
      totalCategoriesTargeted: manifest.categories.length,
      productsUpdated: 0,
      categoriesUpdated: 0,
      alreadySynced: 0,
      missingDocumentsSkipped: 0,
      conflictsDetected: 0,
      errors: 0
    },
    details: []
  };

  // 1. Audit Products
  console.log('--- 1. AUDITING /products ---');
  for (const p of manifest.products) {
    const docId = p.id || p.code;
    const docRef = db.collection('products').doc(docId);
    
    try {
      const snap = await docRef.get();
      if (!snap.exists) {
        console.log(`[SKIP MISSING] Product does not exist in Firestore: ${docId}`);
        receipt.summary.missingDocumentsSkipped++;
        receipt.details.push({ collection: 'products', id: docId, status: 'SKIPPED_MISSING' });
        continue;
      }

      const existingData = snap.data();
      const originalCover = existingData.coverImage;
      const originalImages = existingData.images || [];
      const existingVariants = existingData.variants || [];

      // Idempotency check: Already matches target Cloudinary URL?
      const isCoverSynced = existingData.coverImage === p.coverImage;
      const areImagesSynced = Array.isArray(existingData.images) &&
        existingData.images.length === p.images.length &&
        existingData.images.every((url, idx) => url === p.images[idx]);

      if (isCoverSynced && areImagesSynced) {
        console.log(`[ALREADY SYNCED] Product: ${docId}`);
        receipt.summary.alreadySynced++;
        receipt.details.push({ collection: 'products', id: docId, status: 'ALREADY_SYNCED' });
        continue;
      }

      // Conflict detection: Has the coverImage been modified to an unexpected custom URL?
      const isLegacyUrl = typeof originalCover === 'string' && (originalCover.includes('kalajay.in/media') || originalCover.includes('kalajay.in/v2'));
      const isCloudinaryUrl = typeof originalCover === 'string' && originalCover.includes('cloudinary.com');
      if (originalCover && !isLegacyUrl && !isCloudinaryUrl && !isForce) {
        console.warn(`[CONFLICT DETECTED] Product ${docId} has custom non-legacy image: "${originalCover}". Skipping. Use --force to override.`);
        receipt.summary.conflictsDetected++;
        receipt.details.push({ collection: 'products', id: docId, status: 'CONFLICT_SKIPPED', currentCover: originalCover });
        continue;
      }

      // Preserve all variant attributes, updating only variant.image
      let updatedVariants = existingVariants;
      if (Array.isArray(existingVariants) && p.variants && p.variants.length > 0) {
        updatedVariants = existingVariants.map((ev, idx) => {
          const targetVariant = p.variants.find(tv => tv.id === ev.id) || p.variants[idx];
          if (targetVariant && targetVariant.image) {
            return { ...ev, image: targetVariant.image };
          }
          return ev;
        });
      }

      const backupEntry = {
        collection: 'products',
        id: docId,
        original: {
          coverImage: originalCover,
          images: originalImages,
          variants: existingVariants,
          updatedAt: existingData.updatedAt || null
        },
        intended: {
          coverImage: p.coverImage,
          images: p.images,
          variants: updatedVariants
        }
      };

      backupEntries.push(backupEntry);
      updateQueue.push({
        collection: 'products',
        id: docId,
        ref: docRef,
        payload: {
          coverImage: p.coverImage,
          images: p.images,
          variants: updatedVariants,
          updatedAt: new Date().toISOString()
        }
      });

    } catch (err) {
      console.error(`[ERROR] Auditing product ${docId}:`, err.message);
      receipt.summary.errors++;
      receipt.details.push({ collection: 'products', id: docId, status: 'ERROR', error: err.message });
    }
  }

  // 2. Audit Categories
  console.log('\n--- 2. AUDITING /categories ---');
  for (const c of manifest.categories) {
    const docRef = db.collection('categories').doc(c.slug);

    try {
      const snap = await docRef.get();
      if (!snap.exists) {
        console.log(`[SKIP MISSING] Category does not exist in Firestore: ${c.slug}`);
        receipt.summary.missingDocumentsSkipped++;
        receipt.details.push({ collection: 'categories', id: c.slug, status: 'SKIPPED_MISSING' });
        continue;
      }

      const existingData = snap.data();
      const originalImage = existingData.image;

      if (existingData.image === c.image) {
        console.log(`[ALREADY SYNCED] Category: ${c.slug}`);
        receipt.summary.alreadySynced++;
        receipt.details.push({ collection: 'categories', id: c.slug, status: 'ALREADY_SYNCED' });
        continue;
      }

      // Conflict detection
      const isLegacyUrl = typeof originalImage === 'string' && (originalImage.includes('kalajay.in/media') || originalImage.includes('kalajay.in/v2'));
      const isCloudinaryUrl = typeof originalImage === 'string' && originalImage.includes('cloudinary.com');
      if (originalImage && !isLegacyUrl && !isCloudinaryUrl && !isForce) {
        console.warn(`[CONFLICT DETECTED] Category ${c.slug} has custom image: "${originalImage}". Skipping.`);
        receipt.summary.conflictsDetected++;
        receipt.details.push({ collection: 'categories', id: c.slug, status: 'CONFLICT_SKIPPED', currentImage: originalImage });
        continue;
      }

      const backupEntry = {
        collection: 'categories',
        id: c.slug,
        original: { image: originalImage, updatedAt: existingData.updatedAt || null },
        intended: { image: c.image }
      };

      backupEntries.push(backupEntry);
      updateQueue.push({
        collection: 'categories',
        id: c.slug,
        ref: docRef,
        payload: {
          image: c.image,
          updatedAt: new Date().toISOString()
        }
      });

    } catch (err) {
      console.error(`[ERROR] Auditing category ${c.slug}:`, err.message);
      receipt.summary.errors++;
      receipt.details.push({ collection: 'categories', id: c.slug, status: 'ERROR', error: err.message });
    }
  }

  // 3. Pre-Migration Backup Creation & Verification
  if (!isDryRun && backupEntries.length > 0) {
    const backupFileName = `firestore-backup-${timestamp}.json`;
    console.log(`\n--- 3. CREATING & VERIFYING PRE-MIGRATION BACKUP ---`);
    const backupContent = {
      createdAt: receipt.startedAt,
      totalEntries: backupEntries.length,
      entries: backupEntries
    };
    fs.writeFileSync(backupFileName, JSON.stringify(backupContent, null, 2), 'utf8');

    // Strict verification of written backup
    if (!fs.existsSync(backupFileName)) {
      console.error(`[FATAL] Pre-migration backup file could not be verified on disk: ${backupFileName}`);
      process.exit(1);
    }
    const readBackBackup = JSON.parse(fs.readFileSync(backupFileName, 'utf8'));
    if (!readBackBackup.entries || readBackBackup.entries.length !== backupEntries.length) {
      console.error(`[FATAL] Pre-migration backup verification mismatch! Expected ${backupEntries.length} entries, found ${readBackBackup.entries?.length}`);
      process.exit(1);
    }
    console.log(`[PRE-MIGRATION BACKUP VERIFIED] ${backupEntries.length} documents safely backed up to ${backupFileName}`);
    receipt.backupFile = backupFileName;
  }

  // 4. Execute Updates
  console.log(`\n--- 4. EXECUTING SYNCHRONIZATION (${isDryRun ? 'DRY-RUN' : 'LIVE MUTATION'}) ---`);
  for (const item of updateQueue) {
    try {
      if (!isDryRun) {
        await item.ref.update(item.payload);
      }
      if (item.collection === 'products') receipt.summary.productsUpdated++;
      if (item.collection === 'categories') receipt.summary.categoriesUpdated++;

      console.log(`[${isDryRun ? 'WOULD UPDATE' : 'UPDATED'}] ${item.collection}/${item.id}`);
      receipt.details.push({ collection: item.collection, id: item.id, status: isDryRun ? 'DRY_RUN_UPDATED' : 'UPDATED' });
    } catch (err) {
      console.error(`[ERROR] Updating ${item.collection}/${item.id}:`, err.message);
      receipt.summary.errors++;
      receipt.details.push({ collection: item.collection, id: item.id, status: 'ERROR', error: err.message });
    }
  }

  // 5. Save Receipt
  receipt.completedAt = new Date().toISOString();
  const receiptFileName = `firestore-sync-receipt-${timestamp}.json`;
  fs.writeFileSync(receiptFileName, JSON.stringify(receipt, null, 2), 'utf8');
  console.log(`\n[RECEIPT SAVED] Receipt written to: ${receiptFileName}`);

  // 6. Post-Sync Read-Only Verification
  if (!isDryRun && receipt.summary.errors === 0) {
    console.log(`\n--- 5. POST-SYNC READ-ONLY VERIFICATION ---`);
    let verifiedCount = 0;
    let failedVerificationCount = 0;

    for (const item of updateQueue) {
      const snap = await item.ref.get();
      const currentData = snap.data();
      if (item.collection === 'products') {
        const coverMatches = currentData.coverImage === item.payload.coverImage;
        const imagesMatch = Array.isArray(currentData.images) &&
          currentData.images.length === item.payload.images.length &&
          currentData.images.every((url, i) => url === item.payload.images[i]);
        if (coverMatches && imagesMatch) {
          verifiedCount++;
        } else {
          failedVerificationCount++;
          console.error(`[VERIFICATION FAILED] Product ${item.id} image mismatch.`);
        }
      } else if (item.collection === 'categories') {
        if (currentData.image === item.payload.image) {
          verifiedCount++;
        } else {
          failedVerificationCount++;
          console.error(`[VERIFICATION FAILED] Category ${item.id} image mismatch.`);
        }
      }
    }

    console.log(`[POST-SYNC VERIFICATION] Verified: ${verifiedCount} / ${updateQueue.length} documents match Cloudinary targets.`);
    receipt.summary.verifiedDocuments = verifiedCount;
    receipt.summary.failedVerifications = failedVerificationCount;
  }

  console.log(`\n=== EXECUTION SUMMARY ===`);
  console.log(`Mode:                     ${isDryRun ? 'DRY-RUN' : 'LIVE'}`);
  console.log(`Products Updated:         ${receipt.summary.productsUpdated} / ${manifest.products.length}`);
  console.log(`Categories Updated:       ${receipt.summary.categoriesUpdated} / ${manifest.categories.length}`);
  console.log(`Already Synced:           ${receipt.summary.alreadySynced}`);
  console.log(`Missing Skipped:          ${receipt.summary.missingDocumentsSkipped}`);
  console.log(`Conflicts Skipped:        ${receipt.summary.conflictsDetected}`);
  console.log(`Errors:                   ${receipt.summary.errors}`);
  if (!isDryRun) {
    console.log(`Verified Records:         ${receipt.summary.verifiedDocuments || 0} / ${updateQueue.length}`);
  }
}

async function main() {
  const serviceAccount = getServiceAccount();
  const app = getApps().length === 0 ? initializeApp({ credential: cert(serviceAccount) }) : getApps()[0];
  const db = getFirestore(app);

  if (rollbackFile) {
    await executeRollback(db, rollbackFile);
  } else {
    await executeSync(db);
  }
}

main().catch(err => {
  console.error('\nFatal execution error:', err);
  process.exit(1);
});

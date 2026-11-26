import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import { DEFAULT_REVIEWS, ReviewItem } from '@/data/catalogue';
import { verifyStaffPermission, verifyFirebaseIdToken } from '@/lib/serverRbac';
import { resolveReviews } from '@/lib/dataProvenance';

export const dynamic = 'force-dynamic';

// In-memory runtime cache for seamless local and serverless persistence
let memoryReviews: ReviewItem[] = [...DEFAULT_REVIEWS];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const productId = searchParams.get('productId');
    const all = searchParams.get('all') === 'true';

    // Attempt to pull from Firestore if Admin SDK is connected
    const adminDb = getAdminFirestore();
    if (adminDb) {
      try {
        const snap = await adminDb.collection('reviews').get();
        const fsList: ReviewItem[] = [];
        if (!snap.empty) {
          snap.forEach(d => fsList.push({ id: d.id, ...d.data() } as ReviewItem));
        }
        memoryReviews = resolveReviews(fsList, DEFAULT_REVIEWS) as unknown as ReviewItem[];
      } catch (err) {
        console.warn('Firestore reviews fetch failed, using memory store:', err);
        memoryReviews = resolveReviews([], DEFAULT_REVIEWS) as unknown as ReviewItem[];
      }
    } else {
      memoryReviews = resolveReviews([], DEFAULT_REVIEWS) as unknown as ReviewItem[];
    }

    if (all) {
      // Security: Viewing all reviews (including pending/rejected & email addresses) requires authenticated staff
      const authCheck = await verifyStaffPermission(request, null, 'catalogue.products', 'view');
      if (!authCheck.authorized) {
        return NextResponse.json(
          { success: false, error: authCheck.error || 'Unauthorized: Staff credentials required to view unmoderated reviews.', code: authCheck.code },
          { status: authCheck.status || 401 }
        );
      }

      return NextResponse.json({ success: true, reviews: memoryReviews });
    }

    // Public Storefront PDP Display: Sanitized public projection of approved reviews ONLY
    // Patron email, authorEmail, and private review metadata are strictly omitted
    const approvedReviews = memoryReviews
      .filter(r => {
        if (r.status !== 'approved') return false;
        if (slug && r.productSlug && r.productSlug.toLowerCase() === slug.toLowerCase()) return true;
        if (productId && r.productId && r.productId.toLowerCase() === productId.toLowerCase()) return true;
        if (slug && r.product && r.product.toLowerCase().replace(/[^a-z0-9]+/g, '-').includes(slug.toLowerCase())) return true;
        return false;
      })
      .map(r => {
        const raw = r as any;
        return {
          id: raw.id,
          patron: raw.patron || raw.authorName || 'Patron',
          product: raw.product || 'Handcrafted Creation',
          productId: raw.productId || '',
          productSlug: raw.productSlug || '',
          rating: Number(raw.rating) || 5,
          headline: raw.headline || '',
          comment: raw.comment || '',
          date: raw.date || raw.createdAt || '',
          status: 'approved' as const,
          verifiedBuyer: Boolean(raw.verifiedBuyer),
        };
      });

    return NextResponse.json({ success: true, reviews: approvedReviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patron, email, product, productSlug, productId, rating, headline, comment } = body;

    // 1. Validation & Input Sanitization against Spam & Script Injection
    const cleanPatron = (patron || '').replace(/<[^>]*>?/gm, '').trim();
    if (!cleanPatron || cleanPatron.length > 80) {
      return NextResponse.json({ success: false, error: 'Please provide a valid name (max 80 characters).' }, { status: 400 });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.length > 120) {
      return NextResponse.json({ success: false, error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5 || !Number.isInteger(numRating)) {
      return NextResponse.json({ success: false, error: 'Rating must be an integer between 1 and 5 stars.' }, { status: 400 });
    }

    const cleanComment = (comment || '').replace(/<[^>]*>?/gm, '').trim();
    if (!cleanComment || cleanComment.length < 5 || cleanComment.length > 1000) {
      return NextResponse.json({ success: false, error: 'Review text must be between 5 and 1000 characters.' }, { status: 400 });
    }

    const cleanHeadline = (headline || '').replace(/<[^>]*>?/gm, '').trim().slice(0, 150);

    // 2. Strict Zero-Trust Review Creation: Always status = 'pending', never auto-approved
    const newReview: ReviewItem = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patron: cleanPatron,
      email: cleanEmail,
      product: product?.trim() || 'Handcrafted Creation',
      productSlug: productSlug?.trim() || '',
      productId: productId?.trim() || '',
      rating: numRating,
      headline: cleanHeadline,
      comment: cleanComment,
      date: new Date().toISOString().split('T')[0],
      status: 'pending', // Requires admin moderation before public display
      verifiedBuyer: false, // Default false; verified only upon completed order lookup
    };

    // Store in memory
    memoryReviews = [newReview, ...memoryReviews];

    // Store in Firestore if adminDb is available
    const adminDb = getAdminFirestore();
    if (adminDb) {
      try {
        await adminDb.collection('reviews').doc(newReview.id).set(newReview);
      } catch (err) {
        console.warn('Firestore write for review failed:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your review has been submitted to our atelier moderation queue and will appear once verified.',
      review: {
        id: newReview.id,
        patron: newReview.patron,
        rating: newReview.rating,
        headline: newReview.headline,
        comment: newReview.comment,
        date: newReview.date,
        status: newReview.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    // Security: Only authorized staff with catalogue.products -> edit permission can moderate reviews
    const authCheck = await verifyStaffPermission(request, body, 'catalogue.products', 'edit');
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || 'Unauthorized: Staff moderation permission required.' },
        { status: authCheck.status || 403 }
      );
    }

    if (!id || !['approved', 'archived', 'pending', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid review update parameters.' }, { status: 400 });
    }

    const target = memoryReviews.find(r => r.id === id);
    if (target) {
      target.status = status;
    }

    // Update in Firestore if adminDb is available
    const adminDb = getAdminFirestore();
    if (adminDb) {
      try {
        await adminDb.collection('reviews').doc(id).set({ status }, { merge: true });
      } catch (err) {
        console.warn('Firestore review status update failed:', err);
      }
    }

    return NextResponse.json({ success: true, id, status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import { DEFAULT_REVIEWS, ReviewItem } from '@/data/catalogue';

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
        if (!snap.empty) {
          const fsList: ReviewItem[] = [];
          snap.forEach(d => fsList.push({ id: d.id, ...d.data() } as ReviewItem));
          // Merge unique reviews
          const idSet = new Set(fsList.map(r => r.id));
          memoryReviews = [...fsList, ...memoryReviews.filter(r => !idSet.has(r.id))];
        }
      } catch (err) {
        console.warn('Firestore reviews fetch failed, using memory store:', err);
      }
    }

    if (all) {
      return NextResponse.json({ success: true, reviews: memoryReviews });
    }

    // Filter for approved reviews matching this product
    const approvedReviews = memoryReviews.filter(r => {
      if (r.status !== 'approved') return false;
      if (slug && r.productSlug && r.productSlug.toLowerCase() === slug.toLowerCase()) return true;
      if (productId && r.productId && r.productId.toLowerCase() === productId.toLowerCase()) return true;
      if (slug && r.product && r.product.toLowerCase().replace(/[^a-z0-9]+/g, '-').includes(slug.toLowerCase())) return true;
      return false;
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

    if (!patron || !patron.trim()) {
      return NextResponse.json({ success: false, error: 'Please provide your name.' }, { status: 400 });
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return NextResponse.json({ success: false, error: 'Rating must be between 1 and 5 stars.' }, { status: 400 });
    }

    if (!comment || comment.trim().length < 5) {
      return NextResponse.json({ success: false, error: 'Please write a review of at least 5 characters.' }, { status: 400 });
    }

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patron: patron.trim(),
      email: email.trim(),
      product: product?.trim() || 'Handcrafted Creation',
      productSlug: productSlug?.trim() || '',
      productId: productId?.trim() || '',
      rating: numRating,
      headline: headline?.trim() || '',
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      status: 'pending', // Requires admin moderation before public display
      verifiedBuyer: true,
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
      review: newReview,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !['approved', 'archived', 'pending'].includes(status)) {
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

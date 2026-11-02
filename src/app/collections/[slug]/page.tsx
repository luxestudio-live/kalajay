import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COLLECTIONS } from '@/data/catalogue';
import CollectionDetailClient from './CollectionDetailClient';

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({
    slug: c.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const collection = COLLECTIONS.find((c) => c.slug === params.slug);
  if (!collection) return {};

  return {
    title: `${collection.name} Collection · Kalajay Atelier`,
    description: collection.description,
    openGraph: {
      title: `${collection.name} Collection · Kalajay Atelier`,
      description: collection.description,
      images: [collection.image],
    },
  };
}

export default function CollectionDetailPage({ params }: { params: { slug: string } }) {
  const collection = COLLECTIONS.find((c) => c.slug === params.slug);
  if (!collection) {
    return notFound();
  }

  return <CollectionDetailClient slug={params.slug} />;
}

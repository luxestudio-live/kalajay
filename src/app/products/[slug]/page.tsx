import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS } from '@/data/catalogue';
import ProductDetailClient from './ProductDetailClient';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = PRODUCTS.find((p) => p.slug === params.slug);
  if (!product) return {};

  return {
    title: `${product.name} · Kalajay Atelier`,
    description: product.description,
    openGraph: {
      title: `${product.name} · Kalajay Atelier`,
      description: product.description,
      images: [product.coverImage],
    },
  };
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = PRODUCTS.find((p) => p.slug === params.slug);
  if (!product) {
    return notFound();
  }

  return <ProductDetailClient slug={params.slug} />;
}

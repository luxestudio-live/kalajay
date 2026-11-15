/**
 * Cloudinary Media & Optimization Utilities for Kalajay Flagship
 * Cloud Name: da6uncyb
 */

export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'da6uncyb';
export const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'kalajay_products';

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit' | 'thumb';
  quality?: 'auto' | 'auto:good' | 'auto:best' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  gravity?: 'auto' | 'center';
}

/**
 * Transforms an image path or public ID into a blazing-fast, auto-compressed Cloudinary URL.
 * Automatically serves modern WebP / AVIF with visually lossless compression (f_auto,q_auto).
 */
export function getOptimizedImageUrl(
  imageSrc: string,
  options: CloudinaryTransformOptions = {}
): string {
  if (!imageSrc) return '';

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity,
  } = options;

  // Build transformation string
  const transformations: string[] = [`f_${format}`, `q_${quality}`];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop && (width || height)) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);

  const transformSegment = transformations.join(',');

  // If already a Cloudinary delivery URL
  if (imageSrc.includes('res.cloudinary.com')) {
    // If it already has /upload/, inject the transforms
    if (imageSrc.includes('/upload/')) {
      return imageSrc.replace(
        '/upload/',
        `/upload/${transformSegment}/`
      );
    }
    return imageSrc;
  }

  // If it's a relative path or public ID (e.g. "kalajay/products/pearl-clutch")
  if (!imageSrc.startsWith('http://') && !imageSrc.startsWith('https://')) {
    const cleanId = imageSrc.startsWith('/') ? imageSrc.slice(1) : imageSrc;
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformSegment}/${cleanId}`;
  }

  // Fallback for third-party URLs (e.g., Unsplash)
  return imageSrc;
}

/**
 * Direct client-side image uploader using Cloudinary Unsigned Preset.
 * Works seamlessly from admin panels, custom studios, or bespoke uploads without exposing API secrets.
 */
export async function uploadToCloudinary(
  file: File | Blob,
  folder = 'kalajay/products'
): Promise<{
  success: boolean;
  url?: string;
  secureUrl?: string;
  publicId?: string;
  error?: string;
}> {
  try {
    // 1. Strict Size Guard: 10 MB Limit
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return {
        success: false,
        error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`,
      };
    }

    // 2. Strict Format Guard: Images Only
    if (file.type) {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/avif',
        'image/heic',
      ];
      if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
        return {
          success: false,
          error: 'Only image files (JPG, PNG, WebP, AVIF, HEIC) are permitted.',
        };
      }
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    if (folder) formData.append('folder', folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await res.json();
    if (res.ok && data.secure_url) {
      return {
        success: true,
        url: data.url,
        secureUrl: data.secure_url,
        publicId: data.public_id,
      };
    }

    return {
      success: false,
      error: data.error?.message || 'Failed to upload image to Cloudinary.',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error uploading to Cloudinary.',
    };
  }
}

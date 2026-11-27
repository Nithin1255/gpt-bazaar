import { API_BASE_URL } from './apiClient';

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;
export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'] as const;
export const MIN_IMAGE_BYTES = 1024;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MIN_IMAGE_DIMENSION = 100;
export const MAX_IMAGE_DIMENSION = 4096;
export const MAX_IMAGE_URL_LENGTH = 1000;

function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('File could not be decoded as a valid image.'));
    };
    img.src = url;
  });
}

export async function validateImageFile(file: File): Promise<{ width: number; height: number }> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (
    !(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type) ||
    !(ALLOWED_EXTENSIONS as readonly string[]).includes(ext)
  ) {
    throw new Error('Unsupported format. Allowed: JPG, PNG, WebP, or AVIF.');
  }
  if (file.size < MIN_IMAGE_BYTES || file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image size must be between 1 KB and 5 MB.');
  }
  const { width, height } = await readDimensions(file);
  if (
    width < MIN_IMAGE_DIMENSION ||
    height < MIN_IMAGE_DIMENSION ||
    width > MAX_IMAGE_DIMENSION ||
    height > MAX_IMAGE_DIMENSION
  ) {
    throw new Error(
      `Image dimensions (${width}×${height}px) must be between ${MIN_IMAGE_DIMENSION}×${MIN_IMAGE_DIMENSION}px and ${MAX_IMAGE_DIMENSION}×${MAX_IMAGE_DIMENSION}px.`
    );
  }
  return { width, height };
}

export function validateImageUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.length > MAX_IMAGE_URL_LENGTH) {
    throw new Error(`Image URL cannot exceed ${MAX_IMAGE_URL_LENGTH} characters.`);
  }
  const parsed = new URL(trimmed);
  if (parsed.protocol !== 'https:') {
    throw new Error('Only secure HTTPS image URLs are allowed.');
  }
  return trimmed;
}

export async function uploadProductImage(
  file: File,
  slugHint: string,
  folder: 'products' | 'categories' = 'products'
): Promise<string> {
  await validateImageFile(file);
  const safeSlug =
    slugHint
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'sku';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  formData.append('slug', safeSlug);

  const res = await fetch(`${API_BASE_URL}/api/v1/uploads/image`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Image upload failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { imageUrl: string };
  return data.imageUrl;
}

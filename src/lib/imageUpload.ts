import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from './firebase';

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'] as const;

export const MIN_IMAGE_BYTES = 1024; // 1 KB
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MIN_IMAGE_DIMENSION = 100; // px
export const MAX_IMAGE_DIMENSION = 4096; // px
export const MAX_IMAGE_URL_LENGTH = 1000; // Matches firestore.rules & firebase-blueprint.json

export interface ValidatedImageMeta {
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
  formatLabel: string;
}

export type ImageValidationResult =
  | { valid: true; meta: ValidatedImageMeta }
  | { valid: false; error: string };

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getExtension(filename: string): string {
  const parts = filename.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

function mimeToExt(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/avif':
      return 'avif';
    default:
      return 'jpg';
  }
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(objectUrl);
      resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('File could not be decoded as a valid image.'));
    };
    img.src = objectUrl;
  });
}

export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const ext = getExtension(file.name);
  const isAllowedMime = (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(file.type);
  const isAllowedExt = (ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(ext);

  if (!isAllowedMime || !isAllowedExt) {
    return {
      valid: false,
      error: `Unsupported format (${file.type || `.${ext || 'unknown'}`}). Allowed formats: JPG, PNG, WebP, or AVIF.`,
    };
  }

  if (file.size < MIN_IMAGE_BYTES) {
    return {
      valid: false,
      error: `File is too small (${formatBytes(file.size)}). Please upload a clear product image at least 1 KB.`,
    };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return {
      valid: false,
      error: `File exceeds the 5 MB limit (${formatBytes(file.size)}). Compress or resize the image before uploading.`,
    };
  }

  try {
    const { width, height } = await readImageDimensions(file);
    if (width < MIN_IMAGE_DIMENSION || height < MIN_IMAGE_DIMENSION) {
      return {
        valid: false,
        error: `Image resolution is too small (${width}×${height} px). Minimum required is ${MIN_IMAGE_DIMENSION}×${MIN_IMAGE_DIMENSION} px.`,
      };
    }
    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      return {
        valid: false,
        error: `Image resolution is too large (${width}×${height} px). Maximum supported is ${MAX_IMAGE_DIMENSION}×${MAX_IMAGE_DIMENSION} px.`,
      };
    }

    return {
      valid: true,
      meta: {
        width,
        height,
        sizeBytes: file.size,
        mimeType: file.type,
        formatLabel: mimeToExt(file.type).toUpperCase(),
      },
    };
  } catch {
    return {
      valid: false,
      error: 'Unable to decode this file as an image. Ensure it is not corrupted or renamed.',
    };
  }
}

export function validateImageUrl(rawUrl: string): { valid: true; normalized: string } | { valid: false; error: string } {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: true, normalized: '' };
  }

  if (trimmed.length > MAX_IMAGE_URL_LENGTH) {
    return {
      valid: false,
      error: `Image URL is too long (${trimmed.length} chars). Maximum allowed is ${MAX_IMAGE_URL_LENGTH} characters.`,
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      error: 'Enter a valid HTTPS image URL (e.g. https://cdn.example.com/tomato.webp).',
    };
  }

  if (parsed.protocol !== 'https:') {
    return {
      valid: false,
      error: 'Only secure HTTPS image URLs (https://...) are permitted.',
    };
  }

  if (!parsed.hostname || !parsed.hostname.includes('.')) {
    return {
      valid: false,
      error: 'Image URL must include a valid public domain name.',
    };
  }

  return { valid: true, normalized: trimmed };
}

function mapStorageError(err: unknown): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code?: unknown }).code)
      : '';

  if (code === 'storage/unauthorized') {
    return 'Firebase Storage denied this upload. Check your Firebase Storage security rules (see storage.rules) or sign in as an admin.';
  }
  if (code === 'storage/bucket-not-found' || code === 'storage/project-not-found') {
    return 'Firebase Storage bucket is not enabled yet for this project. Enable Storage in Firebase Console or paste a direct HTTPS image URL.';
  }
  if (code === 'storage/quota-exceeded') {
    return 'Firebase Storage quota exceeded for this project. Upgrade your plan or provide an external HTTPS image URL.';
  }
  if (code === 'storage/canceled') {
    return 'Image upload was cancelled.';
  }
  if (code === 'storage/retry-limit-exceeded') {
    return 'Upload timed out contacting Firebase Storage. Verify Storage is enabled and CORS/network is reachable, or use an HTTPS URL.';
  }
  return err instanceof Error
    ? `Upload failed: ${err.message}`
    : 'Image upload failed. Please try again or use a direct HTTPS image URL.';
}

export async function uploadImageToFirebaseStorage(
  file: File,
  folder: 'products' | 'categories',
  slugHint: string,
  onProgress?: (percent: number) => void
): Promise<{ downloadUrl: string; storagePath: string; meta: ValidatedImageMeta }> {
  const validation = await validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const safeSlug =
    slugHint
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'item';
  const ext = mimeToExt(file.type);
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const storagePath = `${folder}/${safeSlug}-${uniqueSuffix}.${ext}`;

  const storageRef = ref(storage, storagePath);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000',
      customMetadata: {
        width: String(validation.meta.width),
        height: String(validation.meta.height),
        uploadedBy: 'gpt-bazaar-admin',
      },
    });

    task.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0 && onProgress) {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(pct);
        }
      },
      (error) => {
        reject(new Error(mapStorageError(error)));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(task.snapshot.ref);
          if (downloadUrl.length > MAX_IMAGE_URL_LENGTH) {
            reject(new Error('Generated Firebase Storage URL exceeded maximum allowed length.'));
            return;
          }
          resolve({ downloadUrl, storagePath, meta: validation.meta });
        } catch (err) {
          reject(new Error(mapStorageError(err)));
        }
      }
    );
  });
}

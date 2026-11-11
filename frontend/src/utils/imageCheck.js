// Client-side photo checks with the SAME rules and error codes as the server
// (backend/services/evidence/image.js, backend/errors/catalog.js). The server checks again;
// this only saves a slow upload. Errors are { code } descriptors, translated where shown.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_SIDE_PX = 2000;
// Photos above this size are made smaller in the browser before upload (Batch 4, feature 14):
// faster on slow mobile data. The server re-processes every photo anyway.
export const COMPRESS_FROM_BYTES = 1024 * 1024;
export const ERR_NOT_JPG_PNG = { code: 'PHOTO_NOT_JPG_PNG' };
export const ERR_PDF = { code: 'PHOTO_PDF' };
export const ERR_NOT_IMAGE = { code: 'PHOTO_NOT_IMAGE' };
export const ERR_TOO_LARGE = { code: 'PHOTO_TOO_LARGE' };

const startsWith = (bytes, sig, offset = 0) => sig.every((b, i) => bytes[offset + i] === b);
const ascii = (bytes, from, to) => String.fromCharCode(...bytes.slice(from, to));

// Look at the first bytes ("magic numbers"), not at the file name or the browser's type.
export async function sniffType(file) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) return 'image/png';
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 12) === 'WEBP') return 'image/webp';
  if (ascii(bytes, 0, 4) === '%PDF') return 'application/pdf';
  if (ascii(bytes, 4, 8) === 'ftyp') return 'image/heif-family'; // HEIC, HEIF, AVIF
  // Other picture formats, recognised by their bytes (never by the browser's claimed type).
  if (ascii(bytes, 0, 4) === 'GIF8' || ascii(bytes, 0, 2) === 'BM' || startsWith(bytes, [0x49, 0x49, 0x2a, 0x00]) || startsWith(bytes, [0x4d, 0x4d, 0x00, 0x2a])) {
    return 'image/other';
  }
  return 'unknown';
}

// null when the file may be uploaded as it is, otherwise the error to show.
export async function checkImageType(file) {
  const type = await sniffType(file);
  if (['image/jpeg', 'image/png', 'image/webp'].includes(type)) return null;
  if (type === 'application/pdf') return ERR_PDF;
  if (type.startsWith('image/')) return ERR_NOT_JPG_PNG;
  return ERR_NOT_IMAGE;
}

// Phone photos are often over 4 MB: shrink in the browser (max 2000 px, JPEG quality 0.85),
// no extra package. Returns a smaller File, or null when the browser cannot do it.
export async function shrinkImage(file) {
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return null;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_SIDE_PX / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    if (!blob) return null;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return null;
  }
}

// Full check: { file, shrunk?, before? } ready to upload, or { error }.
export async function prepareImage(file) {
  const typeError = await checkImageType(file);
  if (typeError) return { error: typeError };
  if (file.size > COMPRESS_FROM_BYTES) {
    const smaller = await shrinkImage(file);
    if (smaller && smaller.size < file.size && smaller.size <= MAX_UPLOAD_BYTES) return { file: smaller, shrunk: true, before: file.size };
  }
  if (file.size <= MAX_UPLOAD_BYTES) return { file };
  return { error: ERR_TOO_LARGE };
}

export const formatBytes = (n) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / (1024 * 1024)).toFixed(1)} MB`);

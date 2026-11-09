// Client-side photo checks with the SAME rules and messages as the server
// (backend/services/evidence/image.js). The server checks again; this only saves a slow upload.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_SIDE_PX = 2000;
export const MSG_NOT_JPG_PNG = 'Please upload a JPG or PNG photo.';
export const MSG_PDF = 'PDF files are not accepted. Please upload a JPG or PNG photo of the document.';
export const MSG_NOT_IMAGE = 'This file is not a photo. Please upload a JPG or PNG photo.';
export const MSG_TOO_LARGE = 'The photo is too large. The limit is 4 MB.';

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
  return file.type?.startsWith('image/') ? 'image/other' : 'unknown';
}

// '' when the file may be uploaded as it is, otherwise the message to show.
export async function checkImageType(file) {
  const type = await sniffType(file);
  if (['image/jpeg', 'image/png', 'image/webp'].includes(type)) return '';
  if (type === 'application/pdf') return MSG_PDF;
  if (type.startsWith('image/')) return MSG_NOT_JPG_PNG;
  return MSG_NOT_IMAGE;
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

// Full check: { file } ready to upload, or { error }.
export async function prepareImage(file) {
  const typeError = await checkImageType(file);
  if (typeError) return { error: typeError };
  if (file.size <= MAX_UPLOAD_BYTES) return { file };
  const smaller = await shrinkImage(file);
  if (smaller && smaller.size <= MAX_UPLOAD_BYTES) return { file: smaller, shrunk: true };
  return { error: MSG_TOO_LARGE };
}

export const formatBytes = (n) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / (1024 * 1024)).toFixed(1)} MB`);

// Evidence image pipeline (D-013): real type from the bytes -> sharp processing -> fingerprints.
// The browser's Content-Type and the file name are ignored. The original is never stored.
import { createHash } from 'node:crypto';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import { ALLOWED_IMAGE_TYPES, MAX_INPUT_PIXELS, MAX_SIDE_PX, WEBP_QUALITY } from '../../config/evidence.js';
import { httpError } from '../../utils/httpError.js';


// Throws a 400 with a clear message unless the bytes are a JPEG, PNG or WebP image.
export async function detectImageType(buffer) {
  const type = await fileTypeFromBuffer(buffer);
  if (type && ALLOWED_IMAGE_TYPES.includes(type.mime)) return type.mime;
  if (type?.mime === 'application/pdf') throw httpError(400, 'PHOTO_PDF');
  if (type?.mime?.startsWith('image/')) throw httpError(400, 'PHOTO_NOT_JPG_PNG'); // HEIC, AVIF, GIF, ...
  throw httpError(400, 'PHOTO_NOT_IMAGE');
}

// Auto-rotate (EXIF orientation), fit inside 2000 x 2000 without enlarging, WebP quality 80.
// sharp keeps no metadata unless asked, so EXIF (including GPS) and ICC data are dropped.
export async function processImage(buffer) {
  try {
    const { data, info } = await sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS, failOn: 'warning' })
      .autoOrient()
      .resize({ width: MAX_SIDE_PX, height: MAX_SIDE_PX, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer({ resolveWithObject: true });
    return { data, width: info.width, height: info.height, size: info.size, contentType: 'image/webp' };
  } catch (err) {
    if (/pixel limit/i.test(String(err.message))) throw httpError(400, 'PHOTO_TOO_MANY_PIXELS');
    throw httpError(400, 'PHOTO_UNREADABLE');
  }
}

export const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

// dHash: 9 x 8 greyscale; each bit = "is this pixel brighter than its right neighbour?"
// 64 bits -> 16 hex characters. Similar-looking images give hashes with a small Hamming distance.
export async function dHash(buffer) {
  const pixels = await sharp(buffer).greyscale().resize(9, 8, { fit: 'fill' }).raw().toBuffer();
  let bits = 0n;
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const left = pixels[row * 9 + col];
      const right = pixels[row * 9 + col + 1];
      bits = (bits << 1n) | (left > right ? 1n : 0n);
    }
  }
  return bits.toString(16).padStart(16, '0');
}

export function hammingDistance(hexA, hexB) {
  let x = BigInt(`0x${hexA}`) ^ BigInt(`0x${hexB}`);
  let count = 0;
  while (x) {
    count += Number(x & 1n);
    x >>= 1n;
  }
  return count;
}

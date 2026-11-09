// Real, small test images made with sharp inside the tests (no files on disk, no real people).
import sharp from 'sharp';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A random-looking picture: every seed gives a different perceptual hash.
export function rawPattern(seed, width = 64, height = 48) {
  const rand = rng(seed);
  const blocks = Array.from({ length: 64 }, () => Math.floor(rand() * 256));
  const data = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const v = blocks[Math.floor((y * 8) / height) * 8 + Math.floor((x * 8) / width)];
      const i = (y * width + x) * 3;
      data[i] = v;
      data[i + 1] = (v * 3) % 256;
      data[i + 2] = 255 - v;
    }
  }
  return sharp(data, { raw: { width, height, channels: 3 } });
}

export const jpeg = (seed, w, h) => rawPattern(seed, w, h).jpeg({ quality: 90 }).toBuffer();
export const png = (seed, w, h) => rawPattern(seed, w, h).png().toBuffer();

// A JPEG whose EXIF contains a GPS position (Rawalpindi-ish, synthetic) and a camera field.
export const jpegWithGps = (seed) =>
  rawPattern(seed)
    .jpeg({ quality: 90 })
    .withExif({ IFD0: { Make: 'TestCamera' }, IFD3: { GPSLatitudeRef: 'N', GPSLatitude: '33/1 36/1 0/1', GPSLongitudeRef: 'E', GPSLongitude: '73/1 4/1 0/1' } })
    .toBuffer();

// True if an EXIF block has a GPS IFD pointer (tag 0x8825), in either byte order.
export function exifHasGps(exif) {
  if (!exif) return false;
  return exif.includes(Buffer.from([0x25, 0x88])) || exif.includes(Buffer.from([0x88, 0x25]));
}

// A minimal HEIC header (an iPhone's default format): enough for content-type detection.
export const heicHeader = () =>
  Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from('ftypheic'), Buffer.from([0, 0, 0, 0]), Buffer.from('mif1heic'), Buffer.alloc(256)]);

export const pdfBytes = () => Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<<>>\n%%EOF\n');

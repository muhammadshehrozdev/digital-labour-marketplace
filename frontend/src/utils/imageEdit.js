// Crop and rotate a photo in the browser (Batch 4, feature 15). Own canvas code, no package.
// The server still checks the bytes, removes metadata and re-encodes every upload; this only lets
// the worker cut away the table edge or turn a sideways certificate.
//   crop: { left, right, top, bottom } as fractions 0..0.45 of the turned picture
//   rotation: 0, 90, 180 or 270 degrees clockwise
export const MAX_CROP = 0.45;
export const ROTATIONS = [0, 90, 180, 270];

export const nextRotation = (rotation, by) => ((((rotation + by) % 360) + 360) % 360);

// Size of the picture after turning and cropping (whole pixels, at least 1).
export function outputSize(width, height, rotation, crop) {
  const turned = rotation % 180 === 0 ? { w: width, h: height } : { w: height, h: width };
  const keepW = Math.max(0.1, 1 - crop.left - crop.right);
  const keepH = Math.max(0.1, 1 - crop.top - crop.bottom);
  return { width: Math.max(1, Math.round(turned.w * keepW)), height: Math.max(1, Math.round(turned.h * keepH)) };
}

// Draws the turned and cropped picture on `canvas`. source: an image or ImageBitmap.
export function drawEdited(canvas, source, rotation, crop, maxSide = Infinity) {
  const w = source.width;
  const h = source.height;
  const out = outputSize(w, h, rotation, crop);
  const scale = Math.min(1, maxSide / Math.max(out.width, out.height));
  canvas.width = Math.max(1, Math.round(out.width * scale));
  canvas.height = Math.max(1, Math.round(out.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  const turnedW = rotation % 180 === 0 ? w : h;
  const turnedH = rotation % 180 === 0 ? h : w;
  ctx.save();
  ctx.scale(scale, scale);
  // move so that the kept part starts at 0,0, then turn around the picture's centre
  ctx.translate(-crop.left * turnedW, -crop.top * turnedH);
  ctx.translate(turnedW / 2, turnedH / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(source, -w / 2, -h / 2);
  ctx.restore();
  return true;
}

export function canvasToFile(canvas, name, quality = 0.9) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ? new File([blob], name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }) : null), 'image/jpeg', quality);
  });
}

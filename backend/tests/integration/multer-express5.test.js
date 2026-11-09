// Phase 1: multer 2.x + Express 5 compatibility check (no official page confirms it).
// A temporary route that exists only inside this test; nothing is saved to disk.
import { describe, test, expect } from 'vitest';
import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import request from 'supertest';

const MAX_BYTES = 1024 * 1024; // 1 MB for this test only (the real limit comes in Phase 5)

const buildApp = () => {
  const app = express();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_BYTES, files: 1 },
  });

  app.post('/test-upload', upload.single('image'), (req, res) => {
    res.json({
      fieldname: req.file.fieldname,
      size: req.file.size,
      isBuffer: Buffer.isBuffer(req.file.buffer),
      title: req.body.title,
    });
  });

  // Express 5 sends errors from middleware (multer) to this error handler.
  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ code: err.code });
    }
    return next(err);
  });
  return app;
};

const tinyPng = () =>
  sharp({ create: { width: 8, height: 8, channels: 3, background: '#4f46e5' } }).png().toBuffer();

describe('multer 2 on Express 5', () => {
  test('receives a small PNG in memory together with a text field', async () => {
    const png = await tinyPng();
    const res = await request(buildApp())
      .post('/test-upload')
      .field('title', 'Wiring job')
      .attach('image', png, { filename: 'tiny.png', contentType: 'image/png' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ fieldname: 'image', size: png.length, isBuffer: true, title: 'Wiring job' });
  });

  test('a file over the size limit reaches the error handler as LIMIT_FILE_SIZE (413)', async () => {
    const tooBig = Buffer.alloc(MAX_BYTES + 1, 0);
    const res = await request(buildApp())
      .post('/test-upload')
      .attach('image', tooBig, { filename: 'big.bin', contentType: 'application/octet-stream' });

    expect(res.status).toBe(413);
    expect(res.body).toEqual({ code: 'LIMIT_FILE_SIZE' });
  });
});

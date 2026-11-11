// Direct tests of the error handler and the validator for the rare branches the integration tests
// do not reach (Batch 4 coverage, Part 6.3). Each case is a real kind of bad request or failure.
import { describe, test, expect, vi } from 'vitest';
import mongoose from 'mongoose';
import multer from 'multer';
import { z } from 'zod';
import { errorHandler, notFound, GENERIC_500 } from '../../middleware/errorHandler.js';
import { validate, issueToError } from '../../middleware/validate.js';
import { httpError } from '../../utils/httpError.js';

function fakeRes() {
  const res = { statusCode: 200, body: undefined, headersSent: false };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
}
const req = { method: 'POST', originalUrl: '/api/test' };
const handle = (err) => {
  const res = fakeRes();
  errorHandler(err, req, res, () => {});
  return res;
};

describe('error handler', () => {
  test('bad JSON and a too large body', () => {
    expect(handle({ type: 'entity.parse.failed' })).toMatchObject({ statusCode: 400, body: { code: 'INVALID_JSON' } });
    expect(handle({ type: 'entity.too.large' })).toMatchObject({ statusCode: 413, body: { code: 'BODY_TOO_LARGE' } });
  });

  test('upload problems from multer', () => {
    expect(handle(new multer.MulterError('LIMIT_FILE_SIZE'))).toMatchObject({ statusCode: 413, body: { code: 'PHOTO_TOO_LARGE' } });
    expect(handle(new multer.MulterError('LIMIT_UNEXPECTED_FILE'))).toMatchObject({ statusCode: 400, body: { code: 'PHOTO_FIELD' } });
    expect(handle(new multer.MulterError('LIMIT_FILE_COUNT'))).toMatchObject({ statusCode: 400, body: { code: 'PHOTO_FIELD' } });
    expect(handle(new multer.MulterError('LIMIT_FIELD_COUNT'))).toMatchObject({ statusCode: 400, body: { code: 'UPLOAD_FORM_INVALID' } });
    expect(handle(new Error('Unexpected end of form'))).toMatchObject({ statusCode: 400, body: { code: 'UPLOAD_INCOMPLETE' } });
  });

  test('our own errors keep their status and code; other exposed 4xx errors get a generic code', () => {
    expect(handle(httpError(404, 'USER_NOT_FOUND'))).toMatchObject({ statusCode: 404, body: { code: 'USER_NOT_FOUND' } });
    const other = Object.assign(new Error('raw library text'), { expose: true, status: 415 });
    const res = handle(other);
    expect(res).toMatchObject({ statusCode: 415, body: { code: 'INVALID_VALUE' } });
    expect(JSON.stringify(res.body)).not.toContain('raw library text');
  });

  test('database errors that are the caller\'s fault: duplicate, validation, cast (field names only, no values)', () => {
    expect(handle({ code: 11000, keyValue: { email: 'secret@example.com' } })).toMatchObject({ statusCode: 409, body: { code: 'DUPLICATE_RECORD' } });
    const validation = new mongoose.Error.ValidationError();
    validation.addError('phone', new mongoose.Error.ValidatorError({ path: 'phone', message: 'bad', value: '0300-SECRET' }));
    const res = handle(validation);
    expect(res).toMatchObject({ statusCode: 400, body: { code: 'DB_VALIDATION' } });
    expect(JSON.stringify(res.body)).not.toContain('SECRET');
    expect(handle(new mongoose.Error.CastError('ObjectId', 'xyz', '_id'))).toMatchObject({ statusCode: 400, body: { code: 'INVALID_ID_OR_VALUE' } });
  });

  test('anything else: a generic 500, details only in the server log', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = handle(new Error('database password is hunter2'));
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ code: 'SERVER_ERROR', message: GENERIC_500 });
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  test('when the answer has already started, the error goes to Express', () => {
    const res = fakeRes();
    res.headersSent = true;
    const next = vi.fn();
    const err = new Error('late');
    errorHandler(err, req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  test('unknown routes get a JSON 404', () => {
    const res = fakeRes();
    notFound(req, res);
    expect(res).toMatchObject({ statusCode: 404, body: { code: 'ROUTE_NOT_FOUND' } });
  });
});

describe('validate', () => {
  const schema = z.object({ name: z.string().max(3), n: z.number(), list: z.array(z.string()).min(1).max(1), pick: z.enum(['a']), mail: z.email(), flag: z.boolean() }).strict();
  const run = (source, input) => {
    const res = fakeRes();
    const next = vi.fn();
    const r = { [source]: input };
    validate(schema, source)(r, res, next);
    return { res, next, r };
  };

  test('a missing body is a clear 400', () => {
    expect(run('body', undefined).res).toMatchObject({ statusCode: 400, body: { code: 'BODY_REQUIRED' } });
  });

  test('each kind of problem gets a stable code with the field and limits', () => {
    const { res } = run('body', { name: 'long', n: 'x', list: [], pick: 'z', mail: 'nope', flag: 'yes', extra: 1 });
    const codes = Object.fromEntries(res.body.errors.map((e) => [e.field || e.params.key, e.code]));
    expect(codes).toMatchObject({ name: 'TEXT_TOO_LONG', n: 'NUMBER_REQUIRED', list: 'LIST_TOO_SHORT', pick: 'NOT_ALLOWED', mail: 'INVALID_FORMAT', flag: 'WRONG_TYPE' });
    expect(res.body.errors.some((e) => e.code === 'UNKNOWN_FIELD' && e.params.key === 'extra')).toBe(true);
    expect(res.body.errors.find((e) => e.field === 'name').params).toMatchObject({ max: 3, fieldKey: 'name' });
    const tooMany = run('body', { name: 'ab', n: 1, list: ['a', 'b'], pick: 'a', mail: 'a@b.co', flag: true });
    expect(tooMany.res.body.errors[0]).toMatchObject({ field: 'list', code: 'LIST_TOO_LONG' });
  });

  test('good input is stored on req.validated for that source, next to other sources', () => {
    const res = fakeRes();
    const next = vi.fn();
    const r = { query: { page: '2' }, validated: { params: { id: 'x' } } };
    validate(z.object({ page: z.string() }).strict(), 'query')(r, res, next);
    expect(next).toHaveBeenCalled();
    expect(r.validated).toEqual({ params: { id: 'x' }, query: { page: '2' } });
  });

  test('issueToError: a custom message that is not a known code becomes a generic one', () => {
    const e = issueToError({ code: 'custom', message: 'not a code', path: ['x'] }, 'body');
    expect(e).toMatchObject({ field: 'x', code: 'INVALID_VALUE' });
    const top = issueToError({ code: 'too_big', origin: 'number', maximum: 5, message: 'x', path: [] }, 'query');
    expect(top).toMatchObject({ field: 'query', code: 'NUMBER_TOO_LARGE', params: { max: 5 } });
    const small = issueToError({ code: 'too_small', origin: 'number', minimum: 1, message: 'x', path: ['n'] }, 'body');
    expect(small.code).toBe('NUMBER_TOO_SMALL');
  });
});

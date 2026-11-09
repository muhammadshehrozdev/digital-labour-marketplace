// An error with an HTTP status, a stable machine CODE (errors/catalog.js) and a safe English
// message. Throw it from a controller; the central error handler turns it into JSON:
//   { code, message, params? }
import { formatError, isErrorCode } from '../errors/catalog.js';

export class HttpError extends Error {
  constructor(status, code, params = {}) {
    if (!isErrorCode(code)) throw new Error(`Unknown error code "${code}" (add it to errors/catalog.js)`);
    super(formatError(code, params));
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.params = params;
    this.expose = true;
  }
}

export const httpError = (status, code, params) => new HttpError(status, code, params);

// The JSON body for an error code (used by middleware that answers directly).
export const errorBody = (code, params) => {
  const body = { code, message: formatError(code, params) };
  if (params && Object.keys(params).length) body.params = params;
  return body;
};

// An error with an HTTP status and a message that is safe to show to the user.
// Throw it from a controller; the central error handler turns it into JSON.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.expose = true;
  }
}

export const httpError = (status, message) => new HttpError(status, message);

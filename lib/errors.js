export class TumblrError extends Error {
  constructor(message, { status, code, meta, errors, rateLimit, cause } = {}) {
    super(message, cause ? { cause } : undefined);

    this.name = 'TumblrError';
    this.status = status;
    this.code = code;
    this.meta = meta;
    this.errors = errors;
    this.rateLimit = rateLimit;
  }
}

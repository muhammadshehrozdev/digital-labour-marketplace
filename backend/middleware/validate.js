// validate(schema, source): checks req.body, req.query or req.params with a zod schema.
// - Bad input -> 400 with a clear message (audit M1-5).
// - Good input -> the cleaned copy is stored on req.validated[source].
//   (Express 5 does not allow reassigning req.query, so we never change the original.)
export const validate = (schema, source = 'body') => (req, res, next) => {
  const input = req[source];
  if (source === 'body' && input === undefined) {
    return res.status(400).json({ message: 'Request body is required (send JSON)' });
  }
  const result = schema.safeParse(input ?? {});
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || source,
      message: issue.message,
    }));
    const message = errors.map((e) => `${e.field}: ${e.message}`).join('; ');
    return res.status(400).json({ message, errors });
  }
  req.validated = { ...(req.validated || {}), [source]: result.data };
  return next();
};

// validate(schema, source): checks req.body, req.query or req.params with a zod schema.
// - Bad input -> 400 with a clear message (audit M1-5) AND a stable code per problem
//   (Batch 3): { code, params, message, errors: [{ field, code, params, message }] }.
//   Schemas give codes from errors/catalog.js as their messages; anything else gets a
//   generic code from the kind of problem (too long, wrong type, unknown field, ...).
// - Good input -> the cleaned copy is stored on req.validated[source].
//   (Express 5 does not allow reassigning req.query, so we never change the original.)
import { isErrorCode, formatError, fieldLabel } from '../errors/catalog.js';
import { errorBody } from '../utils/httpError.js';

function genericCode(issue) {
  switch (issue.code) {
    case 'unrecognized_keys':
      return 'UNKNOWN_FIELD';
    case 'invalid_type':
      return issue.expected === 'string' ? 'TEXT_MUST_BE_TEXT' : issue.expected === 'number' ? 'NUMBER_REQUIRED' : 'WRONG_TYPE';
    case 'too_big':
      return issue.origin === 'string' ? 'TEXT_TOO_LONG' : issue.origin === 'array' ? 'LIST_TOO_LONG' : 'NUMBER_TOO_LARGE';
    case 'too_small':
      return issue.origin === 'string' ? 'TEXT_TOO_SHORT' : issue.origin === 'array' ? 'LIST_TOO_SHORT' : 'NUMBER_TOO_SMALL';
    case 'invalid_value':
      return 'NOT_ALLOWED';
    case 'invalid_format':
      return 'INVALID_FORMAT';
    default:
      return 'INVALID_VALUE';
  }
}

export function issueToError(issue, source) {
  const fieldPath = issue.path.join('.') || source;
  const fieldKey = [...issue.path].reverse().find((p) => typeof p === 'string') ?? source;
  const code = isErrorCode(issue.message) ? issue.message : genericCode(issue);
  const params = { field: fieldLabel(fieldKey), fieldKey };
  if (issue.maximum !== undefined) params.max = Number(issue.maximum);
  if (issue.minimum !== undefined) params.min = Number(issue.minimum);
  if (issue.keys?.length) params.key = issue.keys[0];
  return { field: fieldPath, code, params, message: formatError(code, params) };
}

export const validate = (schema, source = 'body') => (req, res, next) => {
  const input = req[source];
  if (source === 'body' && input === undefined) return res.status(400).json(errorBody('BODY_REQUIRED'));
  const result = schema.safeParse(input ?? {});
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issueToError(issue, source));
    const message = errors.map((e) => `${e.field}: ${e.message}`).join('; ');
    return res.status(400).json({ code: errors[0].code, params: errors[0].params, message, errors });
  }
  req.validated = { ...(req.validated || {}), [source]: result.data };
  return next();
};

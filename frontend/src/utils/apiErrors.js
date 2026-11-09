// Turn an API error into something the page can translate later (so a language switch also
// changes errors already on screen). Show it with te() from useT().
//   server error -> { code, params, message }  (code from backend/errors/catalog.js)
//   text only    -> { message }  (an answer without a code, e.g. from a proxy: shown as it is)
//   no answer    -> { key: 'errors.network' }
//   other        -> { key: fallbackKey }
export function apiError(err, fallbackKey = 'errors.generic') {
  if (!err?.response) return { key: 'errors.network' };
  const data = err.response.data;
  if (data && typeof data === 'object' && typeof data.code === 'string') {
    return { code: data.code, params: data.params, message: data.message };
  }
  if (data && typeof data === 'object' && typeof data.message === 'string' && data.message) return { message: data.message };
  return { key: fallbackKey };
}

// { fieldName: error } for showing server validation errors next to the right field.
export function apiFieldErrors(err) {
  const list = err?.response?.data?.errors;
  if (!Array.isArray(list)) return {};
  const out = {};
  for (const { field, code, params, message } of list) {
    const key = String(field).split('.')[0];
    if (!out[key]) out[key] = code ? { code, params, message } : message ? { message } : { key: 'errors.generic' };
  }
  return out;
}

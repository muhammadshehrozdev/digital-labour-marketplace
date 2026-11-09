// Turn an API error into words for the user. The server sends { message, errors?: [{ field, message }] }.
export function apiMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (!err?.response) return 'Could not reach the server. Check your internet connection and try again.';
  return err.response.data?.message || fallback;
}

// { fieldName: message } for showing server validation errors next to the right field.
export function apiFieldErrors(err) {
  const list = err?.response?.data?.errors;
  if (!Array.isArray(list)) return {};
  const out = {};
  for (const { field, message } of list) {
    const key = String(field).split('.')[0];
    if (!out[key]) out[key] = message;
  }
  return out;
}

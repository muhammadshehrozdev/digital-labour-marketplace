// CSRF protection (decision D-006). CSRF = another website making the user's browser
// send a request to our API with our login cookie attached.
// For POST/PUT/PATCH/DELETE we reject the request when the browser tells us it came
// from somewhere else:
//   - Origin header present but not in our allow-list (CLIENT_ORIGIN) -> 403
//   - no Origin, but Sec-Fetch-Site says "cross-site" or "same-site" -> 403
// Requests without either header do not come from a modern browser (e.g. curl, tests);
// they cannot carry a victim's cookie automatically, so they are allowed.
// SameSite=Strict on the cookie is a second layer, not the only one (OWASP).
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function requireTrustedOrigin(allowedOrigins) {
  const allowed = new Set(allowedOrigins);
  return (req, res, next) => {
    if (SAFE_METHODS.has(req.method)) return next();

    const origin = req.headers.origin;
    if (origin !== undefined) {
      if (allowed.has(origin)) return next();
      return res.status(403).json({ message: 'Request blocked: it did not come from our website.' });
    }

    const site = req.headers['sec-fetch-site'];
    if (site === 'cross-site' || site === 'same-site') {
      return res.status(403).json({ message: 'Request blocked: it did not come from our website.' });
    }
    return next();
  };
}

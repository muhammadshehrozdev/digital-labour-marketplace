// Vercel entry point (backend project). backend/vercel.json sends every request here; Express then
// routes on the original path (/api/auth/login, ...). server.js checks the settings first (and refuses
// to start with a clear message if one is missing) and does not listen on a port when VERCEL is set.
export { default } from '../server.js';

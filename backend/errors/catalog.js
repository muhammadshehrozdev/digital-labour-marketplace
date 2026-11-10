// Every error the API can send has a stable machine CODE (Batch 3, Part 3.2). The English text
// below is the `message` (for logs, API docs and old clients); the website shows its own
// translation of the code in English, Urdu or Roman Urdu (frontend/src/i18n, keys errors.CODE).
// Templates use {name} parameters. Do not change a code once it is in use.

export const ERRORS = Object.freeze({
  // ---- generic validation (built by middleware/validate.js from zod issues) ----
  BODY_REQUIRED: 'Request body is required (send JSON)',
  INVALID_JSON: 'Request body is not valid JSON',
  BODY_TOO_LARGE: 'Request body is too large',
  UNKNOWN_FIELD: 'Unrecognized key: "{key}"',
  WRONG_TYPE: '{field}: wrong type of value',
  TEXT_MUST_BE_TEXT: '{field} must be text',
  ONE_VALUE: '{field} must be one text value',
  TEXT_TOO_SHORT: '{field} must be at least {min} characters',
  TEXT_TOO_LONG: '{field} must be at most {max} characters',
  TEXT_EMPTY_ITEM: '{field} cannot be empty',
  LIST_TOO_SHORT: 'Choose at least {min} for {field}',
  LIST_TOO_LONG: 'At most {max} items for {field}',
  NUMBER_REQUIRED: '{field} must be a number',
  WHOLE_NUMBER: '{field} must be a whole number',
  NOT_NEGATIVE: '{field} cannot be negative',
  NUMBER_TOO_SMALL: '{field} must be at least {min}',
  NUMBER_TOO_LARGE: '{field} must be at most {max}',
  RATE_TOO_HIGH: '{field} is too high',
  NOT_ALLOWED: '{field}: this value is not allowed',
  INVALID_FORMAT: '{field}: wrong format',
  INVALID_VALUE: '{field}: invalid value',
  ID_INVALID: 'Invalid id',

  // ---- accounts and sessions ----
  NAME_REQUIRED: 'Name is required',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Email address is not valid',
  PHONE_REQUIRED: 'Phone number is required',
  PHONE_INVALID: 'Phone must be a Pakistani mobile number like 0300 1234567',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_TOO_SHORT: 'Password must be at least 15 characters. Tip: use 4 or more easy words with spaces, in Roman Urdu or English',
  PASSWORD_TOO_LONG: 'Password is too long (max 72 bytes; an Urdu letter counts as 2 bytes)',
  PASSWORD_ONLY_SPACES: 'Password cannot be only spaces',
  ROLE_INVALID: 'Role must be worker or customer',
  LANGUAGE_INVALID: 'Language must be en, ur or ur-Latn',
  THEME_INVALID: 'Theme must be light, dark or system',
  TEXT_SIZE_INVALID: 'Text size must be small, normal or large',
  PREFERENCES_EMPTY: 'Send at least one setting to change',
  EMAIL_TAKEN: 'This email is already registered. Please log in instead.',
  LOGIN_FAILED: 'Email or password is incorrect. After 5 wrong tries, login is paused for 15 minutes.',
  NOT_LOGGED_IN: 'Please log in first.',
  SESSION_ENDED: 'Your session has ended. Please log in again.',
  FORBIDDEN: 'You do not have permission for this action.',
  CSRF_BLOCKED: 'Request blocked: it did not come from our website.',
  RATE_LIMIT_AUTH: 'Too many failed attempts from this network. Please wait 15 minutes and try again.',
  RATE_LIMIT_UPLOAD: 'Too many uploads from this network. Please wait 15 minutes and try again.',

  // ---- worker profile (Module 1) ----
  CNIC_INVALID: 'CNIC must look like 12345-1234567-1',
  CATEGORY_INVALID: 'Category must be one of the listed trades',
  EXPERIENCE_WHOLE: 'Experience must be whole years',
  EXPERIENCE_TOO_HIGH: 'Experience must be 60 years or less',
  AVAILABILITY_INVALID: 'Availability must be Available, Busy or Offline',
  PROFILE_NOT_CREATED: 'You have not created your worker profile yet.',
  CNIC_TAKEN: 'This CNIC is already linked to another account. If it is yours, please contact the admin.',
  WORKER_NOT_FOUND: 'Worker not found',
  WORKER_ID_INVALID: 'Worker ID must look like DLM-2026-000123',

  // ---- directory and admin filters ----
  CATEGORY_UNKNOWN: 'Unknown category',
  AVAILABILITY_UNKNOWN: 'Unknown availability',
  STATUS_UNKNOWN: 'Unknown status',
  TYPE_UNKNOWN: 'Unknown type',
  ACTION_UNKNOWN: 'Unknown action',
  IDENTITY_FILTER_INVALID: 'identity must be all or verified',
  SKILLS_FILTER_INVALID: 'skills must be all or verified',
  DUPLICATES_FILTER_INVALID: 'duplicates must be "true"',
  DATE_INVALID: 'Date must look like 2026-11-09',
  DATE_NOT_REAL: 'Not a real date',

  // ---- identity review (admin) ----
  IDENTITY_STATUS_INVALID: 'Status must be Verified or Rejected',
  NOTE_REQUIRED: 'A note is required',
  IDENTITY_NOTE_TOO_SHORT: 'Please write a note of at least 5 characters (how the CNIC was checked)',
  WORKER_PROFILE_NOT_FOUND: 'Worker profile not found',
  IDENTITY_NEEDS_CNIC: 'This worker has not saved a CNIC yet, so identity cannot be verified.',
  IDENTITY_CHANGED: 'Someone else changed this worker just now. Please reload and try again.',
  NO_CNIC_ON_FILE: 'This worker has no CNIC on file.',
  CNIC_UNREADABLE: 'The stored CNIC cannot be read (wrong key or damaged data). Ask the worker to enter it again.',

  // ---- skills (Module 2) ----
  TEXT_EMPTY: 'Please write a few words about your work',
  INPUT_MODE_INVALID: 'inputMode must be text or voice',
  SKILL_UNKNOWN: 'Unknown skill. Choose a skill from the list.',
  SKILL_CHOOSE_ONE: 'Choose at least one skill',
  ADDED_VIA_INVALID: 'addedVia must be extractor or manual',
  SKILL_ID_INVALID: 'Invalid skill id',
  SKILL_LIMIT: 'At most {max} skills per worker',
  CUSTOM_SKILL_LATIN: 'Please write the skill name in English letters (a-z) for now',
  CUSTOM_SKILL_LIMIT: 'At most {max} custom skills',
  SKILL_NOT_ON_PROFILE: 'This skill is not on your profile',
  SKILL_HAS_REVIEWED_PROOF: 'This skill has proof that an admin already reviewed, so it cannot be removed. Please contact the admin.',

  // ---- evidence (Module 3) ----
  SKILL_CHOOSE_OWN: 'Choose one of your skills',
  EVIDENCE_TYPE_INVALID: 'Choose the kind of proof: certificate, work photo or reference letter',
  CONSENT_REQUIRED: 'Please tick the consent box before uploading',
  PHOTO_REQUIRED: 'Please choose a photo to upload.',
  PHOTO_TOO_LARGE: 'The photo is too large. The limit is 4 MB.',
  PHOTO_FIELD: 'Send one photo in the "image" field.',
  UPLOAD_FORM_INVALID: 'The upload form is not valid.',
  UPLOAD_INCOMPLETE: 'The upload was not complete. Please try again.',
  PHOTO_NOT_JPG_PNG: 'Please upload a JPG or PNG photo.',
  PHOTO_PDF: 'PDF files are not accepted. Please upload a JPG or PNG photo of the document.',
  PHOTO_NOT_IMAGE: 'This file is not a photo. Please upload a JPG or PNG photo.',
  PHOTO_UNREADABLE: 'The photo could not be read. Please take the photo again.',
  PHOTO_TOO_MANY_PIXELS: 'The photo has too many pixels. Please use a normal phone photo.',
  PROOF_SKILL_NOT_ON_PROFILE: 'You can add proof only for a skill on your profile.',
  PROOF_LIMIT_SKILL: 'At most {max} proof items per skill. Delete one first.',
  PROOF_LIMIT_TOTAL: 'At most {max} proof items in total.',
  PHOTO_DUPLICATE: 'You already uploaded this photo for this skill.',
  PHOTO_NOT_FOUND: 'Photo not found',
  PROOF_NOT_FOUND: 'Proof item not found',
  PROOF_FAKE_CANNOT_DELETE: 'An admin marked this item as a suspected fake. It cannot be deleted. Please contact the admin.',
  PROOF_REVIEWED_CANNOT_DELETE: 'Reviewed items that were approved or revoked cannot be deleted. Please contact the admin.',
  REASON_CODE_INVALID: 'Choose a reason: unclear, not relevant, wrong skill or other',
  REASON_REQUIRED_TO_REJECT: 'A reason is required to reject',
  REASON_OTHER_NEEDS_WORDS: 'Write the reason (at least 5 characters)',
  WRITTEN_REASON_REQUIRED: 'A written reason (at least 5 characters) is required',
  REASON_CODE_ONLY_FOR_REJECT: 'A reason code is only used to reject',
  TRANSITION_INVALID: 'You cannot {verb} an item that is {state}.',
  PROOF_CHANGED: 'Someone else reviewed this item just now. Please reload.',

  // ---- server ----
  ROUTE_NOT_FOUND: 'Route not found',
  DUPLICATE_RECORD: 'This record already exists',
  DB_VALIDATION: 'Invalid value for: {fields}',
  INVALID_ID_OR_VALUE: 'Invalid id or value',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again in a minute.',
  SERVER_ERROR: 'Something went wrong on the server. Please try again later.',
});

export const ERROR_CODES = Object.freeze(Object.keys(ERRORS));

// English names of request fields, used in generic messages ({field}). The website has its own
// translated names (fields.<key> in the dictionaries).
export const FIELD_LABELS = Object.freeze({
  name: 'Name', email: 'Email', phone: 'Phone number', password: 'Password', role: 'Role',
  occupation: 'Occupation', category: 'Category', experienceYears: 'Experience', hourlyRate: 'Hourly rate',
  dailyRate: 'Daily rate', city: 'City', address: 'Address', whatsappNumber: 'WhatsApp number',
  emergencyContact: 'Emergency contact', cnicNumber: 'CNIC', languages: 'Language', availability: 'Availability',
  bio: 'Bio', workHistory: 'Work history', jobTitle: 'Job title', clientOrEmployer: 'Client / location',
  duration: 'Duration', description: 'Description', search: 'Search text', q: 'Search text', text: 'Text',
  sourceText: 'Text', skillIds: 'Skill', skillId: 'Skill', title: 'Title', note: 'Note', page: 'Page',
  limit: 'Limit', status: 'Status', action: 'Action', from: 'From date', to: 'To date', type: 'Type',
  identity: 'identity', skills: 'skills', duplicates: 'duplicates', consent: 'Consent', inputMode: 'inputMode',
  addedVia: 'addedVia', reasonCode: 'Reason', preferredLanguage: 'Language', preferredTheme: 'Theme', preferredTextSize: 'Text size', id: 'Id', workerIdCode: 'Worker ID',
});

export const isErrorCode = (value) => typeof value === 'string' && Object.prototype.hasOwnProperty.call(ERRORS, value);

// Fill {name} placeholders. Unknown placeholders stay visible (easier to spot in tests).
export function formatError(code, params = {}) {
  const template = ERRORS[code] ?? code;
  return template.replace(/\{(\w+)\}/g, (all, key) => (params[key] !== undefined ? String(params[key]) : all));
}

export const fieldLabel = (key) => FIELD_LABELS[key] ?? key;

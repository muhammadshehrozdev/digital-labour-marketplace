// Values, checks and request body for the "About you" form (same rules as the server).
// Checks return dictionary keys (translated where they are shown).
const PHONE = /^(\+92|0092|0)3\d{9}$/;
const clean = (v) => String(v ?? '').replace(/[\s-]/g, '');

export function aboutValuesFrom(profile, user) {
  return {
    name: profile?.user?.name ?? user?.name ?? '',
    phone: profile?.user?.phone ?? user?.phone ?? '',
    whatsappNumber: profile?.whatsappNumber ?? '',
    cnicNumber: '',
    city: profile?.city ?? '',
    address: profile?.address ?? '',
    emergencyContact: profile?.emergencyContact ?? '',
    languages: (profile?.languages ?? ['Urdu']).join(', '),
  };
}

export function validateAbout(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = 'validation.nameShort';
  if (!PHONE.test(clean(v.phone))) e.phone = 'validation.phone';
  if (v.whatsappNumber.trim() && !PHONE.test(clean(v.whatsappNumber))) e.whatsappNumber = 'validation.whatsapp';
  if (v.cnicNumber.trim() && !/^\d{5}-?\d{7}-?\d$/.test(v.cnicNumber.trim())) e.cnicNumber = 'validation.cnic';
  if (v.city.trim().length < 2) e.city = 'validation.city';
  return e;
}

export function aboutPayload(v) {
  const payload = {
    name: v.name.trim(),
    phone: v.phone.trim(),
    whatsappNumber: v.whatsappNumber.trim(),
    city: v.city.trim(),
    address: v.address.trim(),
    emergencyContact: v.emergencyContact.trim(),
    languages: v.languages.split(',').map((s) => s.trim()).filter(Boolean),
  };
  if (v.cnicNumber.trim()) payload.cnicNumber = v.cnicNumber.trim(); // only when typed
  return payload;
}

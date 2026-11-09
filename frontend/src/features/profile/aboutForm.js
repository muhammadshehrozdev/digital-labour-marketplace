// Values, checks and request body for the "About you" form (same rules as the server).
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
  if (v.name.trim().length < 2) e.name = 'Please write your full name (at least 2 letters).';
  if (!PHONE.test(clean(v.phone))) e.phone = 'Phone must be a Pakistani mobile number like 0300 1234567.';
  if (v.whatsappNumber.trim() && !PHONE.test(clean(v.whatsappNumber))) e.whatsappNumber = 'WhatsApp must be a mobile number like 0300 1234567, or leave it empty.';
  if (v.cnicNumber.trim() && !/^\d{5}-?\d{7}-?\d$/.test(v.cnicNumber.trim())) e.cnicNumber = 'CNIC must look like 12345-1234567-1.';
  if (v.city.trim().length < 2) e.city = 'Please write your city.';
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

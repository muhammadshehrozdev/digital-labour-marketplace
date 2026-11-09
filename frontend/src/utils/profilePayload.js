// Only these fields may be sent to PUT /api/workers/me (the server rejects any other key).
const toList = (text) => text.split(',').map((s) => s.trim()).filter(Boolean);
const toNumber = (value) => (value === '' || value === null || value === undefined ? 0 : Number(value));

export function buildProfilePayload(profile) {
  const payload = {
    name: profile.name,
    phone: profile.phone,
    occupation: profile.occupation,
    category: profile.category,
    skills: toList(profile.skillsInput),
    experienceYears: toNumber(profile.experienceYears),
    hourlyRate: toNumber(profile.hourlyRate),
    dailyRate: toNumber(profile.dailyRate),
    city: profile.city,
    address: profile.address || '',
    whatsappNumber: profile.whatsappNumber || '',
    emergencyContact: profile.emergencyContact || '',
    languages: toList(profile.languagesInput),
    availability: profile.availability,
    bio: profile.bio || '',
    workHistory: (profile.workHistory || []).map((w) => ({
      jobTitle: w.jobTitle,
      clientOrEmployer: w.clientOrEmployer || '',
      duration: w.duration || '',
      description: w.description || '',
    })),
  };
  // CNIC is sent only when the worker types a new one (the saved one is never shown).
  if (profile.cnicNumber && profile.cnicNumber.trim()) payload.cnicNumber = profile.cnicNumber.trim();
  return payload;
}

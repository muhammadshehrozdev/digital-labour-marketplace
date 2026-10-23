import WorkerProfile from '../models/WorkerProfile.js';
import User from '../models/User.js';

// Helper: Profile Completion % calculate karna
const calculateCompletion = (profile) => {
  let score = 20; // Base registration score
  if (profile.occupation && profile.category) score += 15;
  if (profile.experienceYears >= 0 && (profile.hourlyRate > 0 || profile.dailyRate > 0)) score += 15;
  if (profile.city && profile.address) score += 10;
  if (profile.whatsappNumber || profile.emergencyContact) score += 10;
  if (profile.skills && profile.skills.length > 0) score += 15;
  if (profile.bio && profile.bio.trim().length > 10) score += 5;
  if (profile.workHistory && profile.workHistory.length > 0) score += 10;
  return Math.min(score, 100);
};

// 1. GET: /api/worker/profile (Worker apna profile dekhe)
export const getWorkerProfile = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ user: req.user._id }).populate('user', 'name email phone role');
    if (!profile) {
      return res.status(404).json({ message: 'Worker profile abhi nahi bana hua' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. POST: /api/worker/profile (Worker apna profile, personal info, skills, aur experience save kare)
export const updateWorkerProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      occupation,
      category,
      skills,
      experienceYears,
      hourlyRate,
      dailyRate,
      city,
      address,
      whatsappNumber,
      emergencyContact,
      cnicNumber,
      languages,
      availability,
      bio,
      workHistory,
    } = req.body;

    // User model mein Name aur Phone update karein (Personal & Contact Info Management)
    if (name || phone) {
      const userDoc = await User.findById(req.user._id);
      if (userDoc) {
        if (name) userDoc.name = name.trim();
        if (phone) userDoc.phone = phone.trim();
        await userDoc.save();
      }
    }

    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
      ? skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const parsedLanguages = Array.isArray(languages)
      ? languages
      : typeof languages === 'string'
      ? languages.split(',').map((l) => l.trim()).filter(Boolean)
      : ['Urdu'];

    let profile = await WorkerProfile.findOne({ user: req.user._id });

    if (profile) {
      if (occupation !== undefined) profile.occupation = occupation;
      if (category !== undefined) profile.category = category;
      if (skills !== undefined) profile.skills = parsedSkills;
      if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears) || 0;
      if (hourlyRate !== undefined) profile.hourlyRate = Number(hourlyRate) || 0;
      if (dailyRate !== undefined) profile.dailyRate = Number(dailyRate) || 0;
      if (city !== undefined) profile.city = city;
      if (address !== undefined) profile.address = address;
      if (whatsappNumber !== undefined) profile.whatsappNumber = whatsappNumber;
      if (emergencyContact !== undefined) profile.emergencyContact = emergencyContact;
      if (cnicNumber !== undefined) profile.cnicNumber = cnicNumber;
      if (languages !== undefined) profile.languages = parsedLanguages;
      if (availability !== undefined) profile.availability = availability;
      if (bio !== undefined) profile.bio = bio;
      if (Array.isArray(workHistory)) profile.workHistory = workHistory;

      profile.profileCompletion = calculateCompletion(profile);
      await profile.save();

      const populated = await WorkerProfile.findById(profile._id).populate('user', 'name email phone role');
      return res.json({ message: 'Digital Worker Profile kamyabi se update ho gaya!', profile: populated });
    }

    // Pehli dafa profile create karein
    const newProfileData = {
      user: req.user._id,
      occupation: occupation || 'Skilled Worker',
      category: category || 'Home Maintenance',
      skills: parsedSkills,
      experienceYears: Number(experienceYears) || 0,
      hourlyRate: Number(hourlyRate) || 0,
      dailyRate: Number(dailyRate) || 0,
      city: city || 'Islamabad',
      address: address || '',
      whatsappNumber: whatsappNumber || '',
      emergencyContact: emergencyContact || '',
      cnicNumber: cnicNumber || '',
      languages: parsedLanguages,
      availability: availability || 'Available',
      bio: bio || '',
      workHistory: Array.isArray(workHistory) ? workHistory : [],
    };
    newProfileData.profileCompletion = calculateCompletion(newProfileData);

    profile = await WorkerProfile.create(newProfileData);
    const populated = await WorkerProfile.findById(profile._id).populate('user', 'name email phone role');

    res.status(201).json({ message: 'Digital Worker Profile kamyabi se ban gaya!', profile: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. GET: /api/worker/all (Customer aur Admin ke liye tamam workers ki directory + filters)
export const getAllWorkers = async (req, res) => {
  try {
    const { category, city, search, availability } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (city && city !== 'All') filter.city = new RegExp(city, 'i');
    if (availability && availability !== 'All') filter.availability = availability;
    if (search) {
      filter.$or = [
        { occupation: new RegExp(search, 'i') },
        { skills: { $in: [new RegExp(search, 'i')] } },
        { bio: new RegExp(search, 'i') },
      ];
    }

    const workers = await WorkerProfile.find(filter)
      .populate('user', 'name email phone role')
      .sort({ updatedAt: -1 });

    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. PUT: /api/worker/verify/:id (Sirf Admin ke liye: Worker ki identity Verify/Unverify karna)
export const verifyWorkerIdentity = async (req, res) => {
  try {
    const { status } = req.body; // 'Verified', 'Pending', 'Unverified'
    const profile = await WorkerProfile.findById(req.params.id).populate('user', 'name email phone role');

    if (!profile) {
      return res.status(404).json({ message: 'Worker profile nahi mila' });
    }

    profile.verificationStatus = status || 'Verified';
    await profile.save();

    res.json({
      message: `Worker status update ho kar [${profile.verificationStatus}] ho gaya`,
      profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. GET: /api/worker/admin/users (Sirf Admin ke liye: Tamam users ki list)
export const getAllUsersForAdmin = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

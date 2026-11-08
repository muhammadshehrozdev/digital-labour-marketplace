import WorkerProfile from '../models/WorkerProfile.js';
import User from '../models/User.js';
import { runAiSkillProfiler } from '../utils/aiSkillProfiler.js';

const calculateCompletion = (profile) => {
  let score = 20;
  if (profile.occupation && profile.occupation !== 'No Trade Identified' && profile.category) score += 15;
  if (profile.experienceYears > 0 && (profile.hourlyRate > 0 || profile.dailyRate > 0)) score += 15;
  if (profile.city && profile.address) score += 10;
  if (profile.whatsappNumber || profile.emergencyContact) score += 10;
  if (profile.skills && profile.skills.length > 0) score += 15;
  if (profile.bio && profile.bio.trim().length > 10) score += 5;
  if (profile.workHistory && profile.workHistory.length > 0) score += 10;
  return Math.min(score, 100);
};

// 1. GET: /api/worker/profile
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

// 2. POST: /api/worker/profile (Module 1 Save)
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
    if (!profile) {
      profile = new WorkerProfile({ user: req.user._id });
    }

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
    return res.json({ message: 'Digital Worker Profile save ho gaya!', profile: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. POST: /api/worker/ai-skill-profiler (Module 2 Strict Zero-Assumption Endpoint)
export const analyzeWorkerSkills = async (req, res) => {
  try {
    const { rawExperienceText, isVoiceInput } = req.body;

    let profile = await WorkerProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new WorkerProfile({ user: req.user._id });
    }

    const aiResult = runAiSkillProfiler({
      rawExperienceText: (rawExperienceText || '').trim(),
      isVoiceInput: Boolean(isVoiceInput),
    });

    // Agar worker ne likha "mujay kuch nhi ata" ya aisi baat jismein koi skill nahi, to purana sab CLEAR کر do!
    if (aiResult.isNegativeOrEmpty || !aiResult.hasValidMatch) {
      profile.rawExperienceText = (rawExperienceText || '').trim();
      profile.occupation = 'No Trade Identified';
      profile.category = 'None';
      profile.experienceYears = 0;
      profile.skills = [];
      profile.categorizedSkills = [];
      profile.recommendedSkills = [];
      profile.toolsAndEquipment = [];
      profile.experienceTierBadge = 'Not Profiled Yet';
      profile.aiSkillSummary = '';
      profile.skillStrengthScore = 0;
      profile.lastAiProfiledAt = null;
      await profile.save();

      const populated = await WorkerProfile.findById(profile._id).populate('user', 'name email phone role');
      return res.status(200).json({
        isCleared: true,
        message: aiResult.isNegativeOrEmpty
          ? 'Aapne likha hai ke aapko koi kaam nahi aata, is liye tamam assumed skills aur tools हटा kar Profile 0% (Empty) kar diya gaya hai!'
          : 'Aapke likhe gaye jumlay mein kisi kaam ya skill ka zikar nahi mila, is liye koi bhi skill assume nahi ki gayi (0 Skills Extracted).',
        profile: populated,
      });
    }

    // Sirf wahi save karo jo abhi ke text/voice se sach mein nikla hai!
    profile.rawExperienceText = rawExperienceText.trim();
    profile.occupation = aiResult.detectedOccupation;
    profile.category = aiResult.detectedCategory;
    profile.experienceYears = aiResult.detectedYears;
    profile.skills = aiResult.skills;
    profile.categorizedSkills = aiResult.categorizedSkills;
    profile.recommendedSkills = aiResult.recommendedSkills;
    profile.toolsAndEquipment = aiResult.toolsAndEquipment;
    profile.experienceTierBadge = aiResult.experienceTierBadge;
    profile.aiSkillSummary = aiResult.aiSkillSummary;
    profile.skillStrengthScore = aiResult.skillStrengthScore;
    profile.lastAiProfiledAt = new Date();
    profile.profileCompletion = calculateCompletion(profile);

    await profile.save();
    const populated = await WorkerProfile.findById(profile._id).populate('user', 'name email phone role');

    res.json({
      isCleared: false,
      message: `AI ne sirf aapke likhe/bole gaye alfaz se ${profile.categorizedSkills.length} skill(s) aur ${profile.toolsAndEquipment.length} tool(s) extract kiye hain!`,
      profile: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. DELETE: /api/worker/ai-skill-profiler/reset
export const resetAiSkillProfile = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ user: req.user._id });
    if (profile) {
      profile.rawExperienceText = '';
      profile.aiSkillSummary = '';
      profile.experienceTierBadge = 'Not Profiled Yet';
      profile.categorizedSkills = [];
      profile.recommendedSkills = [];
      profile.toolsAndEquipment = [];
      profile.skills = [];
      profile.skillStrengthScore = 0;
      profile.experienceYears = 0;
      profile.occupation = 'No Trade Identified';
      profile.category = 'None';
      profile.lastAiProfiledAt = null;
      await profile.save();
    }
    const populated = profile
      ? await WorkerProfile.findById(profile._id).populate('user', 'name email phone role')
      : null;

    res.json({
      message: 'Skill Profile bilkul Reset (0% Empty) ho gaya hai!',
      profile: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. POST: /api/worker/add-recommended-skill
export const addRecommendedSkill = async (req, res) => {
  try {
    const { skillName, category, level } = req.body;
    if (!skillName) {
      return res.status(400).json({ message: 'Skill name zaroori hai' });
    }

    const profile = await WorkerProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Pehle apna worker profile banayein' });
    }

    const alreadyExists = profile.skills.some((s) => s.toLowerCase() === skillName.toLowerCase());
    if (!alreadyExists) {
      profile.skills.push(skillName);
    }

    const catExists = profile.categorizedSkills.some(
      (c) => c.skillName.toLowerCase() === skillName.toLowerCase()
    );
    if (!catExists) {
      profile.categorizedSkills.push({
        skillName,
        category: category || profile.category,
        level: level || (profile.experienceYears >= 5 ? 'Expert' : 'Intermediate'),
        confidenceScore: 95,
        source: 'Recommended-Added',
      });
    }

    profile.recommendedSkills = profile.recommendedSkills.filter(
      (r) => r.skillName.toLowerCase() !== skillName.toLowerCase()
    );

    profile.skillStrengthScore = Math.min((profile.skillStrengthScore || 20) + 10, 100);
    profile.profileCompletion = calculateCompletion(profile);

    await profile.save();
    const populated = await WorkerProfile.findById(profile._id).populate('user', 'name email phone role');

    res.json({
      message: `Skill "${skillName}" aapke structured skill profile mein add ho gayi!`,
      profile: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 6. GET: /api/worker/all
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
        { aiSkillSummary: new RegExp(search, 'i') },
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

// 7. PUT: /api/worker/verify/:id
export const verifyWorkerIdentity = async (req, res) => {
  try {
    const { status } = req.body;
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

// 8. GET: /api/worker/admin/users
export const getAllUsersForAdmin = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

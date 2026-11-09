import WorkerProfile from '../models/WorkerProfile.js';
import { runAiSkillProfiler } from '../utils/aiSkillProfiler.js';
import { calculateCompletion } from '../services/profileCompletion.js';
import { categoryIdFrom } from '../config/skillTaxonomy.js';
import { httpError } from '../utils/httpError.js';

// 3. POST: /api/worker/ai-skill-profiler (Module 2 Strict Zero-Assumption Endpoint)
export const analyzeWorkerSkills = async (req, res) => {
  const { rawExperienceText, isVoiceInput } = req.validated.body;

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
  profile.category = categoryIdFrom(aiResult.detectedCategory) ?? profile.category;
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
};

// 4. DELETE: /api/worker/ai-skill-profiler/reset
export const resetAiSkillProfile = async (req, res) => {
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
};

// 5. POST: /api/worker/add-recommended-skill
export const addRecommendedSkill = async (req, res) => {
  const { skillName, category, level } = req.validated.body;
  if (!skillName) {
    return res.status(400).json({ message: 'Skill name zaroori hai' });
  }

  const profile = await WorkerProfile.findOne({ user: req.user._id });
  if (!profile) throw httpError(404, 'Pehle apna worker profile banayein');

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
};

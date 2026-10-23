import WorkerProfile from '../models/WorkerProfile.js';

// GET: /api/worker/profile (Apna profile dekhna)
export const getWorkerProfile = async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ user: req.user._id }).populate('user', 'name email phone');
    if (!profile) {
      return res.status(404).json({ message: 'Worker profile abhi nahi bana hua' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST / PUT: /api/worker/profile (Profile create ya update karna)
export const updateWorkerProfile = async (req, res) => {
  try {
    const { occupation, category, experienceYears, hourlyRate, city, address, bio } = req.body;

    let profile = await WorkerProfile.findOne({ user: req.user._id });

    if (profile) {
      // Agar pehle se bana hua hai to UPDATE karein
      profile.occupation = occupation || profile.occupation;
      profile.category = category || profile.category;
      profile.experienceYears = experienceYears ?? profile.experienceYears;
      profile.hourlyRate = hourlyRate ?? profile.hourlyRate;
      profile.city = city || profile.city;
      profile.address = address || profile.address;
      profile.bio = bio || profile.bio;

      await profile.save();
      return res.json({ message: 'Profile update ho gaya', profile });
    }

    // Agar pehli dafa bana raha hai to CREATE karein
    profile = await WorkerProfile.create({
      user: req.user._id,
      occupation,
      category,
      experienceYears,
      hourlyRate,
      city,
      address,
      bio,
    });

    res.status(201).json({ message: 'Profile kamyabi se ban gaya', profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST: /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'Yeh email pehle se registered hai' });
    }

    // Security: Agar pehla admin banana ho to email mein 'admin@' ho ya role worker/customer rahe
    let assignedRole = 'worker';
    if (role === 'customer') assignedRole = 'customer';
    if (role === 'admin') assignedRole = 'admin';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
      role: assignedRole,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST: /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Email ya password ghalat hai' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET: /api/auth/me (Logged-in user ki details)
export const getMe = async (req, res) => {
  res.json(req.user);
};

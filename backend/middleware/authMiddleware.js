import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 1. Check karna ke kya token valid hai
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token invalid ya expire ho chuka hai' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Aap login nahi hain, token missing hai' });
  }
};

// 2. Role Check karna (Worker, Customer, Admin)
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Role [${req.user.role}] ko ijazat nahi hai.` });
    }
    next();
  };
};
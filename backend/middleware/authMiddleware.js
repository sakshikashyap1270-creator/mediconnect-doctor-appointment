import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user from DB
    const result = await query('SELECT id, email, role, name FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists' });
    }

    req.user = result.rows[0];
    
    // Fetch role profile ID if applicable
    if (req.user.role === 'patient') {
      const pat = await query('SELECT id FROM patients WHERE user_id = $1', [req.user.id]);
      if (pat.rows.length > 0) req.user.patientId = pat.rows[0].id;
    } else if (req.user.role === 'doctor') {
      const doc = await query('SELECT id, status FROM doctors WHERE user_id = $1', [req.user.id]);
      if (doc.rows.length > 0) {
        req.user.doctorId = doc.rows[0].id;
        req.user.doctorStatus = doc.rows[0].status;
      }
    }

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action' });
    }
    next();
  };
};

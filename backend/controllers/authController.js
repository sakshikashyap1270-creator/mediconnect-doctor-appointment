import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { query } from '../config/db.js';
import { DoctorModel } from '../models/Doctor.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    // Fetch profile specific ID
    let profileId = null;
    let docStatus = null;
    if (user.role === 'patient') {
      const p = await query('SELECT id FROM patients WHERE user_id = $1', [user.id]);
      if (p.rows.length > 0) profileId = p.rows[0].id;
    } else if (user.role === 'doctor') {
      const d = await query('SELECT id, status FROM doctors WHERE user_id = $1', [user.id]);
      if (d.rows.length > 0) {
        profileId = d.rows[0].id;
        docStatus = d.rows[0].status;
      }
    }

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        profileId,
        doctorStatus: docStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

export const signupPatient = async (req, res, next) => {
  const { email, password, name, dob, gender, contact, insurance } = req.body;

  try {
    if (!email || !password || !name || !dob || !gender) {
      return res.status(400).json({ message: 'Required fields missing for registration' });
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Run within SQL transaction
    await query('BEGIN');
    
    // Create user
    const newUser = await UserModel.create(email, passwordHash, 'patient', name);
    
    // Create patient
    const patText = `
      INSERT INTO patients (user_id, dob, gender, contact, insurance)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `;
    const patResult = await query(patText, [newUser.id, dob, gender, contact, insurance]);
    
    // Seed initial welcome notification
    const notifText = `
      INSERT INTO notifications (user_id, message)
      VALUES ($1, 'Your Patient account was registered successfully! Feel free to book appointments.');
    `;
    await query(notifText, [newUser.id]);

    await query('COMMIT');

    const token = generateToken(newUser.id);
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        profileId: patResult.rows[0].id
      }
    });
  } catch (error) {
    await query('ROLLBACK');
    next(error);
  }
};

export const signupDoctor = async (req, res, next) => {
  const { email, password, name, specialization, experience, fee, location, licenseNumber, qualifications, bio } = req.body;

  try {
    if (!email || !password || !name || !specialization || !fee || !licenseNumber || !qualifications) {
      return res.status(400).json({ message: 'Required fields missing for doctor registration' });
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await query('BEGIN');
    
    const newUser = await UserModel.create(email, passwordHash, 'doctor', name);
    
    const doc = await DoctorModel.create(
      newUser.id,
      specialization,
      experience,
      fee,
      location,
      licenseNumber,
      qualifications,
      bio
    );

    // Initial slots seeding for testing
    const defaultSlots = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    for (const slot of defaultSlots) {
      await DoctorModel.addSlot(doc.id, dateStr, slot);
    }

    await query('COMMIT');

    const token = generateToken(newUser.id);
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        profileId: doc.id,
        doctorStatus: 'pending'
      }
    });
  } catch (error) {
    await query('ROLLBACK');
    next(error);
  }
};

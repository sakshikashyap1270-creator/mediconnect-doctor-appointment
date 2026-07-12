import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { DoctorModel } from '../models/Doctor.js';
import { UserModel } from '../models/User.js';

export const getProfile = async (req, res, next) => {
  const userId = req.user.id;
  const role = req.user.role;

  try {
    if (role === 'patient') {
      const result = await query('SELECT p.*, u.name, u.email FROM patients p JOIN users u ON p.user_id = u.id WHERE p.user_id = $1', [userId]);
      return res.status(200).json(result.rows[0]);
    } else if (role === 'doctor') {
      const result = await query('SELECT d.*, u.name, u.email FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.user_id = $1', [userId]);
      return res.status(200).json(result.rows[0]);
    } else {
      const result = await query('SELECT id, name, email, role FROM users WHERE id = $1', [userId]);
      return res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  const userId = req.user.id;
  const role = req.user.role;

  try {
    const { name, dob, gender, contact, insurance, specialization, experience, fee, location, qualifications, bio } = req.body;

    await query('BEGIN');

    // Update user display name
    if (name) {
      await query('UPDATE users SET name = $2 WHERE id = $1', [userId, name]);
    }

    if (role === 'patient') {
      const fields = [];
      const values = [];
      let idx = 1;

      const allowed = ['dob', 'gender', 'contact', 'insurance'];
      for (const key of allowed) {
        if (req.body[key] !== undefined) {
          fields.push(`${key} = $${idx}`);
          values.push(req.body[key]);
          idx++;
        }
      }

      if (fields.length > 0) {
        values.push(userId);
        const sql = `UPDATE patients SET ${fields.join(', ')} WHERE user_id = $${idx}`;
        await query(sql, values);
      }
    } else if (role === 'doctor') {
      const fields = [];
      const values = [];
      let idx = 1;

      const allowed = ['specialization', 'experience', 'fee', 'location', 'qualifications', 'bio'];
      for (const key of allowed) {
        if (req.body[key] !== undefined) {
          fields.push(`${key} = $${idx}`);
          values.push(req.body[key]);
          idx++;
        }
      }

      if (fields.length > 0) {
        values.push(userId);
        const sql = `UPDATE doctors SET ${fields.join(', ')} WHERE user_id = $${idx}`;
        await query(sql, values);
      }
    }

    await query('COMMIT');

    // Return updated profile details
    const ref = await query('SELECT role, name, email FROM users WHERE id = $1', [userId]);
    res.status(200).json({ message: 'Profile updated successfully', user: ref.rows[0] });
  } catch (error) {
    await query('ROLLBACK');
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const userResult = await query('SELECT password FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await UserModel.updatePassword(userId, passwordHash);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

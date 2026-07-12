import fs from 'fs';
import { MedicalRecordModel } from '../models/MedicalRecord.js';

export const uploadRecord = async (req, res, next) => {
  const patientId = req.user.patientId;
  const { category, reportName } = req.body;

  try {
    if (!patientId) {
      return res.status(403).json({ message: 'Only patients can upload reports' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file report' });
    }

    const docName = reportName || req.file.originalname;
    const filePath = req.file.path.replace(/\\/g, '/'); // normalize backslashes for web paths

    const record = await MedicalRecordModel.create(patientId, docName, category || 'General', filePath);
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
};

export const getRecords = async (req, res, next) => {
  const patientId = req.user.patientId;

  try {
    if (!patientId) {
      return res.status(403).json({ message: 'Only patients can retrieve medical records history' });
    }
    const records = await MedicalRecordModel.findFiltered({ patientId });
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

export const deleteRecord = async (req, res, next) => {
  const { id } = req.params;
  const patientId = req.user.patientId;

  try {
    if (!patientId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete record from DB
    const record = await MedicalRecordModel.delete(id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Delete actual file from server disk
    if (fs.existsSync(record.file_path)) {
      fs.unlinkSync(record.file_path);
    }

    res.status(200).json({ message: 'Document removed successfully' });
  } catch (error) {
    next(error);
  }
};

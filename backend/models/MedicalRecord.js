import prisma from '../config/db.js';

export const MedicalRecordModel = {
  create: async (patientId, reportName, category, filePath) => {
    return prisma.medicalRecord.create({
      data: {
        patientId: parseInt(patientId),
        reportName,
        category,
        filePath,
        status: 'verified'
      }
    });
  },

  findFiltered: async (filters = {}) => {
    const where = {};
    if (filters.patientId) {
      where.patientId = parseInt(filters.patientId);
    }
    return prisma.medicalRecord.findMany({
      where,
      orderBy: { uploadDate: 'desc' }
    });
  },

  delete: async (id) => {
    return prisma.medicalRecord.delete({
      where: { id: parseInt(id) }
    });
  }
};

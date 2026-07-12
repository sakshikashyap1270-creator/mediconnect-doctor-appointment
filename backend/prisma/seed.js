import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Check if admin user already exists
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@mediconnect.com' }
  });

  if (adminExists) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding database...');

  const passwordHash = '$2a$10$d6x1jHn.P1B5zWfN923/e.rX2P91/sS0K/eQp8U0/L0P4J2V2Y4G2'; // bcrypt hash of 'password123'

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mediconnect.com',
      password: passwordHash,
      role: 'admin',
      name: 'System Admin'
    }
  });

  // 2. Create Patient John Doe
  const patientUser = await prisma.user.create({
    data: {
      email: 'john@patient.com',
      password: passwordHash,
      role: 'patient',
      name: 'John Doe',
      patient: {
        create: {
          dob: new Date('1990-05-15'),
          gender: 'Male',
          contact: '+1 (555) 019-2834',
          insurance: 'BlueCross Shield',
          medicalHistory: 'Mild asthma, seasonal allergies'
        }
      }
    }
  });

  // 3. Create Doctors
  const sarahUser = await prisma.user.create({
    data: {
      email: 'sarah@doctor.com',
      password: passwordHash,
      role: 'doctor',
      name: 'Dr. Sarah Jenkins',
      doctor: {
        create: {
          specialization: 'Cardiology',
          experience: 12,
          fee: 150.00,
          rating: 4.9,
          location: 'New York Medical Plaza',
          licenseNumber: 'LIC-774920-NY',
          status: 'approved',
          qualifications: 'MD, FACC - Harvard Medical School',
          bio: 'Dr. Sarah Jenkins has over 12 years of clinical experience in non-invasive cardiology.'
        }
      }
    }
  });

  const alexUser = await prisma.user.create({
    data: {
      email: 'alex@doctor.com',
      password: passwordHash,
      role: 'doctor',
      name: 'Dr. Alex Mercer',
      doctor: {
        create: {
          specialization: 'Pediatrics',
          experience: 8,
          fee: 100.00,
          rating: 4.7,
          location: 'Brooklyn Health Center',
          licenseNumber: 'LIC-221983-NY',
          status: 'approved',
          qualifications: 'MD - Johns Hopkins University',
          bio: 'Specializing in neonatal care and childhood developmental diagnostics.'
        }
      }
    }
  });

  const ryanUser = await prisma.user.create({
    data: {
      email: 'ryan@doctor.com',
      password: passwordHash,
      role: 'doctor',
      name: 'Dr. Ryan Gosling',
      doctor: {
        create: {
          specialization: 'Orthopedics',
          experience: 5,
          fee: 110.00,
          rating: 4.5,
          location: 'Manhattan Ortho Clinic',
          licenseNumber: 'LIC-334112-NY',
          status: 'pending',
          qualifications: 'DO - Stanford Orthopedics Residency',
          bio: 'Specialist in sports injuries and bone surgery. Awaiting verification.'
        }
      }
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

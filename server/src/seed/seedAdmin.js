import '../config/dns.js';
import { isProduction } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { newHexId } from '../utils/hexId.js';
import { hashPassword } from '../utils/password.js';

if (isProduction) {
  console.error('Refusing to provision an admin account in production.');
  process.exit(1);
}

const email = String(process.env.ADMIN_EMAIL ?? '')
  .trim()
  .toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? '';
const name = String(process.env.ADMIN_NAME ?? 'Gavora Admin').trim() || 'Gavora Admin';

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment before running seed:admin.');
  process.exit(1);
}

if (password.length < 8) {
  console.error('ADMIN_PASSWORD must be at least 8 characters.');
  process.exit(1);
}

async function seed() {
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    console.log('Admin account already exists.');
    return;
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      id: newHexId(),
      name,
      email,
      passwordHash,
      role: 'admin',
    },
  });

  console.log('Admin account provisioned.');
}

seed()
  .catch((error) => {
    const masked = String(error.message || '').replace(/postgresql:\/\/[^@\s]+@/gi, 'postgresql://***@');
    console.error(`Admin seed failed: ${masked}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

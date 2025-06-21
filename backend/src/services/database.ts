import { PrismaClient } from '@prisma/client';

// Create a single Prisma Client instance
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma; 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting simple role seed...');

  try {
    // Check if roles already exist
    const existingRoles = await prisma.role.findMany();
    if (existingRoles.length > 0) {
      console.log('✅ Roles already exist:', existingRoles.map(r => r.name));
      return;
    }

    // Create roles
    const adminRole = await prisma.role.create({
      data: {
        name: 'admin',
        permissions: ['users.create', 'users.read', 'users.update', 'users.delete'],
        isSystem: true,
      },
    });

    const managerRole = await prisma.role.create({
      data: {
        name: 'manager',
        permissions: ['users.read', 'employees.read', 'employees.create'],
        isSystem: false,
      },
    });

    const userRole = await prisma.role.create({
      data: {
        name: 'user',
        permissions: ['users.read'],
        isSystem: false,
      },
    });

    console.log('✅ Created roles:', [adminRole.name, managerRole.name, userRole.name]);
    console.log('✅ Role seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

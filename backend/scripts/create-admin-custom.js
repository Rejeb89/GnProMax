const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();

  const email = process.env.ADMIN_EMAIL;
  const username = process.env.ADMIN_USERNAME;
  const plainPassword = process.env.ADMIN_PASSWORD;

  if (!email || !username || !plainPassword) {
    console.error('Missing ADMIN_EMAIL / ADMIN_USERNAME / ADMIN_PASSWORD');
    process.exitCode = 1;
    await prisma.$disconnect();
    return;
  }

  try {
    const company =
      (await prisma.company.findFirst({ where: { isActive: true } })) ||
      (await prisma.company.upsert({
        where: { name: 'Default Company' },
        update: {},
        create: {
          name: 'Default Company',
          email: 'admin@default.company',
          isActive: true,
        },
      }));

    const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
    if (!adminRole) {
      throw new Error('Admin role not found. Run scripts/create-admin.js first.');
    }

    const hashed = await bcrypt.hash(
      plainPassword,
      parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    );

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        username,
        password: hashed,
        roleId: adminRole.id,
        companyId: company.id,
        isActive: true,
      },
      create: {
        email,
        username,
        password: hashed,
        roleId: adminRole.id,
        companyId: company.id,
        isActive: true,
      },
    });

    const branch = await prisma.branch.findFirst({ where: { companyId: company.id } });
    if (branch) {
      try {
        await prisma.userBranch.create({
          data: { userId: user.id, branchId: branch.id },
        });
      } catch {}
    }

    console.log('Admin user ready:', user.email);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exitCode = 1;
  } finally {
    try {
      await prisma.$disconnect();
    } catch {}
  }
}

main();

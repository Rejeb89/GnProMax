const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('Creating/updating default company...');
    const company = await prisma.company.upsert({
      where: { name: 'Default Company' },
      update: {},
      create: {
        name: 'Default Company',
        email: 'admin@default.company',
        isActive: true,
      },
    });

    console.log('Creating/updating Admin role...');
    const adminRole = await prisma.role.upsert({
      where: { name: 'Admin' },
      update: { 
        isActive: true,
        permissions: [
          'users.create','users.read','users.update','users.delete',
          'roles.read','roles.create','roles.update','roles.delete',
          'branches.read','branches.create','branches.update','branches.delete',
          'employees.read','employees.create','employees.update','employees.delete',
          'vehicles.read','vehicles.create','vehicles.update','vehicles.delete',
          'equipment.read','equipment.create','equipment.update','equipment.delete',
          'finance.read','finance.create','finance.update','finance.delete',
          'reports.read','audit.read','settings.read','settings.update'
        ]
      },
      create: {
        name: 'Admin',
        description: 'Administrator role',
        permissions: [
          'users.create','users.read','users.update','users.delete',
          'roles.read','roles.create','roles.update','roles.delete',
          'branches.read','branches.create','branches.update','branches.delete',
          'employees.read','employees.create','employees.update','employees.delete',
          'vehicles.read','vehicles.create','vehicles.update','vehicles.delete',
          'equipment.read','equipment.create','equipment.update','equipment.delete',
          'finance.read','finance.create','finance.update','finance.delete',
          'reports.read','audit.read','settings.read','settings.update'
        ],
        isSystem: true,
        isActive: true,
      },
    });

    const email = 'admin@testcompany.com';
    const username = 'admin';
    const plainPassword = 'Admin@123456';

    console.log('Hashing password...');
    const hashed = await bcrypt.hash(plainPassword, parseInt(process.env.BCRYPT_ROUNDS || '10', 10));

    console.log('Creating/updating admin user...');
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

    console.log('Admin user ready:', email);
    console.log('Password:', plainPassword);

    // Optionally attach to a branch if branches exist
    const branch = await prisma.branch.findFirst({ where: { companyId: company.id } });
    if (branch) {
      try {
        await prisma.userBranch.create({ data: { userId: user.id, branchId: branch.id } });
        console.log('Assigned user to branch:', branch.name || branch.code || branch.id);
      } catch (err) {
        // ignore if already assigned
      }
    }

    // Ensure company has default settings
    try {
      const existing = await prisma.company.findUnique({ where: { id: company.id }, select: { settings: true } });
      if (!existing || !existing.settings || Object.keys(existing.settings).length === 0) {
        const defaultSettings = {
          siteName: 'ERP Starter',
          supportEmail: 'support@company.com',
          itemsPerPage: 20,
          enableFeatureX: false,
        };
        await prisma.company.update({ where: { id: company.id }, data: { settings: defaultSettings } });
        console.log('Default settings applied for company');
      }
    } catch (err) {
      console.warn('Failed to apply default settings:', err?.message || err);
    }

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

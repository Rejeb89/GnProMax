import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (optional - comment out if you want to keep data)
    // await prisma.auditLog.deleteMany();
    // await prisma.equipmentTransaction.deleteMany();
    // await prisma.equipment.deleteMany();
    // await prisma.revenue.deleteMany();
    // await prisma.expense.deleteMany();
    // await prisma.budget.deleteMany();
    // await prisma.vehicle.deleteMany();
    // await prisma.employee.deleteMany();
    // await prisma.userBranch.deleteMany();
    // await prisma.user.deleteMany();
    // await prisma.role.deleteMany();
    // await prisma.branch.deleteMany();
    // await prisma.company.deleteMany();

    const companyName = process.env.SEED_COMPANY_NAME || 'Default Company';
    const companyEmail = process.env.SEED_COMPANY_EMAIL || 'admin@default.company';
    const companyPhone = process.env.SEED_COMPANY_PHONE || '+0000000000';

    // Create company
    const company = await prisma.company.upsert({
      where: { name: companyName },
      update: {
        email: companyEmail,
        phone: companyPhone,
      },
      create: {
        name: companyName,
        description: process.env.SEED_COMPANY_DESCRIPTION || 'Company',
        email: companyEmail,
        phone: companyPhone,
        address: process.env.SEED_COMPANY_ADDRESS || undefined,
        city: process.env.SEED_COMPANY_CITY || undefined,
        state: process.env.SEED_COMPANY_STATE || undefined,
        country: process.env.SEED_COMPANY_COUNTRY || undefined,
        zipCode: process.env.SEED_COMPANY_ZIP || undefined,
      },
    });

    console.log('✅ Created company:', company.name);

    // Create main branch
    const mainBranch = await prisma.branch.upsert({
      where: { companyId_code: { companyId: company.id, code: process.env.SEED_BRANCH_CODE || 'HQ' } },
      update: {
        name: process.env.SEED_BRANCH_NAME || 'Headquarters',
      },
      create: {
        code: process.env.SEED_BRANCH_CODE || 'HQ',
        name: process.env.SEED_BRANCH_NAME || 'Headquarters',
        city: process.env.SEED_BRANCH_CITY || undefined,
        state: process.env.SEED_BRANCH_STATE || undefined,
        country: process.env.SEED_BRANCH_COUNTRY || undefined,
        company: { connect: { id: company.id } },
      },
    });

    console.log('✅ Created main branch:', mainBranch.name);

    // Create secondary branch only if configured
    const secondaryBranchCode = process.env.SEED_SECONDARY_BRANCH_CODE;
    const secondaryBranchName = process.env.SEED_SECONDARY_BRANCH_NAME;
    const secondaryBranch = secondaryBranchCode
      ? await prisma.branch.upsert({
          where: { companyId_code: { companyId: company.id, code: secondaryBranchCode } },
          update: {
            name: secondaryBranchName || secondaryBranchCode,
          },
          create: {
            code: secondaryBranchCode,
            name: secondaryBranchName || secondaryBranchCode,
            city: process.env.SEED_SECONDARY_BRANCH_CITY || undefined,
            state: process.env.SEED_SECONDARY_BRANCH_STATE || undefined,
            country: process.env.SEED_SECONDARY_BRANCH_COUNTRY || undefined,
            company: { connect: { id: company.id } },
          },
        })
      : null;

    if (secondaryBranch) {
      console.log('✅ Created secondary branch:', secondaryBranch.name);
    }

    // Create Admin role with all permissions
    const adminPermissions = [
      // Users
      'users.create',
      'users.read',
      'users.update',
      'users.delete',
      // Roles
      'roles.create',
      'roles.read',
      'roles.update',
      'roles.delete',
      // Branches
      'branches.create',
      'branches.read',
      'branches.update',
      'branches.delete',
      // Employees
      'employees.create',
      'employees.read',
      'employees.update',
      'employees.delete',
      // Vehicles
      'vehicles.create',
      'vehicles.read',
      'vehicles.update',
      'vehicles.delete',
      // Equipment
      'equipment.create',
      'equipment.read',
      'equipment.update',
      'equipment.delete',
      // Finance
      'finance.create',
      'finance.read',
      'finance.update',
      'finance.delete',
      'finance.approve',
      // Reports
      'reports.read',
      'reports.export',
      // Audit
      'audit.read',
    ];

    const adminRole = await prisma.role.upsert({
      where: { name: 'Admin' },
      update: {
        permissions: adminPermissions,
        isSystem: true,
        isActive: true,
      },
      create: {
        name: 'Admin',
        permissions: adminPermissions,
        isSystem: true,
        isActive: true,
      },
    });

    console.log('✅ Created Admin role');

    // Create Manager role
    const managerRole = await prisma.role.upsert({
      where: { name: 'Manager' },
      update: {
        permissions: [
          'users.read',
          'roles.read',
          'branches.read',
          'employees.create',
          'employees.read',
          'employees.update',
          'vehicles.create',
          'vehicles.read',
          'vehicles.update',
          'equipment.read',
          'equipment.update',
          'finance.read',
          'finance.create',
          'reports.read',
          'audit.read',
        ],
        isSystem: false,
        isActive: true,
      },
      create: {
        name: 'Manager',
        permissions: [
          'users.read',
          'roles.read',
          'branches.read',
          'employees.create',
          'employees.read',
          'employees.update',
          'vehicles.create',
          'vehicles.read',
          'vehicles.update',
          'equipment.read',
          'equipment.update',
          'finance.read',
          'finance.create',
          'reports.read',
          'audit.read',
        ],
        isSystem: false,
        isActive: true,
      },
    });

    console.log('✅ Created Manager role');

    // Create Employee role
    const employeeRole = await prisma.role.upsert({
      where: { name: 'Employee' },
      update: {
        permissions: [
          'users.read',
          'employees.read',
          'vehicles.read',
          'equipment.read',
          'reports.read',
        ],
        isSystem: false,
        isActive: true,
      },
      create: {
        name: 'Employee',
        permissions: [
          'users.read',
          'employees.read',
          'vehicles.read',
          'equipment.read',
          'reports.read',
        ],
        isSystem: false,
        isActive: true,
      },
    });

    console.log('✅ Created Employee role');

    // Create admin user
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@default.company';
    const adminUsername = process.env.SEED_ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        username: adminUsername,
        password: hashedPassword,
        roleId: adminRole.id,
        companyId: company.id,
        isActive: true,
      },
      create: {
        email: adminEmail,
        username: adminUsername,
        password: hashedPassword,
        roleId: adminRole.id,
        companyId: company.id,
        isActive: true,
      },
    });

    console.log('✅ Created admin user');

    // Assign admin to main branch
    await prisma.userBranch.create({
      data: {
        user: { connect: { id: adminUser.id } },
        branch: { connect: { id: mainBranch.id } },
      },
    });

    if (secondaryBranch) {
      try {
        await prisma.userBranch.create({
          data: {
            user: { connect: { id: adminUser.id } },
            branch: { connect: { id: secondaryBranch.id } },
          },
        });
      } catch (e) {
        // ignore if already assigned
      }
    }

    console.log('✅ Assigned admin user to branches');

    // Create manager user if configured
    const managerEmail = process.env.SEED_MANAGER_EMAIL;
    const managerUsername = process.env.SEED_MANAGER_USERNAME;
    const managerPassword = process.env.SEED_MANAGER_PASSWORD;
    if (managerEmail && managerUsername && managerPassword) {
      const managerHashed = await bcrypt.hash(managerPassword, 10);
      const managerUser = await prisma.user.upsert({
        where: { email: managerEmail },
        update: {
          username: managerUsername,
          password: managerHashed,
          roleId: managerRole.id,
          companyId: company.id,
          isActive: true,
        },
        create: {
          email: managerEmail,
          username: managerUsername,
          password: managerHashed,
          roleId: managerRole.id,
          companyId: company.id,
          isActive: true,
        },
      });

      try {
        await prisma.userBranch.create({
          data: {
            user: { connect: { id: managerUser.id } },
            branch: { connect: { id: mainBranch.id } },
          },
        });
      } catch (e) {
        // ignore if already assigned
      }

      console.log('✅ Created manager user');
    }

    console.log('\n✨ Database seed completed successfully!');
    console.log('\n📝 Seed Credentials:');
    console.log('   Admin:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
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

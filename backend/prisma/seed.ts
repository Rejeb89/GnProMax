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

    // Create company
    const company = await prisma.company.create({
      data: {
        name: 'Test Company',
        description: 'Test company for development',
        email: 'test@testcompany.com',
        phone: '+1234567890',
        address: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        country: 'Test Country',
        zipCode: '12345',
      },
    });

    console.log('✅ Created company:', company.name);

    // Create main branch
    const mainBranch = await prisma.branch.create({
      data: {
        code: 'HQ',
        name: 'Headquarters',
        city: 'Test City',
        state: 'TS',
        country: 'Test Country',
        company: { connect: { id: company.id } },
      },
    });

    console.log('✅ Created main branch:', mainBranch.name);

    // Create secondary branch
    const secondaryBranch = await prisma.branch.create({
      data: {
        code: 'BR-01',
        name: 'Branch One',
        city: 'Other City',
        state: 'OS',
        country: 'Test Country',
        company: { connect: { id: company.id } },
      },
    });

    console.log('✅ Created secondary branch:', secondaryBranch.name);

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

    const adminRole = await prisma.role.create({
      data: {
        name: 'Admin',
        permissions: adminPermissions,
        systemRole: true,
        company: { connect: { id: company.id } },
      },
    });

    console.log('✅ Created Admin role');

    // Create Manager role
    const managerRole = await prisma.role.create({
      data: {
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
        systemRole: false,
        company: { connect: { id: company.id } },
      },
    });

    console.log('✅ Created Manager role');

    // Create Employee role
    const employeeRole = await prisma.role.create({
      data: {
        name: 'Employee',
        permissions: [
          'users.read',
          'employees.read',
          'vehicles.read',
          'equipment.read',
          'reports.read',
        ],
        systemRole: false,
        company: { connect: { id: company.id } },
      },
    });

    console.log('✅ Created Employee role');

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123456', 10);

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@testcompany.com',
        password: hashedPassword,
        role: { connect: { id: adminRole.id } },
        company: { connect: { id: company.id } },
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

    // Assign admin to secondary branch
    await prisma.userBranch.create({
      data: {
        user: { connect: { id: adminUser.id } },
        branch: { connect: { id: secondaryBranch.id } },
      },
    });

    console.log('✅ Assigned admin user to branches');

    // Create manager user
    const managerUser = await prisma.user.create({
      data: {
        email: 'manager@testcompany.com',
        password: hashedPassword,
        role: { connect: { id: managerRole.id } },
        company: { connect: { id: company.id } },
      },
    });

    await prisma.userBranch.create({
      data: {
        user: { connect: { id: managerUser.id } },
        branch: { connect: { id: mainBranch.id } },
      },
    });

    console.log('✅ Created manager user');

    // Create test employees
    const employees = [];
    for (let i = 1; i <= 5; i++) {
      const employee = await prisma.employee.create({
        data: {
          employeeId: `EMP${String(i).padStart(3, '0')}`,
          firstName: `Employee${i}`,
          lastName: `Test${i}`,
          email: `employee${i}@testcompany.com`,
          phone: `+123456789${i}`,
          department: ['Operations', 'HR', 'IT', 'Finance', 'Sales'][i - 1],
          designation: ['Manager', 'Officer', 'Lead', 'Analyst', 'Executive'][
            i - 1
          ],
          dateOfJoining: new Date('2023-01-01'),
          branch: { connect: { id: mainBranch.id } },
          company: { connect: { id: company.id } },
        },
      });
      employees.push(employee);
      console.log(`✅ Created employee: ${employee.firstName} ${employee.lastName}`);
    }

    // Create test vehicles
    for (let i = 1; i <= 3; i++) {
      await prisma.vehicle.create({
        data: {
          registrationNumber: `ABC-${1000 + i}`,
          make: ['Toyota', 'Honda', 'Ford'][i - 1],
          model: ['Camry', 'Civic', 'F-150'][i - 1],
          year: 2023,
          type: ['Sedan', 'Sedan', 'Truck'][i - 1],
          color: ['Black', 'White', 'Red'][i - 1],
          vin: `VIN00000000000000${i}`,
          fuelType: 'Petrol',
          engineCapacity: 2.0,
          driver: { connect: { id: employees[i - 1].id } },
          branch: { connect: { id: mainBranch.id } },
          company: { connect: { id: company.id } },
        },
      });
      console.log(`✅ Created vehicle: ${['Toyota Camry', 'Honda Civic', 'Ford F-150'][i - 1]}`);
    }

    // Create test equipment
    for (let i = 1; i <= 5; i++) {
      await prisma.equipment.create({
        data: {
          name: `Equipment ${i}`,
          category: ['IT', 'Office', 'Tools', 'Safety', 'Other'][i - 1],
          serialNumber: `SN-${String(i).padStart(5, '0')}`,
          description: `Test equipment item ${i}`,
          purchaseDate: new Date('2023-01-01'),
          purchasePrice: 1000 + i * 100,
          warranty: i % 2 === 0,
          warrantyExpiry: new Date('2025-01-01'),
          condition: 'Good',
          branch: { connect: { id: mainBranch.id } },
          company: { connect: { id: company.id } },
        },
      });
      console.log(`✅ Created equipment: Equipment ${i}`);
    }

    // Create test budgets
    for (let i = 1; i <= 3; i++) {
      await prisma.budget.create({
        data: {
          name: `Q${i} Budget`,
          amount: 100000 * i,
          category: ['Operations', 'Marketing', 'IT'][i - 1],
          startDate: new Date(`2024-0${i}-01`),
          endDate: new Date(`2024-0${i + 1}-01`),
          branch: { connect: { id: mainBranch.id } },
          company: { connect: { id: company.id } },
        },
      });
      console.log(`✅ Created budget: Q${i} Budget`);
    }

    // Create test expenses
    for (let i = 1; i <= 3; i++) {
      await prisma.expense.create({
        data: {
          description: `Expense Item ${i}`,
          amount: 5000 * i,
          category: ['Operations', 'Supplies', 'Travel'][i - 1],
          status: 'approved',
          date: new Date(),
          submittedBy: { connect: { id: adminUser.id } },
          branch: { connect: { id: mainBranch.id } },
          company: { connect: { id: company.id } },
        },
      });
      console.log(`✅ Created expense: Expense Item ${i}`);
    }

    // Create test revenues
    for (let i = 1; i <= 3; i++) {
      await prisma.revenue.create({
        data: {
          description: `Revenue Item ${i}`,
          amount: 10000 * i,
          category: ['Sales', 'Services', 'Other'][i - 1],
          date: new Date(),
          branch: { connect: { id: mainBranch.id } },
          company: { connect: { id: company.id } },
        },
      });
      console.log(`✅ Created revenue: Revenue Item ${i}`);
    }

    console.log('\n✨ Database seed completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin:');
    console.log('   Email: admin@testcompany.com');
    console.log('   Password: Admin@123456');
    console.log('\n   Manager:');
    console.log('   Email: manager@testcompany.com');
    console.log('   Password: Admin@123456');
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

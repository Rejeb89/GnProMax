import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger('EmployeesService');

  constructor(private prisma: PrismaService) {}

  async create(currentUser: CurrentUser, createEmployeeDto: CreateEmployeeDto) {
    const { employeeId, branchId } = createEmployeeDto;

    // Verify branch exists and belongs to company
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch || branch.companyId !== currentUser.companyId) {
      throw new NotFoundException('Branch not found');
    }

    // Check if employee ID already exists
    const existingEmployee = await this.prisma.employee.findFirst({
      where: {
        companyId: currentUser.companyId,
        employeeId,
      },
    });

    if (existingEmployee) {
      throw new ConflictException(`Employee ID '${employeeId}' already exists`);
    }

    const employee = await this.prisma.employee.create({
      data: {
        companyId: currentUser.companyId,
        ...createEmployeeDto,
      },
    });

    this.logger.log(`Employee created: ${employee.firstName} ${employee.lastName}`);
    return employee;
  }

  async findAll(currentUser: CurrentUser, skip: number = 0, take: number = 10) {
    const employees = await this.prisma.employee.findMany({
      where: {
        companyId: currentUser.companyId,
      },
      include: {
        vehicles: true,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.employee.count({
      where: { companyId: currentUser.companyId },
    });

    return {
      data: employees,
      total,
      skip,
      take,
    };
  }

  async findOne(currentUser: CurrentUser, id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        branch: true,
        vehicles: true,
      },
    });

    if (!employee || employee.companyId !== currentUser.companyId) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async update(
    currentUser: CurrentUser,
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ) {
    await this.findOne(currentUser, id);

    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: updateEmployeeDto,
      include: {
        branch: true,
        vehicles: true,
      },
    });

    this.logger.log(`Employee updated: ${updatedEmployee.firstName} ${updatedEmployee.lastName}`);
    return updatedEmployee;
  }

  async delete(currentUser: CurrentUser, id: string) {
    const employee = await this.findOne(currentUser, id);

    // Check if employee has assigned vehicles
    const vehicleCount = await this.prisma.vehicle.count({
      where: { driverId: id },
    });

    if (vehicleCount > 0) {
      throw new BadRequestException(
        `Employee has ${vehicleCount} assigned vehicle(s). Please reassign them first.`,
      );
    }

    await this.prisma.employee.delete({
      where: { id },
    });

    this.logger.log(`Employee deleted: ${employee.firstName} ${employee.lastName}`);
    return { message: 'Employee deleted successfully' };
  }

  async findByBranch(currentUser: CurrentUser, branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch || branch.companyId !== currentUser.companyId) {
      throw new NotFoundException('Branch not found');
    }

    return this.prisma.employee.findMany({
      where: {
        branchId,
        companyId: currentUser.companyId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

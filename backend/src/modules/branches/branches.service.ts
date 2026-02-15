import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Injectable()
export class BranchesService {
  private readonly logger = new Logger('BranchesService');

  constructor(private prisma: PrismaService) {}

  async create(currentUser: CurrentUser, createBranchDto: CreateBranchDto) {
    const { code } = createBranchDto;

    // Check if branch code already exists for this company
    const existingBranch = await this.prisma.branch.findFirst({
      where: {
        companyId: currentUser.companyId,
        code,
      },
    });

    if (existingBranch) {
      throw new ConflictException(`Branch code '${code}' already exists in this company`);
    }

    const branch = await this.prisma.branch.create({
      data: {
        companyId: currentUser.companyId,
        ...createBranchDto,
      },
    });

    this.logger.log(`Branch created: ${branch.name}`);
    return branch;
  }

  async findAll(currentUser: CurrentUser, skip: number = 0, take: number = 10) {
    const branches = await this.prisma.branch.findMany({
      where: {
        companyId: currentUser.companyId,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.branch.count({
      where: { companyId: currentUser.companyId },
    });

    return {
      data: branches,
      total,
      skip,
      take,
    };
  }

  async findOne(currentUser: CurrentUser, id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        users: true,
        employees: true,
        vehicles: true,
        equipment: true,
      },
    });

    if (!branch || branch.companyId !== currentUser.companyId) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async update(
    currentUser: CurrentUser,
    id: string,
    updateBranchDto: UpdateBranchDto,
  ) {
    const branch = await this.findOne(currentUser, id);

    // Check if new code already exists
    if (updateBranchDto.code && updateBranchDto.code !== branch.code) {
      const existingBranch = await this.prisma.branch.findFirst({
        where: {
          companyId: currentUser.companyId,
          code: updateBranchDto.code,
        },
      });

      if (existingBranch) {
        throw new ConflictException(`Branch code '${updateBranchDto.code}' already exists`);
      }
    }

    const updatedBranch = await this.prisma.branch.update({
      where: { id },
      data: updateBranchDto,
    });

    this.logger.log(`Branch updated: ${updatedBranch.name}`);
    return updatedBranch;
  }

  async delete(currentUser: CurrentUser, id: string) {
    const branch = await this.findOne(currentUser, id);

    // Check if any resources are assigned to this branch
    const [employeeCount, vehicleCount, equipmentCount] = await Promise.all([
      this.prisma.employee.count({
        where: { branchId: id },
      }),
      this.prisma.vehicle.count({
        where: { branchId: id },
      }),
      this.prisma.equipment.count({
        where: { branchId: id },
      }),
    ]);

    if (employeeCount > 0 || vehicleCount > 0 || equipmentCount > 0) {
      throw new BadRequestException(
        'Cannot delete branch with assigned resources. Please reassign them first.',
      );
    }

    await this.prisma.branch.delete({
      where: { id },
    });

    this.logger.log(`Branch deleted: ${branch.name}`);
    return { message: 'Branch deleted successfully' };
  }
}

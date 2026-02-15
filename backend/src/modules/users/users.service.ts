import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { EncryptionService } from '@common/services/encryption.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto, AssignBranchDto } from './dto/user.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  async create(currentUser: CurrentUser, createUserDto: CreateUserDto) {
    const { email, username } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }

    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: createUserDto.roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const hashedPassword = await this.encryptionService.hashPassword(
      createUserDto.password,
    );

    const user = await this.prisma.user.create({
      data: {
        companyId: currentUser.companyId,
        ...createUserDto,
        password: hashedPassword,
      },
      include: {
        role: true,
        branches: true,
      },
    });

    this.logger.log(`User created: ${user.email}`);

    // Exclude password from response
    const { password, ...userResponse } = user;
    return userResponse;
  }

  async findAll(currentUser: CurrentUser, skip: number = 0, take: number = 10) {
    const users = await this.prisma.user.findMany({
      where: {
        companyId: currentUser.companyId,
      },
      include: {
        role: true,
        branches: true,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.user.count({
      where: { companyId: currentUser.companyId },
    });

    return {
      data: users.map(({ password, ...user }: any) => user),
      total,
      skip,
      take,
    };
  }

  async findOne(currentUser: CurrentUser, id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        branches: true,
      },
    });

    if (!user || user.companyId !== currentUser.companyId) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userResponse } = user;
    return userResponse;
  }

  async update(currentUser: CurrentUser, id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(currentUser, id);

    if (updateUserDto.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: updateUserDto.roleId },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        role: true,
        branches: true,
      },
    });

    this.logger.log(`User updated: ${updatedUser.email}`);

    const { password, ...userResponse } = updatedUser;
    return userResponse;
  }

  async delete(currentUser: CurrentUser, id: string) {
    if (id === currentUser.id) {
      throw new BadRequestException('Cannot delete your own user account');
    }

    await this.findOne(currentUser, id);

    await this.prisma.user.delete({
      where: { id },
    });

    this.logger.log(`User deleted: ${id}`);
    return { message: 'User deleted successfully' };
  }

  async changePassword(
    currentUser: CurrentUser,
    changePasswordDto: ChangePasswordDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.encryptionService.comparePassword(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await this.encryptionService.hashPassword(
      changePasswordDto.newPassword,
    );

    await this.prisma.user.update({
      where: { id: currentUser.id },
      data: { password: hashedNewPassword },
    });

    this.logger.log(`Password changed for user: ${user.email}`);
    return { message: 'Password changed successfully' };
  }

  async assignBranch(
    currentUser: CurrentUser,
    userId: string,
    assignBranchDto: AssignBranchDto,
  ) {
    await this.findOne(currentUser, userId);

    // Verify branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: assignBranchDto.branchId },
    });

    if (!branch || branch.companyId !== currentUser.companyId) {
      throw new NotFoundException('Branch not found');
    }

    // Check if already assigned
    const existing = await this.prisma.userBranch.findUnique({
      where: {
        userId_branchId: {
          userId,
          branchId: assignBranchDto.branchId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User already assigned to this branch');
    }

    await this.prisma.userBranch.create({
      data: {
        userId,
        branchId: assignBranchDto.branchId,
      },
    });

    this.logger.log(`Branch assigned to user: ${userId}`);
    return { message: 'Branch assigned successfully' };
  }

  async removeBranch(
    currentUser: CurrentUser,
    userId: string,
    branchId: string,
  ) {
    await this.findOne(currentUser, userId);

    await this.prisma.userBranch.delete({
      where: {
        userId_branchId: {
          userId,
          branchId,
        },
      },
    });

    this.logger.log(`Branch removed from user: ${userId}`);
    return { message: 'Branch removed successfully' };
  }
}

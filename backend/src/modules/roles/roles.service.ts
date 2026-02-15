import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger('RolesService');

  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    const { name } = createRoleDto;

    // Check if role already exists
    const existingRole = await this.prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new ConflictException(`Role '${name}' already exists`);
    }

    const role = await this.prisma.role.create({
      data: {
        name,
        description: createRoleDto.description,
        permissions: createRoleDto.permissions || [],
        isActive: true,
      },
    });

    this.logger.log(`Role created: ${role.name}`);
    return role;
  }

  async findAll(skip: number = 0, take: number = 10) {
    const roles = await this.prisma.role.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.role.count();

    return {
      data: roles,
      total,
      skip,
      take,
    };
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be modified');
    }

    // Check if new name already exists
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.prisma.role.findUnique({
        where: { name: updateRoleDto.name },
      });

      if (existingRole) {
        throw new ConflictException(`Role '${updateRoleDto.name}' already exists`);
      }
    }

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });

    this.logger.log(`Role updated: ${updatedRole.name}`);
    return updatedRole;
  }

  async delete(id: string) {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be deleted');
    }

    // Check if role is used by users
    const userCount = await this.prisma.user.count({
      where: { roleId: id },
    });

    if (userCount > 0) {
      throw new BadRequestException(
        `Role is assigned to ${userCount} user(s) and cannot be deleted`,
      );
    }

    await this.prisma.role.delete({
      where: { id },
    });

    this.logger.log(`Role deleted: ${role.name}`);
    return { message: 'Role deleted successfully' };
  }

  async addPermissions(id: string, permissions: string[]) {
    const role = await this.findOne(id);

    const updatedPermissions = Array.from(new Set([...role.permissions, ...permissions]));

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: { permissions: updatedPermissions },
    });

    this.logger.log(`Permissions added to role: ${role.name}`);
    return updatedRole;
  }

  async removePermissions(id: string, permissions: string[]) {
    const role = await this.findOne(id);

    const updatedPermissions = role.permissions.filter(
      (p: string) => !permissions.includes(p),
    );

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: { permissions: updatedPermissions },
    });

    this.logger.log(`Permissions removed from role: ${role.name}`);
    return updatedRole;
  }
}

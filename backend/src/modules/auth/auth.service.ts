import { Injectable, UnauthorizedException, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@modules/prisma/prisma.service';
import { EncryptionService } from '@common/services/encryption.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private encryptionService: EncryptionService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedPassword = (password || '').trim();

    this.logger.log(`Login attempt: email=${normalizedEmail}`);

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        role: true,
        branches: true,
      },
    });

    if (!user) {
      this.logger.warn(`Login failed: user not found for email=${normalizedEmail}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.encryptionService.comparePassword(
      normalizedPassword,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.warn(
        `Login failed: password mismatch for email=${normalizedEmail} userId=${user.id}`,
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      this.logger.warn(
        `Login failed: inactive user for email=${normalizedEmail} userId=${user.id}`,
      );
      throw new UnauthorizedException('User account is inactive');
    }

    // Generate tokens
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    this.logger.log(`User ${user.email} logged in successfully`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        companyId: user.companyId,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, username, password, firstName, lastName, companyName } =
      registerDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }

    // Check if company exists
    const existingCompany = await this.prisma.company.findUnique({
      where: { name: companyName },
    });

    let company = existingCompany;

    // Create company if not exists
    if (!company) {
      company = await this.prisma.company.create({
        data: {
          name: companyName,
          email,
          isActive: true,
        },
      });

      this.logger.log(`New company created: ${company.name}`);
    }

    // Create admin role for company
    let adminRole = await this.prisma.role.findFirst({
      where: {
        name: 'admin',
      },
    });

    if (!adminRole) {
      adminRole = await this.prisma.role.create({
        data: {
          name: 'admin',
          description: 'Administrator role',
          permissions: this.getDefaultAdminPermissions(),
          isSystem: true,
          isActive: true,
        },
      });
    }

    // Create main branch
    let mainBranch = await this.prisma.branch.findFirst({
      where: {
        companyId: company.id,
        code: 'HEAD',
      },
    });

    if (!mainBranch) {
      mainBranch = await this.prisma.branch.create({
        data: {
          companyId: company.id,
          name: 'Head Office',
          code: 'HEAD',
          isActive: true,
        },
      });
    }

    // Hash password
    const hashedPassword = await this.encryptionService.hashPassword(password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        companyId: company.id,
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        roleId: adminRole.id,
        isActive: true,
        branches: {
          create: {
            branchId: mainBranch.id,
          },
        },
      },
      include: {
        role: true,
        branches: true,
      },
    });

    this.logger.log(`New user registered: ${user.email}`);

    // Generate tokens
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        companyId: user.companyId,
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          role: true,
          branches: true,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const newAccessToken = await this.generateAccessToken(user);
      const newRefreshToken = await this.generateRefreshToken(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName ?? undefined,
          lastName: user.lastName ?? undefined,
          companyId: user.companyId,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateAccessToken(user: any): Promise<string> {
    const branchIds = user.branches?.map((b: any) => b.branchId) || [];

    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
      companyId: user.companyId,
      roleId: user.roleId,
      branchIds,
    };

    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRATION || '15m',
    });
  }

  private async generateRefreshToken(user: any): Promise<string> {
    const payload = {
      sub: user.id,
      type: 'refresh',
    };

    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    });
  }

  private getDefaultAdminPermissions(): string[] {
    return [
      'users.create',
      'users.read',
      'users.update',
      'users.delete',
      'roles.create',
      'roles.read',
      'roles.update',
      'roles.delete',
      'branches.create',
      'branches.read',
      'branches.update',
      'branches.delete',
      'employees.create',
      'employees.read',
      'employees.update',
      'employees.delete',
      'vehicles.create',
      'vehicles.read',
      'vehicles.update',
      'vehicles.delete',
      'equipment.create',
      'equipment.read',
      'equipment.update',
      'equipment.delete',
      'finance.create',
      'finance.read',
      'finance.update',
      'finance.delete',
      'reports.read',
      'audit.read',
    ];
  }
}

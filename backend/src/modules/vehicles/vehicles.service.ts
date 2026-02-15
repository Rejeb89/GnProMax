import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { QrCodeService } from '@common/services/qr-code.service';
import { CreateVehicleDto, UpdateVehicleDto, AssignDriverDto } from './dto/vehicle.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger('VehiclesService');

  constructor(
    private prisma: PrismaService,
    private qrCodeService: QrCodeService,
  ) {}

  async create(currentUser: CurrentUser, createVehicleDto: CreateVehicleDto) {
    const { registrationNumber, branchId } = createVehicleDto;

    // Verify branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch || branch.companyId !== currentUser.companyId) {
      throw new NotFoundException('Branch not found');
    }

    // Check if registration number already exists
    if (
      await this.prisma.vehicle.findUnique({
        where: { registrationNumber },
      })
    ) {
      throw new ConflictException('Vehicle registration number already exists');
    }

    // Verify driver if assigned
    if (createVehicleDto.driverId) {
      const driver = await this.prisma.employee.findUnique({
        where: { id: createVehicleDto.driverId },
      });

      if (!driver || driver.companyId !== currentUser.companyId) {
        throw new NotFoundException('Driver not found');
      }
    }

    // Generate QR code
    const qrCodeData = `VEHICLE-${registrationNumber}-${Date.now()}`;
    const qrCode = await this.qrCodeService.generateQRCode(qrCodeData);

    const vehicle = await this.prisma.vehicle.create({
      data: {
        companyId: currentUser.companyId,
        ...createVehicleDto,
        qrCode,
        currentDriver: createVehicleDto.driverId,
      },
    });

    this.logger.log(`Vehicle created: ${vehicle.make} ${vehicle.model}`);
    return vehicle;
  }

  async findAll(currentUser: CurrentUser, skip: number = 0, take: number = 10) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        companyId: currentUser.companyId,
      },
      include: {
        driver: true,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.vehicle.count({
      where: { companyId: currentUser.companyId },
    });

    return {
      data: vehicles,
      total,
      skip,
      take,
    };
  }

  async findOne(currentUser: CurrentUser, id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        branch: true,
        driver: true,
      },
    });

    if (!vehicle || vehicle.companyId !== currentUser.companyId) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async update(
    currentUser: CurrentUser,
    id: string,
    updateVehicleDto: UpdateVehicleDto,
  ) {
    await this.findOne(currentUser, id);

    // Verify new driver if provided
    if (updateVehicleDto.driverId) {
      const driver = await this.prisma.employee.findUnique({
        where: { id: updateVehicleDto.driverId },
      });

      if (!driver || driver.companyId !== currentUser.companyId) {
        throw new NotFoundException('Driver not found');
      }
    }

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        ...updateVehicleDto,
        currentDriver: updateVehicleDto.driverId,
      },
      include: {
        driver: true,
      },
    });

    this.logger.log(`Vehicle updated: ${updatedVehicle.make} ${updatedVehicle.model}`);
    return updatedVehicle;
  }

  async delete(currentUser: CurrentUser, id: string) {
    const vehicle = await this.findOne(currentUser, id);

    await this.prisma.vehicle.delete({
      where: { id },
    });

    this.logger.log(`Vehicle deleted: ${vehicle.make} ${vehicle.model}`);
    return { message: 'Vehicle deleted successfully' };
  }

  async assignDriver(
    currentUser: CurrentUser,
    id: string,
    assignDriverDto: AssignDriverDto,
  ) {
    const vehicle = await this.findOne(currentUser, id);

    const driver = await this.prisma.employee.findUnique({
      where: { id: assignDriverDto.driverId },
    });

    if (!driver || driver.companyId !== currentUser.companyId) {
      throw new NotFoundException('Driver not found');
    }

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        driverId: assignDriverDto.driverId,
        currentDriver: driver.firstName + ' ' + driver.lastName,
      },
      include: {
        driver: true,
      },
    });

    this.logger.log(
      `Driver ${driver.firstName} assigned to vehicle: ${vehicle.registrationNumber}`,
    );
    return updatedVehicle;
  }

  async removeDriver(currentUser: CurrentUser, id: string) {
    await this.findOne(currentUser, id);

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        driverId: null,
        currentDriver: null,
      },
    });

    return updatedVehicle;
  }

  async findByBranch(currentUser: CurrentUser, branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch || branch.companyId !== currentUser.companyId) {
      throw new NotFoundException('Branch not found');
    }

    return this.prisma.vehicle.findMany({
      where: {
        branchId,
        companyId: currentUser.companyId,
      },
      include: {
        driver: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

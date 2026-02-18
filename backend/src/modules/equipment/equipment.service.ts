import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@modules/prisma/prisma.service';
import { QrCodeService } from '@common/services/qr-code.service';
import {
  CreateEquipmentDto,
  UpdateEquipmentDto,
  CreateTransactionDto,
} from './dto/equipment.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Injectable()
export class EquipmentService {
  private readonly logger = new Logger('EquipmentService');

  constructor(
    private prisma: PrismaService,
    private qrCodeService: QrCodeService,
  ) {}

  async create(currentUser: CurrentUser, createEquipmentDto: CreateEquipmentDto) {
    const { serialNumber, branchId } = createEquipmentDto;

    // Verify branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch || branch.companyId !== currentUser.companyId) {
      throw new NotFoundException('Branch not found');
    }

    // Check if serial number already exists
    const existing = await this.prisma.equipment.findUnique({
      where: { serialNumber },
    });

    if (existing) {
      throw new ConflictException('Equipment with this serial number already exists');
    }

    // Generate unique QR code
    const qrCodeData = `EQUIP-${serialNumber}-${Date.now()}`;
    const qrCode = await this.qrCodeService.generateQRCode(qrCodeData);

    const equipment = await this.prisma.equipment.create({
      data: {
        companyId: currentUser.companyId,
        ...createEquipmentDto,
        availableQuantity: createEquipmentDto.availableQuantity ?? createEquipmentDto.quantity ?? 0,
        qrCode,
      },
    });

    this.logger.log(`Equipment created: ${equipment.name}`);
    return equipment;
  }

  async findAll(currentUser: CurrentUser, skip: number = 0, take: number = 10, includeInactive: boolean = false) {
    const where: any = {
      companyId: currentUser.companyId,
    };

    if (!includeInactive) {
      where.isActive = true;
    }

    const equipment = await this.prisma.equipment.findMany({
      where,
      include: {
        transactions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.equipment.count({ where });

    // Calculate global stats for the company
    const allEquipment = await this.prisma.equipment.findMany({
      where: { companyId: currentUser.companyId },
      select: {
        quantity: true,
        availableQuantity: true,
        isActive: true,
      },
    });

    const stats = allEquipment.reduce(
      (acc, item) => {
        acc.totalReceived += item.quantity || 0;
        acc.availableStock += item.availableQuantity || 0;
        return acc;
      },
      { totalReceived: 0, availableStock: 0 },
    );

    return {
      data: equipment,
      total,
      stats: {
        ...stats,
        distributedStock: stats.totalReceived - stats.availableStock,
        totalTypes: allEquipment.filter(e => e.isActive).length,
      },
      skip,
      take,
    };
  }

  async findOne(currentUser: CurrentUser, id: string) {
    const equipment = await this.prisma.equipment.findUnique({
      where: { id },
      include: {
        branch: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!equipment || equipment.companyId !== currentUser.companyId) {
      throw new NotFoundException('Equipment not found');
    }

    return equipment;
  }

  async update(
    currentUser: CurrentUser,
    id: string,
    updateEquipmentDto: UpdateEquipmentDto,
  ) {
    await this.findOne(currentUser, id);

    const updatedEquipment = await this.prisma.equipment.update({
      where: { id },
      data: updateEquipmentDto,
      include: {
        transactions: true,
      },
    });

    this.logger.log(`Equipment updated: ${updatedEquipment.name}`);
    return updatedEquipment;
  }

  async delete(currentUser: CurrentUser, id: string) {
    const equipment = await this.findOne(currentUser, id);

    await this.prisma.equipment.delete({
      where: { id },
    });

    this.logger.log(`Equipment deleted: ${equipment.name}`);
    return { message: 'Equipment deleted successfully' };
  }

  async findByBranch(currentUser: CurrentUser, branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch || branch.companyId !== currentUser.companyId) {
      throw new NotFoundException('Branch not found');
    }

    return this.prisma.equipment.findMany({
      where: {
        branchId,
        companyId: currentUser.companyId,
        isActive: true,
      },
      include: {
        transactions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCategory(
    currentUser: CurrentUser,
    category: string,
    skip: number = 0,
    take: number = 10,
  ) {
    const equipment = await this.prisma.equipment.findMany({
      where: {
        companyId: currentUser.companyId,
        category,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.equipment.count({
      where: {
        companyId: currentUser.companyId,
        category,
      },
    });

    return { data: equipment, total, skip, take };
  }

  async recordTransaction(
    currentUser: CurrentUser,
    createTransactionDto: CreateTransactionDto,
  ) {
    const equipment = await this.findOne(currentUser, createTransactionDto.equipmentId);
    const type = createTransactionDto.transactionType.toUpperCase();
    const quantity = createTransactionDto.quantity;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create the transaction record
      const transaction = await tx.equipmentTransaction.create({
        data: {
          equipmentId: createTransactionDto.equipmentId,
          transactionType: createTransactionDto.transactionType,
          quantity: createTransactionDto.quantity,
          fromLocation: createTransactionDto.fromLocation,
          toLocation: createTransactionDto.toLocation,
          notes: createTransactionDto.notes,
          reference: createTransactionDto.reference,
          createdBy: currentUser.id,
        },
      });

      // 2. Update equipment quantities based on transaction type
      let updateData: any = {};

      if (type === 'IN') {
        updateData = {
          quantity: { increment: quantity },
          availableQuantity: { increment: quantity },
          isActive: true,
        };
      } else if (type === 'RETURN') {
        updateData = {
          availableQuantity: { increment: quantity },
          isActive: true,
        };
      } else if (type === 'OUT' || type === 'HANDOVER' || type === 'MAINTENANCE' || type === 'REPAIR') {
        if (equipment.availableQuantity < quantity) {
          throw new BadRequestException(
            `الكمية المتوفرة غير كافية. المتوفر: ${equipment.availableQuantity}`,
          );
        }
        updateData = {
          availableQuantity: { decrement: quantity },
        };
      }

      if (Object.keys(updateData).length > 0) {
        const updatedEquipment = await tx.equipment.update({
          where: { id: equipment.id },
          data: updateData,
        });

        // 3. Handle handover "deletion" (hiding from active lists)
        if (type === 'HANDOVER' && updatedEquipment.availableQuantity <= 0) {
          await tx.equipment.update({
            where: { id: equipment.id },
            data: { isActive: false },
          });
          this.logger.log(`Equipment marked as inactive after full handover: ${equipment.name}`);
        }
      }

      this.logger.log(`Transaction recorded for equipment: ${equipment.name}`);
      return transaction;
    });
  }

  async getTransactionHistory(
    currentUser: CurrentUser,
    equipmentId: string,
    skip: number = 0,
    take: number = 20,
  ) {
    await this.findOne(currentUser, equipmentId);

    const transactions = await this.prisma.equipmentTransaction.findMany({
      where: { equipmentId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.equipmentTransaction.count({
      where: { equipmentId },
    });

    return { data: transactions, total, skip, take };
  }

  async getLowStock(currentUser: CurrentUser, take: number = 5) {
    const lowStockEquipment = await this.prisma.equipment.findMany({
      where: {
        companyId: currentUser.companyId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        category: true,
        quantity: true,
        lowStockThreshold: true,
        serialNumber: true,
      },
      orderBy: { quantity: 'asc' },
      take,
    });

    // Filter only items where quantity is less than or equal to threshold
    return lowStockEquipment.filter(
      (item: { quantity: number; lowStockThreshold?: number | null }) =>
        item.quantity <= (item.lowStockThreshold ?? 0),
    );
  }
}


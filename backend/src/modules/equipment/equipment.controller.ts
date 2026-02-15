import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { EquipmentService } from './equipment.service';
import {
  CreateEquipmentDto,
  UpdateEquipmentDto,
  CreateTransactionDto,
} from './dto/equipment.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { BranchGuard } from '@common/guards/branch.guard';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('equipment')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class EquipmentController {
  constructor(private equipmentService: EquipmentService) {}

  @Post()
  @RequirePermissions('equipment.create')
  create(
    @CurrentUser() currentUser: CurrentUser,
    @Body() createEquipmentDto: CreateEquipmentDto,
  ) {
    return this.equipmentService.create(currentUser, createEquipmentDto);
  }

  @Get()
  @RequirePermissions('equipment.read')
  findAll(
    @CurrentUser() currentUser: CurrentUser,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ) {
    return this.equipmentService.findAll(
      currentUser,
      parseInt(skip),
      parseInt(take),
    );
  }

  @Get(':id')
  @RequirePermissions('equipment.read')
  findOne(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.equipmentService.findOne(currentUser, id);
  }

  @Put(':id')
  @RequirePermissions('equipment.update')
  update(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ) {
    return this.equipmentService.update(currentUser, id, updateEquipmentDto);
  }

  @Delete(':id')
  @RequirePermissions('equipment.delete')
  delete(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.equipmentService.delete(currentUser, id);
  }

  @Get('branch/:branchId')
  @RequirePermissions('equipment.read')
  findByBranch(
    @CurrentUser() currentUser: CurrentUser,
    @Param('branchId') branchId: string,
  ) {
    return this.equipmentService.findByBranch(currentUser, branchId);
  }

  @Get('category/:category')
  @RequirePermissions('equipment.read')
  findByCategory(
    @CurrentUser() currentUser: CurrentUser,
    @Param('category') category: string,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ) {
    return this.equipmentService.findByCategory(
      currentUser,
      category,
      parseInt(skip),
      parseInt(take),
    );
  }

  @Post('transaction')
  @RequirePermissions('equipment.update')
  recordTransaction(
    @CurrentUser() currentUser: CurrentUser,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.equipmentService.recordTransaction(currentUser, createTransactionDto);
  }

  @Get('low-stock/dashboard')
  @RequirePermissions('equipment.read')
  getLowStock(
    @CurrentUser() currentUser: CurrentUser,
    @Query('take') take: string = '5',
  ) {
    return this.equipmentService.getLowStock(currentUser, parseInt(take));
  }

  @Get(':id/transactions')
  @RequirePermissions('equipment.read')
  getTransactionHistory(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '20',
  ) {
    return this.equipmentService.getTransactionHistory(
      currentUser,
      id,
      parseInt(skip),
      parseInt(take),
    );
  }
}

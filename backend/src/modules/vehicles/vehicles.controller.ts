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
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto, AssignDriverDto } from './dto/vehicle.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { BranchGuard } from '@common/guards/branch.guard';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Post()
  @RequirePermissions('vehicles.create')
  create(
    @CurrentUser() currentUser: CurrentUser,
    @Body() createVehicleDto: CreateVehicleDto,
  ) {
    return this.vehiclesService.create(currentUser, createVehicleDto);
  }

  @Get()
  @RequirePermissions('vehicles.read')
  findAll(
    @CurrentUser() currentUser: CurrentUser,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ) {
    return this.vehiclesService.findAll(
      currentUser,
      parseInt(skip),
      parseInt(take),
    );
  }

  @Get(':id')
  @RequirePermissions('vehicles.read')
  findOne(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.vehiclesService.findOne(currentUser, id);
  }

  @Put(':id')
  @RequirePermissions('vehicles.update')
  update(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(currentUser, id, updateVehicleDto);
  }

  @Delete(':id')
  @RequirePermissions('vehicles.delete')
  delete(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.vehiclesService.delete(currentUser, id);
  }

  @Post(':id/driver')
  @RequirePermissions('vehicles.update')
  assignDriver(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
    @Body() assignDriverDto: AssignDriverDto,
  ) {
    return this.vehiclesService.assignDriver(currentUser, id, assignDriverDto);
  }

  @Delete(':id/driver')
  @RequirePermissions('vehicles.update')
  removeDriver(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.vehiclesService.removeDriver(currentUser, id);
  }

  @Get('branch/:branchId')
  @RequirePermissions('vehicles.read')
  findByBranch(
    @CurrentUser() currentUser: CurrentUser,
    @Param('branchId') branchId: string,
  ) {
    return this.vehiclesService.findByBranch(currentUser, branchId);
  }
}

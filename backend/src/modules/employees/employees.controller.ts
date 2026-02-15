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
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { BranchGuard } from '@common/guards/branch.guard';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Post()
  @RequirePermissions('employees.create')
  create(
    @CurrentUser() currentUser: CurrentUser,
    @Body() createEmployeeDto: CreateEmployeeDto,
  ) {
    return this.employeesService.create(currentUser, createEmployeeDto);
  }

  @Get()
  @RequirePermissions('employees.read')
  findAll(
    @CurrentUser() currentUser: CurrentUser,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ) {
    return this.employeesService.findAll(
      currentUser,
      parseInt(skip),
      parseInt(take),
    );
  }

  @Get(':id')
  @RequirePermissions('employees.read')
  findOne(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.employeesService.findOne(currentUser, id);
  }

  @Put(':id')
  @RequirePermissions('employees.update')
  update(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(currentUser, id, updateEmployeeDto);
  }

  @Delete(':id')
  @RequirePermissions('employees.delete')
  delete(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.employeesService.delete(currentUser, id);
  }

  @Get('branch/:branchId')
  @RequirePermissions('employees.read')
  findByBranch(
    @CurrentUser() currentUser: CurrentUser,
    @Param('branchId') branchId: string,
  ) {
    return this.employeesService.findByBranch(currentUser, branchId);
  }
}

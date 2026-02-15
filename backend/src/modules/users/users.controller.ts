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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto, AssignBranchDto } from './dto/user.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { BranchGuard } from '@common/guards/branch.guard';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @RequirePermissions('users.create')
  create(
    @CurrentUser() currentUser: CurrentUser,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(currentUser, createUserDto);
  }

  @Get()
  @RequirePermissions('users.read')
  findAll(
    @CurrentUser() currentUser: CurrentUser,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ) {
    return this.usersService.findAll(
      currentUser,
      parseInt(skip),
      parseInt(take),
    );
  }

  @Get(':id')
  @RequirePermissions('users.read')
  findOne(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.usersService.findOne(currentUser, id);
  }

  @Put(':id')
  @RequirePermissions('users.update')
  update(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(currentUser, id, updateUserDto);
  }

  @Delete(':id')
  @RequirePermissions('users.delete')
  delete(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.usersService.delete(currentUser, id);
  }

  @Post('change-password')
  changePassword(
    @CurrentUser() currentUser: CurrentUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(currentUser, changePasswordDto);
  }

  @Post(':id/branches')
  @RequirePermissions('users.update')
  assignBranch(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
    @Body() assignBranchDto: AssignBranchDto,
  ) {
    return this.usersService.assignBranch(currentUser, id, assignBranchDto);
  }

  @Delete(':id/branches/:branchId')
  @RequirePermissions('users.update')
  removeBranch(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
    @Param('branchId') branchId: string,
  ) {
    return this.usersService.removeBranch(currentUser, id, branchId);
  }
}

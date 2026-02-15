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
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post()
  @RequirePermissions('roles.create')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @RequirePermissions('roles.read')
  findAll(
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ) {
    return this.rolesService.findAll(parseInt(skip), parseInt(take));
  }

  @Get(':id')
  @RequirePermissions('roles.read')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions('roles.update')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @RequirePermissions('roles.delete')
  delete(@Param('id') id: string) {
    return this.rolesService.delete(id);
  }

  @Post(':id/permissions/add')
  @RequirePermissions('roles.update')
  addPermissions(@Param('id') id: string, @Body() { permissions }: any) {
    return this.rolesService.addPermissions(id, permissions);
  }

  @Post(':id/permissions/remove')
  @RequirePermissions('roles.update')
  removePermissions(@Param('id') id: string, @Body() { permissions }: any) {
    return this.rolesService.removePermissions(id, permissions);
  }
}

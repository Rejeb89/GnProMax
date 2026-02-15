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
import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { BranchGuard } from '@common/guards/branch.guard';
import { AllowMultipleBranches } from '@common/decorators/allow-branches.decorator';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard)
@AllowMultipleBranches()
export class BranchesController {
  constructor(private branchesService: BranchesService) {}

  @Post()
  @RequirePermissions('branches.create')
  create(
    @CurrentUser() currentUser: CurrentUser,
    @Body() createBranchDto: CreateBranchDto,
  ) {
    return this.branchesService.create(currentUser, createBranchDto);
  }

  @Get()
  @RequirePermissions('branches.read')
  findAll(
    @CurrentUser() currentUser: CurrentUser,
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ) {
    return this.branchesService.findAll(
      currentUser,
      parseInt(skip),
      parseInt(take),
    );
  }

  @Get(':id')
  @RequirePermissions('branches.read')
  @UseGuards(BranchGuard)
  findOne(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.branchesService.findOne(currentUser, id);
  }

  @Put(':id')
  @RequirePermissions('branches.update')
  @UseGuards(BranchGuard)
  update(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    return this.branchesService.update(currentUser, id, updateBranchDto);
  }

  @Delete(':id')
  @RequirePermissions('branches.delete')
  @UseGuards(BranchGuard)
  delete(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ) {
    return this.branchesService.delete(currentUser, id);
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { BRANCHES_KEY } from '../decorators/allow-branches.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

@Injectable()
export class BranchGuard implements CanActivate {
  private readonly logger = new Logger('BranchGuard');

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowMultipleBranches = this.reflector.getAllAndOverride<boolean>(
      BRANCHES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as CurrentUser;
    const { branchId } = request.params;

    if (!user) {
      throw new ForbiddenException('User information not found');
    }

    // Allow multiple branches or check specific branch access
    if (allowMultipleBranches) {
      return true;
    }

    if (branchId && !user.branchIds.includes(branchId)) {
      this.logger.warn(
        `User ${user.id} attempted to access branch ${branchId} without permission`,
      );
      throw new ForbiddenException('Access to this branch is not allowed');
    }

    return true;
  }
}

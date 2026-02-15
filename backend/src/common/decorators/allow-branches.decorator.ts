import { SetMetadata } from '@nestjs/common';

export const BRANCHES_KEY = 'branches';
export const AllowMultipleBranches = () => SetMetadata(BRANCHES_KEY, true);

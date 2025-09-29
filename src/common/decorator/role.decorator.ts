import { SetMetadata } from '@nestjs/common';
import { Role } from '../../v1/user/enum/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

import { SetMetadata } from "@nestjs/common";

export const ROLE_KEY = 'expectedRole';
export const Role = (role: string) => SetMetadata(ROLE_KEY,role) 

// @Roles('admin') @Roles('student') - allow only those role guys
// if not specified any role is accepted
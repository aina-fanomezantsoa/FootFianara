import type { Role } from "../generated/prisma/client";

export const MAX_STAFF = 3;

const LEVEL: Record<Role, number> = { ASSISTANT: 1, ADMIN: 2, SUPER_ADMIN: 3 };

export const hasRole = (role: Role, min: Role) => LEVEL[role] >= LEVEL[min];

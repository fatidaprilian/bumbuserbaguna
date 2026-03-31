import { z } from "zod";
import { USER_ROLES } from "../../modules/identity-access/domain/user-role.ts";

// ---------------------------------------------------------------------------
// Register — POST /v1/auth/register
// ---------------------------------------------------------------------------

export const registerUserSchema = z.object({
  institutionId: z.string().uuid(),
  emailAddress: z.string().email().toLowerCase().max(255),
  fullName: z.string().min(2).max(150).trim(),
  roleCode: z.enum(USER_ROLES),
  password: z.string().min(8).max(128),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;

// ---------------------------------------------------------------------------
// Login — POST /v1/auth/login
// ---------------------------------------------------------------------------

export const loginUserSchema = z.object({
  institutionId: z.string().uuid(),
  emailAddress: z.string().email().toLowerCase().max(255),
  password: z.string().min(1).max(128),
});

export type LoginUserDto = z.infer<typeof loginUserSchema>;

// ---------------------------------------------------------------------------
// Refresh token — POST /v1/auth/refresh
// ---------------------------------------------------------------------------

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;

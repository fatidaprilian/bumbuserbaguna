import type { UserRole } from "../domain/user-role.ts";

// ---------------------------------------------------------------------------
// Request DTOs
// ---------------------------------------------------------------------------

export interface RegisterRequestBody {
  institutionId: string;
  emailAddress: string;
  fullName: string;
  roleCode: UserRole;
  password: string;
}

export interface LoginRequestBody {
  institutionId: string;
  emailAddress: string;
  password: string;
}

export interface RefreshRequestBody {
  refreshToken: string;
}

// ---------------------------------------------------------------------------
// Response DTOs
// ---------------------------------------------------------------------------

export interface TokenResponseBody {
  accessToken: string;
  refreshToken: string;
  userId: string;
  roleCode: UserRole;
}

export interface RegisterResponseBody {
  accessToken: string;
  refreshToken: string;
  userId: string;
  roleCode: UserRole;
}

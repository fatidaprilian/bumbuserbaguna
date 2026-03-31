import type { UserRole } from "../domain/user-role.ts";

// ---------------------------------------------------------------------------
// Persistence model — returned by repository, never escapes to transport layer
// ---------------------------------------------------------------------------

export interface PersistedUser {
  userId: string;
  institutionId: string;
  emailAddress: string;
  fullName: string;
  roleCode: UserRole;
  passwordHash: string;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Repository contract — implementations must satisfy this interface exactly
// ---------------------------------------------------------------------------

export interface IdentityAccessRepository {
  findUserByEmailAndTenant(
    emailAddress: string,
    institutionId: string,
  ): Promise<PersistedUser | null>;

  findUserById(userId: string): Promise<PersistedUser | null>;

  createUser(params: {
    institutionId: string;
    emailAddress: string;
    fullName: string;
    roleCode: UserRole;
    passwordHash: string;
  }): Promise<PersistedUser>;
}

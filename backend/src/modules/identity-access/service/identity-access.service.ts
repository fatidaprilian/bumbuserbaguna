import argon2 from "argon2";
import { ApplicationError } from "../../../shared/errors/application-error.ts";
import type { UserRole } from "../domain/user-role.ts";
import type { IdentityAccessRepository } from "../repository/identity-access.repository-contract.ts";

// ---------------------------------------------------------------------------
// Command and result types — no HTTP concerns, no framework imports
// ---------------------------------------------------------------------------

export interface RegisterUserCommand {
  institutionId: string;
  emailAddress: string;
  fullName: string;
  roleCode: UserRole;
  plainTextPassword: string;
}

export interface LoginUserCommand {
  institutionId: string;
  emailAddress: string;
  plainTextPassword: string;
}

export interface TokenPair {
  userId: string;
  institutionId: string;
  emailAddress: string;
  roleCode: UserRole;
}

// ---------------------------------------------------------------------------
// Service — pure business orchestration, NO HTTP/framework imports allowed
// ---------------------------------------------------------------------------

export class IdentityAccessService {
  constructor(private readonly identityAccessRepository: IdentityAccessRepository) {}

  public async registerUser(command: RegisterUserCommand): Promise<TokenPair> {
    const existingUser = await this.identityAccessRepository.findUserByEmailAndTenant(
      command.emailAddress,
      command.institutionId,
    );

    if (existingUser !== null) {
      throw new ApplicationError(
        "VALIDATION_ERROR",
        "An account with this email already exists for this institution.",
      );
    }

    const passwordHash = await argon2.hash(command.plainTextPassword, {
      type: argon2.argon2id,
      memoryCost: 65_536, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });

    const persistedUser = await this.identityAccessRepository.createUser({
      institutionId: command.institutionId,
      emailAddress: command.emailAddress,
      fullName: command.fullName,
      roleCode: command.roleCode,
      passwordHash,
    });

    return {
      userId: persistedUser.userId,
      institutionId: persistedUser.institutionId,
      emailAddress: persistedUser.emailAddress,
      roleCode: persistedUser.roleCode,
    };
  }

  public async loginUser(command: LoginUserCommand): Promise<TokenPair> {
    const persistedUser = await this.identityAccessRepository.findUserByEmailAndTenant(
      command.emailAddress,
      command.institutionId,
    );

    if (persistedUser === null) {
      // Deliberately vague — do not confirm whether the email exists
      throw new ApplicationError("UNAUTHORIZED", "Invalid email or password.");
    }

    const isPasswordCorrect = await argon2.verify(
      persistedUser.passwordHash,
      command.plainTextPassword,
    );

    if (!isPasswordCorrect) {
      throw new ApplicationError("UNAUTHORIZED", "Invalid email or password.");
    }

    return {
      userId: persistedUser.userId,
      institutionId: persistedUser.institutionId,
      emailAddress: persistedUser.emailAddress,
      roleCode: persistedUser.roleCode,
    };
  }
}

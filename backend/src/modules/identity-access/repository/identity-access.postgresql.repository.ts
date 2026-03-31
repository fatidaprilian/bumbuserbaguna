import type { DatabaseQueryExecutor } from "../../../shared/database/postgresql-client.ts";
import type { UserRole } from "../domain/user-role.ts";
import type { IdentityAccessRepository, PersistedUser } from "./identity-access.repository-contract.ts";

// ---------------------------------------------------------------------------
// Row shape returned from PostgreSQL — kept private to this file
// ---------------------------------------------------------------------------

interface UserRow {
  user_id: string;
  institution_id: string;
  email_address: string;
  full_name: string;
  role_code: UserRole;
  password_hash: string;
  created_at: Date;
}

function mapUserRowToPersistedUser(userRow: UserRow): PersistedUser {
  return {
    userId: userRow.user_id,
    institutionId: userRow.institution_id,
    emailAddress: userRow.email_address,
    fullName: userRow.full_name,
    roleCode: userRow.role_code,
    passwordHash: userRow.password_hash,
    createdAt: userRow.created_at,
  };
}

export class PostgresqlIdentityAccessRepository implements IdentityAccessRepository {
  constructor(private readonly databaseClient: DatabaseQueryExecutor) {}

  public async findUserByEmailAndTenant(
    emailAddress: string,
    institutionId: string,
  ): Promise<PersistedUser | null> {
    const queryResult = await this.databaseClient.query<UserRow>(
      `SELECT user_id, institution_id, email_address, full_name, role_code, password_hash, created_at
       FROM users
       WHERE email_address = $1 AND institution_id = $2
       LIMIT 1`,
      [emailAddress, institutionId],
    );

    const userRow = queryResult.rows[0];
    return userRow != null ? mapUserRowToPersistedUser(userRow) : null;
  }

  public async findUserById(userId: string): Promise<PersistedUser | null> {
    const queryResult = await this.databaseClient.query<UserRow>(
      `SELECT user_id, institution_id, email_address, full_name, role_code, password_hash, created_at
       FROM users
       WHERE user_id = $1
       LIMIT 1`,
      [userId],
    );

    const userRow = queryResult.rows[0];
    return userRow != null ? mapUserRowToPersistedUser(userRow) : null;
  }

  public async createUser(params: {
    institutionId: string;
    emailAddress: string;
    fullName: string;
    roleCode: UserRole;
    passwordHash: string;
  }): Promise<PersistedUser> {
    const queryResult = await this.databaseClient.query<UserRow>(
      `INSERT INTO users (institution_id, email_address, full_name, role_code, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, institution_id, email_address, full_name, role_code, password_hash, created_at`,
      [
        params.institutionId,
        params.emailAddress,
        params.fullName,
        params.roleCode,
        params.passwordHash,
      ],
    );

    const insertedRow = queryResult.rows[0];
    if (!insertedRow) {
      throw new Error("[IdentityAccessRepository] INSERT returned no rows — unexpected state");
    }

    return mapUserRowToPersistedUser(insertedRow);
  }
}

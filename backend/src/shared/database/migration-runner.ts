import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { nanoid } from "nanoid";
import type { Pool } from "pg";

export interface Migration {
  name: string;
  version: string;
  executedAt?: Date;
}

export class MigrationRunner {
  private migrationsDir: string;

  constructor(
    private readonly pool: Pool,
    migrationsDir: string = join(process.cwd(), "backend", "db", "migrations"),
  ) {
    this.migrationsDir = migrationsDir;
  }

  /**
   * Initialize migrations tracking table if it doesn't exist
   */
  public async initializeMigrationsTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        migration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await this.pool.query(createTableSQL);
  }

  /**
   * Get list of already-executed migrations
   */
  private async getExecutedMigrations(): Promise<Set<string>> {
    const result = await this.pool.query(
      "SELECT migration_name FROM schema_migrations ORDER BY executed_at",
    );

    return new Set(result.rows.map((row) => row.migration_name as string));
  }

  /**
   * Get list of migration files from directory (sorted by name)
   */
  private async getMigrationFiles(): Promise<string[]> {
    try {
      const files = await readdir(this.migrationsDir);
      return files
        .filter((f) => f.endsWith(".sql"))
        .sort(); // YYYYMMDD_HHMMSS_*.sql naturally sorts in creation order
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  /**
   * Run all pending migrations in order
   */
  public async runPendingMigrations(): Promise<Migration[]> {
    await this.initializeMigrationsTable();

    const executedMigrations = await this.getExecutedMigrations();
    const migrationFiles = await this.getMigrationFiles();

    const appliedMigrations: Migration[] = [];

    for (const filename of migrationFiles) {
      if (executedMigrations.has(filename)) {
        console.log(`⏭️  Skipping migration (already executed): ${filename}`);
        continue;
      }

      console.log(`⬆️  Applying migration: ${filename}`);

      const migrationPath = join(this.migrationsDir, filename);
      const migrationSQL = await readFile(migrationPath, "utf-8");

      try {
        await this.pool.query(migrationSQL);

        // Record successful migration
        await this.pool.query(
          "INSERT INTO schema_migrations (migration_name) VALUES ($1)",
          [filename],
        );

        appliedMigrations.push({
          name: filename,
          version: filename.split("_")[0] || "unknown",
          executedAt: new Date(),
        });

        console.log(`✅ Successfully applied migration: ${filename}`);
      } catch (error) {
        console.error(
          `❌ Migration failed: ${filename}`,
          error instanceof Error ? error.message : error,
        );
        throw new Error(
          `Migration ${filename} failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return appliedMigrations;
  }

  /**
   * Get status of all migrations
   */
  public async getMigrationStatus(): Promise<{
    executed: Migration[];
    pending: string[];
  }> {
    await this.initializeMigrationsTable();

    const executedMigrations = await this.getExecutedMigrations();
    const migrationFiles = await this.getMigrationFiles();

    const executed: Migration[] = [];
    const pending: string[] = [];

    const result = await this.pool.query(
      "SELECT migration_name, executed_at FROM schema_migrations ORDER BY executed_at",
    );

    for (const row of result.rows) {
      executed.push({
        name: row.migration_name as string,
        version: (row.migration_name as string).split("_")[0] || "unknown",
        executedAt: row.executed_at as Date,
      });
    }

    for (const filename of migrationFiles) {
      if (!executedMigrations.has(filename)) {
        pending.push(filename);
      }
    }

    return { executed, pending };
  }
}

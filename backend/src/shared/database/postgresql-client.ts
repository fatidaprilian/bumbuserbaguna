import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

export interface DatabaseQueryExecutor {
  query<TResultRow extends QueryResultRow>(
    sqlText: string,
    values?: unknown[],
  ): Promise<QueryResult<TResultRow>>;
}

export interface DatabaseClient extends DatabaseQueryExecutor {
  connect(): Promise<PoolClient>;
}

export function createPostgresqlClient(connectionString: string): DatabaseClient {
  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
  });
}

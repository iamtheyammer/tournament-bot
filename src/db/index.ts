import { QueryBuilder } from "knex";

// fixes issue during import
// eslint-disable-next-line @typescript-eslint/no-var-requires
const knex = require("knex");

export interface DBQueryMeta {
  limit?: number;
  offset?: number;
  order_by?: {
    // expression
    exp: string;
    // direction
    dir: "ASC" | "DESC";
  };
}

export function handleMeta(query: QueryBuilder, meta: DBQueryMeta): void {
  if (!meta) {
    return;
  }

  if (meta.limit) {
    query.limit(meta.limit);
  }

  if (meta.offset) {
    query.offset(meta.offset);
  }

  if (meta.order_by) {
    query.orderBy(meta.order_by.exp, meta.order_by.dir);
  }
}

const databaseConnString = process.env.DATABASE_DSN || process.env.DATABASE_URL;
const local = process.env.NODE_ENV !== "production";

const db = knex({
  client: "pg",
  connection: {
    ssl: local ? false : { rejectUnauthorized: false },
    connectionString: databaseConnString,
  },
});

export default db;

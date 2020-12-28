// fixes issue during import
// eslint-disable-next-line @typescript-eslint/no-var-requires
const knex = require("knex");

const db = knex({
  client: "pg",
  connection: process.env.DATABASE_DSN,
});

export default db;

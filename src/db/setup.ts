import db from "./index";
import Knex from "knex";

type DatabaseChangeType = "created" | "altered" | "unchanged";

type DatabaseSetupResult = { [tableName: string]: DatabaseChangeType };

export async function setupDatabase(): Promise<DatabaseSetupResult> {
  const trx = await db.transaction();

  const usersStatus = await setupUsersTable(trx);
  const tournamentsStatus = await setupTournamentsTable(trx);
  const teamsStatus = await setupTeamsTable(trx);
  const teamMembershipsStatus = await setupTeamMembershipsTable(trx);

  await trx.commit();

  return {
    users: usersStatus,
    tournaments: tournamentsStatus,
    teams: teamsStatus,
    team_memberships: teamMembershipsStatus,
  };
}

async function setupUsersTable(
  trx: Knex.Transaction
): Promise<DatabaseChangeType> {
  const usersTableExists = await trx.schema.hasTable("users");

  if (usersTableExists) {
    // we might need to check for certain columns in the future

    return "unchanged";
  }

  await trx.schema.createTable("users", (tableBuilder) => {
    tableBuilder.bigInteger("discord_id").primary().notNullable();
    tableBuilder.uuid("minecraft_uuid");
  });

  return "created";
}

async function setupTournamentsTable(
  trx: Knex.Transaction
): Promise<DatabaseChangeType> {
  const tournamentsTableExists = await trx.schema.hasTable("teams");

  if (tournamentsTableExists) {
    // we might need to check for certain columns in the future

    return "unchanged";
  }

  await trx.schema.createTable("tournaments", (tableBuilder) => {
    tableBuilder.increments("id").primary().unique().notNullable();
    tableBuilder.text("name").notNullable();
    tableBuilder.text("short_name").unique().notNullable();
    tableBuilder.index("short_name");
    tableBuilder.text("gamemode").notNullable();
  });

  return "created";
}

async function setupTeamsTable(
  trx: Knex.Transaction
): Promise<DatabaseChangeType> {
  const teamsTableExists = await trx.schema.hasTable("teams");

  if (teamsTableExists) {
    // we might need to check for certain columns in the future

    return "unchanged";
  }

  await trx.schema.createTable("teams", (tableBuilder) => {
    tableBuilder.increments("id").primary().unique().notNullable();
    tableBuilder
      .integer("tournament_id")
      .references("tournaments.id")
      .notNullable();
    tableBuilder.text("name").notNullable();
    tableBuilder.text("tag").unique().notNullable();
    tableBuilder.index("tag");
    tableBuilder.text("description");
    tableBuilder.boolean("public").notNullable().defaultTo(false);
  });

  return "created";
}

async function setupTeamMembershipsTable(
  trx: Knex.Transaction
): Promise<DatabaseChangeType> {
  const membershipsTableExists = await trx.schema.hasTable("team_memberships");

  if (membershipsTableExists) {
    // we might need to check for certain columns in the future

    return "unchanged";
  }

  await trx.schema.createTable("team_memberships", (tableBuilder) => {
    tableBuilder.increments("id").primary().notNullable();
    tableBuilder
      .integer("tournament_id")
      .references("tournaments.id")
      .notNullable();
    tableBuilder
      .bigInteger("user_id")
      .references("users.discord_id")
      .notNullable();
    tableBuilder.integer("team_id").references("teams.id").notNullable();
    tableBuilder.text("type").defaultTo("member").notNullable();
  });

  return "created";
}

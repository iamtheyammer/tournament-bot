import db, { DBQueryMeta, handleMeta } from "./index";

interface DBTournament {
  id: number;
  name: string;
  short_name: string;
  gamemode: string;
  opens_at: Date;
  starts_at: Date;
  inserted_at: Date;
}

interface DBTournamentInsertRequest {
  name: string;
  short_name: string;
  gamemode: string;
  opens_at?: Date;
  starts_at?: Date;
}

export async function insertTournament(
  req: DBTournamentInsertRequest
): Promise<number> {
  const { name, short_name, gamemode, opens_at, starts_at } = req;

  const row = {
    name,
    short_name,
    gamemode,
  };

  if (opens_at) {
    row["opens_at"] = opens_at;
  }

  if (starts_at) {
    row["starts_at"] = starts_at;
  }

  const rows = await db("tournaments").insert(row).returning("id");

  return rows[0];
}

interface DBTournamentUpdateRequest {
  name?: string;
  short_name?: string;
  gamemode?: string;
  opens_at?: Date;
  starts_at?: Date;

  where: {
    id?: number;
    short_name?: string;
  };
}

export async function updateTournament(
  req: DBTournamentUpdateRequest
): Promise<void> {
  const { name, short_name, gamemode, opens_at, starts_at, where } = req;

  const query = db("tournaments").where(where);

  const update = {};

  if (name) {
    update["name"] = name;
  }

  if (short_name) {
    update["short_name"] = short_name;
  }

  if (gamemode) {
    update["gamemode"] = gamemode;
  }

  if (opens_at) {
    update["opens_at"] = opens_at;
  }

  if (starts_at) {
    update["starts_at"] = starts_at;
  }

  query.update(update);

  await query;
}

interface DBTournamentListRequestMeta extends DBQueryMeta {
  active_only?: boolean;
}

interface DBTournamentListRequest {
  id?: number;
  name?: string;
  short_name?: string;
  gamemode?: string;
  opens_at?: Date;
  starts_at?: Date;
  meta: DBTournamentListRequestMeta;
}

export async function listTournaments(
  req: DBTournamentListRequest
): Promise<DBTournament[]> {
  const { id, name, short_name, gamemode, opens_at, starts_at, meta } = req;

  const query = db("tournaments");

  const search = {};

  if (id) {
    search["id"] = id;
  }

  if (name) {
    search["name"] = name;
  }

  if (short_name) {
    search["short_name"] = short_name;
  }

  if (gamemode) {
    search["gamemode"] = gamemode;
  }

  if (opens_at) {
    search["opens_at"] = opens_at;
  }

  if (starts_at) {
    search["starts_at"] = starts_at;
  }

  if (meta) {
    if (meta.active_only) {
      query.where("opens_at", "<", db.fn.now());
      query.where("starts_at", ">", db.fn.now());
    }

    handleMeta(query, meta);
  }

  return await query;
}

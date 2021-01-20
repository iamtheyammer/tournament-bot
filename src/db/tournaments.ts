import db, { DBQueryMeta, handleMeta } from "./index";

export interface DBTournament {
  id: number;
  name: string;
  short_name: string;
  gamemode: string;
  max_team_size: number;
  opens_at: Date;
  starts_at: Date;
  participant_role_id: string;
  inserted_at: Date;
}

interface DBTournamentInsertRequest {
  name: string;
  short_name: string;
  gamemode: string;
  max_team_size: number;
  opens_at?: Date;
  starts_at?: Date;
  participant_role_id?: string;
}

export async function insertTournament(
  req: DBTournamentInsertRequest
): Promise<number> {
  const rows = await db("tournaments").insert(req).returning("id");

  return rows[0];
}

interface DBTournamentUpdateRequest {
  name?: string;
  short_name?: string;
  gamemode?: string;
  max_team_size: number;
  opens_at?: Date;
  starts_at?: Date;
  participant_role_id?: string;

  where: {
    id?: number;
    short_name?: string;
  };
}

export async function updateTournament(
  req: DBTournamentUpdateRequest
): Promise<void> {
  const {
    name,
    short_name,
    gamemode,
    max_team_size,
    opens_at,
    starts_at,
    participant_role_id,
    where,
  } = req;

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

  if (max_team_size) {
    update["max_team_size"] = max_team_size;
  }

  if (opens_at) {
    update["opens_at"] = opens_at;
  }

  if (starts_at) {
    update["starts_at"] = starts_at;
  }

  if (participant_role_id) {
    update["participant_role_id"] = participant_role_id;
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
  max_team_size?: number;
  opens_at?: Date;
  starts_at?: Date;
  participant_role_id?: string;
  meta?: DBTournamentListRequestMeta;
}

export async function listTournaments(
  req: DBTournamentListRequest
): Promise<DBTournament[]> {
  const {
    id,
    name,
    short_name,
    gamemode,
    max_team_size,
    opens_at,
    starts_at,
    participant_role_id,
    meta,
  } = req;

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

  if (max_team_size) {
    search["max_team_size"] = max_team_size;
  }

  if (opens_at) {
    search["opens_at"] = opens_at;
  }

  if (starts_at) {
    search["starts_at"] = starts_at;
  }

  if (participant_role_id) {
    search["participant_role_id"] = participant_role_id;
  }

  if (meta) {
    if (meta.active_only) {
      query.orderBy("id", "DESC").limit(1);
    }

    handleMeta(query, meta);
  }

  return await query;
}

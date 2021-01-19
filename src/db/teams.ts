import { Transaction } from "knex";
import db, { DBQueryMeta, handleMeta } from "./index";

export interface DBTeam {
  id: number;
  tournament_id: number;
  name: string;
  tag: string;
  role_id: string;
  category_id: string;
  description?: string;
  public: boolean;
  inserted_at: Date;
}

interface DBTeamInsertRequest {
  tournament_id: number;
  name: string;
  tag: string;
  role_id?: string;
  category_id?: string;
  description?: string;
  public?: boolean;
}

// returns the newly created team ID
export async function insertTeam(
  req: DBTeamInsertRequest,
  database: Transaction = db
): Promise<number> {
  const {
    tournament_id,
    name,
    tag,
    role_id,
    category_id,
    description,
    public: isPublic,
  } = req;

  const row = {
    tournament_id,
    name,
    tag,
    role_id,
    category_id,
  };

  if (description) {
    row["description"] = description;
  }

  if (isPublic) {
    row["public"] = isPublic;
  }

  const rows = await database("teams").insert(row).returning("id");

  return rows[0];
}

interface DBTeamUpdateRequest {
  tournament_id?: number;
  tag?: string;
  name?: string;
  role_id?: string;
  category_id?: string;
  description?: string;
  public?: boolean;
  where: {
    id?: number;
    tag?: string;
  };
}

export async function updateTeam(
  req: DBTeamUpdateRequest,
  database: Transaction = db
): Promise<void> {
  const query = database("teams").where(req.where);

  const update = {};

  if (req.tournament_id) {
    update["tournament_id"] = req.tournament_id;
  }

  if (req.tag) {
    update["tag"] = req.tag;
  }

  if (req.name !== undefined) {
    update["name"] = req.name;
  }

  if (req.role_id) {
    update["role_id"] = req.role_id;
  }

  if (req.category_id) {
    update["category_id"] = req.category_id;
  }

  if (req.description !== undefined) {
    update["description"] = req.description;
  }

  if (req.public) {
    update["public"] = req.public;
  }

  query.update(update);

  await query;
}

interface DBTeamDeleteRequest {
  id?: number;
  tournament_id?: number;
  tag?: string;
  name?: string;
  role_id?: string;
  category_id?: string;
  public?: boolean;
}

export async function deleteTeams(
  req: DBTeamDeleteRequest,
  database: Transaction = db
): Promise<void> {
  await database("teams").where(req).del();
}

interface DBListTeamsRequest {
  id?: number;
  tournament_id?: number;
  tag?: string;
  name?: string;
  role_id?: string;
  category_id?: string;
  public?: boolean;
  user_id?: string;
  meta?: DBQueryMeta;
}

export async function listTeams(
  req: DBListTeamsRequest,
  database: Transaction = db
): Promise<DBTeam[]> {
  const query = database("teams");

  if (req.id) {
    query.where({ id: req.id });
  }

  if (req.tournament_id) {
    query.where({ tournament_id: req.tournament_id });
  }

  if (req.tag) {
    query.where({ tag: req.tag });
  }

  if (req.name) {
    query.where({ name: req.name });
  }

  if (req.role_id) {
    query.where({ name: req.role_id });
  }

  if (req.category_id) {
    query.where({ name: req.category_id });
  }

  if (req.public) {
    query.where({ public: req.public });
  }

  if (req.user_id) {
    query
      .join("team_memberships", "teams.id", "team_memberships.team_id")
      .where({ "team_memberships.user_id": req.user_id });
  }

  handleMeta(query, req.meta);

  return await query;
}

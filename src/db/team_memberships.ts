import db, { DBQueryMeta } from "./index";

export interface DBTeamMembership {
  id: number;
  user_id: string;
  team_id: number;
  tournament_id: number;
  invite_id?: number;
  type: string;
  inserted_at: string;
}

interface DBTeamMembershipInsertRequest {
  user_id: string;
  team_id: number;
  tournament_id: number;
  invite_id?: number;
  type?: string;
}

export async function insertTeamMemberships(
  req: DBTeamMembershipInsertRequest | DBTeamMembershipInsertRequest[]
): Promise<number> {
  const rows = await db("team_memberships").insert(req).returning("id");

  return rows[0];
}

interface DBTeamMembershipDeleteRequest {
  id?: number;
  user_id?: string;
  team_id?: number;
  tournament_id?: number;
  invite_id?: number;
  type?: string;
}

export async function deleteTeamMemberships(
  req: DBTeamMembershipDeleteRequest
): Promise<void> {
  await db("team_memberships").where(req).del();
}

interface DBTeamMembershipListRequest {
  id?: number;
  user_id?: string;
  team_id?: number;
  tournament_id?: number;
  invite_id?: number;
  type?: string;
  team_tag?: string;
  meta?: DBQueryMeta;
}

export async function listTeamMemberships(
  req: DBTeamMembershipListRequest
): Promise<DBTeamMembership[]> {
  const {
    id,
    user_id,
    team_id,
    tournament_id,
    invite_id,
    type,
    team_tag,
    meta,
  } = req;

  const query = db("team_memberships");
  const search = {};

  if (id) {
    search["id"] = id;
  }

  if (user_id) {
    search["user_id"] = user_id;
  }

  if (team_id) {
    search["team_id"] = team_id;
  }

  if (tournament_id) {
    search["tournament_id"] = tournament_id;
  }

  if (invite_id) {
    search["invite_id"] = invite_id;
  }

  if (type) {
    search["type"] = type;
  }

  if (team_tag) {
    query.join("teams", "team_memberships.id", "teams.id");
    search["teams.tag"] = team_tag;
  }

  query.where(search);

  if (meta) {
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

  return await query;
}

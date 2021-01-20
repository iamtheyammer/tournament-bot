import db, { DBQueryMeta, handleMeta } from "./index";
import { Transaction } from "knex";

interface DBTeamInvite {
  id: number;
  team_id: number;
  invited_user_id: string;
  inviter_user_id: string;
  retracted: boolean;
  note?: string;
  expires_at?: Date;
  inserted_at: Date;
}

interface DBTeamInviteInsertRequest {
  team_id: number;
  invited_user_id: string;
  inviter_user_id: string;
  retracted?: boolean;
}

export async function insertTeamInvite(
  req: DBTeamInviteInsertRequest | DBTeamInviteInsertRequest[]
): Promise<number> {
  const rows = await db("team_invites").insert(req).returning("id");

  return rows[0];
}

interface DBTeamInviteUpdateRequest {
  retracted?: boolean;
  note?: string;
  expires_at?: Date;
  where: {
    id?: number;
    team_id?: number;
    invited_user_id?: string;
    inviter_user_id?: string;
    retracted?: boolean;
  };
}

export async function updateTeamInvite(
  req: DBTeamInviteUpdateRequest,
  database: Transaction = db
): Promise<void> {
  const { retracted, note, expires_at, where } = req;

  const update = {};

  if (retracted) {
    update["retracted"] = retracted;
  }

  if (note) {
    update["note"] = note;
  }

  if (expires_at) {
    update["expires_at"] = expires_at;
  }

  await database("team_invites").where(where).update(update);
}

interface DBTeamInviteDeleteRequest {
  id?: number;
  team_id?: number;
  invited_user_id?: string;
  inviter_user_id?: string;
  retracted?: boolean;
}

export async function deleteTeamInvite(
  req: DBTeamInviteDeleteRequest,
  database: Transaction = db
): Promise<void> {
  await database("team_invites").where(req).del();
}

interface DBTeamInviteListRequestMeta extends DBQueryMeta {
  valid_only: boolean;
}

interface DBTeamInviteListRequest {
  id?: number;
  team_id?: number;
  team_tag?: string;
  invited_user_id?: string | string[];
  inviter_user_id?: string;
  retracted?: boolean;

  meta?: DBTeamInviteListRequestMeta;
}

export async function listTeamInvites(
  req: DBTeamInviteListRequest
): Promise<DBTeamInvite[]> {
  const {
    id,
    team_id,
    team_tag,
    invited_user_id,
    inviter_user_id,
    retracted,
    meta,
  } = req;
  const query = db("team_invites").select("team_invites.*");

  if (id) {
    query.where({ id });
  }

  if (team_id) {
    query.where({ team_id });
  }

  if (team_tag) {
    query
      .join("teams", "team_invites.team_id", "teams.id")
      .where({ "teams.tag": team_tag });
  }

  if (invited_user_id) {
    query.whereIn(
      "invited_user_id",
      typeof invited_user_id === "string" ? [invited_user_id] : invited_user_id
    );
  }

  if (inviter_user_id) {
    query.where({ inviter_user_id });
  }

  if (typeof retracted === "boolean") {
    query.where({ retracted });
  }

  if (meta) {
    if (meta.valid_only) {
      query.where({
        retracted: false,
      });

      query.where("expires_at", "<", db.fn.now()).orWhere("expires_at", null);
    }

    handleMeta(query, meta);
  }

  return await query;
}

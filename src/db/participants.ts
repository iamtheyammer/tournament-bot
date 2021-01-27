import { Transaction } from "knex";
import db, { DBQueryMeta, handleMeta } from "./index";

export interface DBParticipant {
  id: number;
  tournament_id: number;
  discord_id: string;
  minecraft_uuid?: string;
}

interface DBParticipantInsertRequest {
  tournament_id: number;
  discord_id: string;
  minecraft_uuid?: string;
}

export async function insertParticipant(
  req: DBParticipantInsertRequest
): Promise<number> {
  const query = await db("participants").insert(req);

  return query[0];
}

export interface DBParticipantUpdateRequest {
  where: {
    discord_id: string;
  };
  minecraft_uuid?: string | null;
}

export async function updateParticipant(
  req: DBParticipantUpdateRequest
): Promise<void> {
  await db("participants")
    .where(req.where)
    .update({ minecraft_uuid: req.minecraft_uuid });
}

interface DBParticipantListRequestMeta extends DBQueryMeta {
  require_uuid?: boolean;
}

interface DBParticipantListRequest {
  id?: number;
  tournament_id?: number;
  discord_id?: string | string[];
  minecraft_uuid?: string | string[];
  meta?: DBParticipantListRequestMeta;
}

export async function listParticipants(
  req: DBParticipantListRequest
): Promise<DBParticipant[]> {
  const query = db("participants");

  if (req.id) {
    query.where({ id: req.id });
  }

  if (req.tournament_id) {
    query.where({ tournament_id: req.tournament_id });
  }

  if (req.discord_id) {
    if (typeof req.discord_id === "string") {
      query.where({ discord_id: req.discord_id });
    } else {
      query.whereIn("discord_id", req.discord_id);
    }
  }

  if (req.minecraft_uuid) {
    query.where({ minecraft_uuid: req.minecraft_uuid });
  }

  if (req.meta) {
    const { meta } = req;

    if (meta.require_uuid) {
      query.whereNotNull("minecraft_uuid");
    }

    handleMeta(query, meta);
  }

  return await query;
}

interface DBParticipantDeleteRequest {
  id?: number;
  discord_id?: string;
  minecraft_uuid?: string;
}

export async function deleteParticipant(
  req: DBParticipantDeleteRequest,
  database: Transaction = db
): Promise<void> {
  await database("participants").where(req).del();
}

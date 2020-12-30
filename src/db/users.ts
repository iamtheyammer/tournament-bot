import db, { DBQueryMeta, handleMeta } from "./index";

export interface DBUser {
  discord_id: string;
  minecraft_uuid?: string;
}

export async function insertUser(req: DBUser): Promise<number> {
  const query = await db("users").insert(req);

  return query[0];
}

export interface DBUserUpdateRequest {
  where: {
    discord_id: string;
  };
  minecraft_uuid?: string | null;
}

export async function updateUser(req: DBUserUpdateRequest): Promise<void> {
  await db("users")
    .where(req.where)
    .update({ minecraft_uuid: req.minecraft_uuid });
}

interface DBUserListRequestMeta extends DBQueryMeta {
  require_uuid?: boolean;
}

interface DBUserListRequest {
  discord_id?: string | string[];
  minecraft_uuid?: string | string[];
  meta?: DBUserListRequestMeta;
}

export async function listUsers(req: DBUserListRequest): Promise<DBUser[]> {
  const query = db("users");

  if (req.discord_id) {
    query.where({ discord_id: req.discord_id });
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

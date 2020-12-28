import db from "./index";

export interface DBUser {
  discord_id: number;
  minecraft_uuid?: string;
}

export async function createUser(req: DBUser): Promise<void> {
  await db("users").insert(req);
}

export interface DBUserUpdateRequest {
  where: {
    discord_id: string;
  };
  minecraft_uuid?: string | null;
}

export async function updateUser(req: DBUserUpdateRequest): Promise<void> {
  await db("users")
    .where({ discord_id: req.where.discord_id })
    .update({ minecraft_uuid: req.minecraft_uuid });
}

interface DBUserListRequest {
  discord_id?: string | string[];
  minecraft_uuid?: string | string[];
}

export async function listUsers(req: DBUserListRequest): Promise<DBUser[]> {
  const query = db("users");

  if (req.discord_id) {
    query.where({ discord_id: req.discord_id });
  }

  if (req.minecraft_uuid) {
    query.where({ minecraft_uuid: req.minecraft_uuid });
  }

  return await query;
}

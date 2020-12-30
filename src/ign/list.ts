import { Args } from "../index";
import { Message } from "discord.js";
import { listUsers } from "../db/users";
import { errorEmbed, infoEmbed } from "../util/embeds";
import { fetchMojangUserProfile } from "../apis";
import { normalizeUuid } from "../util/uuid";

export default async function list(msg: Message, args: Args): Promise<void> {
  const pageNum = args[2] ? parseInt(args[2]) : 0;

  if (isNaN(pageNum)) {
    msg.channel.send(
      errorEmbed()
        .setTitle("Invalid page number!")
        .setDescription("You specified an invalid page number.")
    );
    return;
  }

  const users = await listUsers({
    meta: {
      require_uuid: true,
      limit: 10,
      offset: pageNum * 10,
      order_by: { exp: "inserted_at", dir: "DESC" },
    },
  });

  // get usernames from UUIDs

  const mojangProfiles = await Promise.all(
    users.map((u) => fetchMojangUserProfile(u.minecraft_uuid))
  );

  const fields = mojangProfiles.map((mp, idx) => ({
    name: `${idx + 1}/${users.length}`,
    value: `<@${
      users.find((u) => u.minecraft_uuid === normalizeUuid(mp.id)).discord_id
    }>: \`${mp.name}\``,
    inline: true,
  }));

  msg.channel.send(
    infoEmbed()
      .setTitle("List of IGNs")
      .setDescription("List of users with their IGNs.")
      .addFields(fields)
  );

  return;
}

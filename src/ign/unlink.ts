import { Message } from "discord.js";
import { listUsers, updateUser } from "../db/users";
import { errorEmbed, successEmbed } from "../util/embeds";

export default async function unlink(msg: Message): Promise<void> {
  const users = await listUsers({ discord_id: msg.author.id });

  if (!users.length || !users[0].minecraft_uuid) {
    msg.channel.send(
      errorEmbed()
        .setTitle("Unable to unlink")
        .setDescription(
          "You can't unlink your IGN because you never linked your IGN. " +
            "Use `!ign link <minecraft username>` to get started."
        )
    );
    return;
  }

  await updateUser({
    where: { discord_id: msg.author.id },
    minecraft_uuid: null,
  });

  msg.channel.send(
    successEmbed()
      .setTitle("Successfully unlinked IGN")
      .setDescription("Use `!ign link <minecraft username>` to link again.")
  );
  return;
}

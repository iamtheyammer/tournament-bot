import { Message } from "discord.js";
import { Args, prefix } from "../index";
import { listUsers } from "../db/users";
import { fetchMojangUserProfile } from "../apis";
import { errorEmbed, successEmbed } from "../util/embeds";

export default async function get(msg: Message, args: Args): Promise<void> {
  if (
    (!msg.mentions.members || !msg.mentions.members.first()) &&
    !/^[0-9]+$/.test(args[2])
  ) {
    msg.channel.send(
      errorEmbed()
        .setTitle("Argument Missing")
        .setDescription(
          `You didn't put a user you wanted to get the IGN of.\nUsage: \`${prefix}ign get <mention | discord user ID>\``
        )
    );
    return;
  }

  const userId = msg.mentions.members.first()
    ? msg.mentions.members.first().id
    : args[2];

  // check for user
  const users = await listUsers({ discord_id: userId });
  if (!users.length || !users[0].minecraft_uuid) {
    msg.channel.send(
      errorEmbed()
        .setTitle("IGN Grab Failed")
        .setDescription(
          `Couldn't get <@${userId}>'s in game name because they have not linked their name to their discord yet.`
        )
    );
    return;
  }

  const mojangUserProfile = await fetchMojangUserProfile(
    users[0].minecraft_uuid
  );

  msg.channel.send(
    successEmbed()
      .setTitle("IGN Grab Success")
      .setDescription(
        `<@${userId}>'s in game name is \`${mojangUserProfile.name}\`.`
      )
      .setThumbnail(`https://crafatar.com/avatars/${mojangUserProfile.id}`)
  );
}

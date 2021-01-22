import { Message, MessageEmbed } from "discord.js";
import { fetchMojangUserProfile, fetchPlayerData } from "../apis";
import { prefix } from "../index";
import { isMinecraftUsername } from "../util/regex";
import { insertUser, listUsers, updateUser } from "../db/users";
import { errorEmbed, successEmbed, warnEmbed } from "../util/embeds";
import { compareUuids, normalizeUuid } from "../util/uuid";

export default async function link(
  msg: Message,
  args: Array<string>
): Promise<void> {
  const username = args[2];

  if (!username) {
    msg.channel.send(
      errorEmbed()
        .setTitle("Argument Missing")
        .setDescription(
          `You didn't put a username you wanted to link to.\nUsage: \`${prefix}ign link <username>\``
        )
    );
    return;
  }

  if (!isMinecraftUsername(username)) {
    msg.channel.send(wrongUserEmbed(username, msg.author.id));
    return;
  }

  const player = await fetchPlayerData(username);
  if (!player) {
    msg.channel.send(wrongUserEmbed(username, msg.author.id));
    return;
  }

  if (!player.socialMedia || !player.socialMedia.links.DISCORD) {
    msg.channel.send(
      errorEmbed()
        .setTitle("Link Failed")
        .setDescription(
          `Failed to link user <@${msg.author.id}> to \`${player.displayname}\` because \`${player.displayname}\` does not have a discord account linked.`
        )
    );
    return;
  }

  const discordName: string = player.socialMedia.links.DISCORD;
  const { displayname: ign, uuid } = player;
  const hypixelUuid = normalizeUuid(uuid);

  if (discordName !== msg.author.tag) {
    msg.channel.send(
      errorEmbed()
        .setTitle("Link Failed")
        .setDescription(
          `Failed to link user <@${msg.author.id}> to \`${ign}\` because \`${ign}\` has a different discord account linked to Hypixel.`
        )
    );
    return;
  }

  // create user if not exists
  const users = await listUsers({ discord_id: msg.author.id });

  if (!users.length) {
    // insert user
    await insertUser({ discord_id: msg.author.id, minecraft_uuid: uuid });
    msg.channel.send(linkSuccessEmbed(ign, msg.author.id));
    return;
  }

  // check for linked user

  const user = users[0];

  if (user.minecraft_uuid) {
    if (compareUuids(user.minecraft_uuid, uuid)) {
      msg.channel.send(
        warnEmbed()
          .setTitle("Already linked")
          .setDescription(
            `<@${msg.author.id}> is already linked to \`${ign}\`. Use \`${prefix}ign unlink\`, then run this command again.`
          )
      );
      return;
    }

    const oldMojangUserProfile = await fetchMojangUserProfile(
      user.minecraft_uuid
    );

    // update linked user
    await updateUser({
      where: { discord_id: msg.author.id },
      minecraft_uuid: uuid,
    });
    msg.channel.send(
      successEmbed()
        .setTitle("Successfully linked!")
        .setDescription(
          `Updated the user linked to <@${msg.author.id}> from \`${oldMojangUserProfile.name}\` to \`${ign}\`.`
        )
    );
  }

  // linking user

  if (user) {
    await updateUser({
      where: { discord_id: msg.author.id },
      minecraft_uuid: hypixelUuid,
    });
  } else {
    await insertUser({
      discord_id: msg.author.id,
      minecraft_uuid: hypixelUuid,
    });
  }

  msg.channel.send(linkSuccessEmbed(ign, msg.author.id));
}

function wrongUserEmbed(ign: string, id: string): MessageEmbed {
  return errorEmbed()
    .setColor("#ff0000")
    .setTitle("Link Failed")
    .setDescription(
      `Failed to link user <@${id}> to \`${ign}\` because \`${ign}\` does not exist or an error occurred with the bot.`
    );
}

export function linkSuccessEmbed(ign: string, id: string): MessageEmbed {
  return successEmbed()
    .setColor("#00ff00")
    .setTitle("Link Success")
    .setDescription(`Successfully linked user <@${id}> to \`${ign}\`.`);
}

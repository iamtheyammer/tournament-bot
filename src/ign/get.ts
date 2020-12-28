import { Message, MessageEmbed } from "discord.js";
import { Args, playerIGNs, prefix } from "../index";
import { listUsers } from "../db/users";
import { fetchMojangUserProfile } from "../apis";

export default async function get(msg: Message, args: Args): Promise<void> {
  if (
    (!msg.mentions.members || !msg.mentions.members.first()) &&
    !/^[0-9]+$/.test(args[2])
  ) {
    msg.channel.send(argumentMissingEmbed(prefix));
    return;
  }

  const userId = msg.mentions.members.first()
    ? msg.mentions.members.first().id
    : args[2];

  // check for user
  const users = await listUsers({ discord_id: userId });
  if (!users.length || !users[0].minecraft_uuid) {
    msg.channel.send(
      ignGetFailedEmbed(
        "they have not linked their name to their discord yet",
        userId
      )
    );
    return;
  }

  const mojangUserProfile = await fetchMojangUserProfile(
    users[0].minecraft_uuid
  );

  msg.channel.send(
    ignGetSuccessEmbed(mojangUserProfile.name, mojangUserProfile.id, userId)
  );
}

function argumentMissingEmbed(prefix: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Argument Missing")
    .setDescription(
      `You didn't put a user you wanted to get the IGN of.\nUsage: \`${prefix}ign get <mention | discord user ID>\``
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function ignGetSuccessEmbed(
  ign: string,
  uuid: string,
  discordUserId: string
): MessageEmbed {
  return new MessageEmbed()
    .setColor("#00ff00")
    .setTitle("IGN Grab Success")
    .setDescription(`<@${discordUserId}>'s in game name is \`${ign}\`.`)
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot")
    .setThumbnail(`https://crafatar.com/avatars/${uuid}`);
}

function ignGetFailedEmbed(error: string, discordUserId: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("IGN Grab Failed")
    .setDescription(
      `Couldn't get <@${discordUserId}>'s in game name because ${error}.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

import { Message, MessageEmbed } from "discord.js";
import { fetchPlayerData } from "../apis";
import { prefix, playerIGNs, Args } from "../index";

export default async function link(msg: Message, args: Args): Promise<void> {
  if (!args[2]) {
    msg.channel.send(argumentMissingEmbed(prefix));
    return;
  }

  if (!/^[A-z0-9_]{2,16}$/.test(args[2])) {
    msg.channel.send(wrongUserEmbed(args[2], msg.author.id));
    return;
  }

  const player = await fetchPlayerData(args[2]);
  if (!player) {
    msg.channel.send(wrongUserEmbed(args[2], msg.author.id));
    return;
  }

  if (!player.socialMedia || !player.socialMedia.links.DISCORD) {
    msg.channel.send(noDiscordLinkedEmbed(args[2], msg.author.id));
    return;
  }

  const discordName: string = player.socialMedia.links.DISCORD;
  const { displayname: ign, uuid } = player;

  // TODO: Add data store
  if (discordName === msg.author.tag) {
    msg.channel.send(linkSuccessEmbed(ign, msg.author.id));

    const index = playerIGNs.findIndex((data) => data.tag === msg.author.tag);
    if (index !== -1) {
      playerIGNs.splice(index, 1);
    }
    playerIGNs.push({
      tag: msg.author.tag.toLowerCase(),
      id: msg.author.id,
      ign: ign,
    });
  } else {
    msg.channel.send(differentDiscordLinkedEmbed(ign, msg.author.id));
  }
}

function argumentMissingEmbed(prefix: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Argument Missing")
    .setDescription(
      `You didn't put a username you wanted to link to.\nUsage: \`${prefix}ign link <username>\``
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}
function wrongUserEmbed(ign: string, id: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Link Failed")
    .setDescription(
      `Failed to link user <@${id}> to \`${ign}\` because \`${ign}\` does not exist or an error occurred with the bot.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function noDiscordLinkedEmbed(ign: string, id: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Link Failed")
    .setDescription(
      `Failed to link user <@${id}> to \`${ign}\` because \`${ign}\` does not have a discord account linked.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function differentDiscordLinkedEmbed(
  ign: string,
  id: string
): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Link Failed")
    .setDescription(
      `Failed to link user <@${id}> to \`${ign}\` because \`${ign}\` has a different discord account linked to Hypixel.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}
export function linkSuccessEmbed(ign: string, id: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#00ff00")
    .setTitle("Link Success")
    .setDescription(`Successfully linked user <@${id}> to \`${ign}\`.`)
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

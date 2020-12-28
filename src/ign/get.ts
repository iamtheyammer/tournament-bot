import { Message, MessageEmbed } from "discord.js";
import { playerIGNs, prefix } from "../index";

export default async function get(msg: Message): Promise<void> {
  if (!msg.mentions.members || !msg.mentions.members.first()) {
    msg.channel.send(argumentMissingEmbed(prefix));
    return;
  }

  const id = msg.mentions.members.first().id;

  // TODO: Add data store
  const index = playerIGNs.findIndex((data) => data.id === id);
  if (index !== -1) {
    msg.channel.send(ignGetSuccessEmbed(playerIGNs[index].ign, id));
  } else {
    msg.channel.send(ignGetFailedEmbed(false, id));
  }
}

function argumentMissingEmbed(prefix: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Argument Missing")
    .setDescription(
      `You didn't put a user you wanted to get the IGN of.\nUsage: \`${prefix}ign get <mention | tag>\``
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function ignGetSuccessEmbed(ign: string, id: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#00ff00")
    .setTitle("IGN Grab Success")
    .setDescription(`<@${id}>'s in game name is \`${ign}\`.`)
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function ignGetFailedEmbed(
  notAUser: boolean,
  id?: string,
  tag?: string
): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("IGN Grab Failed")
    .setDescription(
      `${
        notAUser
          ? `Couldn't grab \`${tag}\`'s in game name because that user doesn't exist or their data is missing.`
          : `Couldn't grab <@${id}>'s in game name because they haven't linked their discord yet.`
      }`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

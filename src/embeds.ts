import * as Discord from "discord.js";
import { playerIGN } from "./index";
export function ignList(playerIGNs: Array<playerIGN>): Discord.MessageEmbed {
  const fields = [];
  for (let i = 0; i < playerIGNs.length; i++) {
    fields.push({
      name: `${playerIGNs[i].tag}`,
      value: `${playerIGNs[i].ign}`,
      inline: true,
    });
  }
  return new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("List of IGNs")
    .setDescription("List of users with their IGNs.")
    .addFields(fields)
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function linkSuccess(ign: string, id: string): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#00ff00")
    .setTitle("Link Success")
    .setDescription(`Successfully linked user <@${id}> to \`${ign}\`.`)
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function linkFailed(ign: string, id: string): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Link Failed")
    .setDescription(
      `Failed to link user <@${id}> to \`${ign}\` because \`${ign}\` does not have them in their social links.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function getIGNSuccess(ign: string, id: string): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#00ff00")
    .setTitle("IGN Grab Success")
    .setDescription(`<@${id}>'s in game name is \`${ign}\`.`)
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function getIGNFailed(
  notAUser: boolean,
  id?: string,
  tag?: string
): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
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

export function delinkSuccess(id: string, ign: string): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#ff0000")
    .setTitle("IGN Delinking Success")
    .setDescription(`Successfully delinked <@${id}> from \`${ign}\`.`)
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function delinkFailed(id: string): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#ff0000")
    .setTitle("IGN Delinking Failed")
    .setDescription(
      `Could not delink <@${id}> from an IGN because there was no link to begin with.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

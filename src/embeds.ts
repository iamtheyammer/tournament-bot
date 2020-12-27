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

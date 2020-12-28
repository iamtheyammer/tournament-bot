import { playerIGNs } from "../index";
import { Message, MessageEmbed } from "discord.js";

export default async function unlink(msg: Message): Promise<void> {
  const index = playerIGNs.findIndex((data) => data.id === msg.author.id);
  if (index === -1) {
    msg.channel.send(unlinkFailedEmbed(msg.author.id));
  } else {
    msg.channel.send(unlinkSuccessEmbed(msg.author.id, playerIGNs[index].ign));
    playerIGNs.splice(index, 1);
  }
}

function unlinkSuccessEmbed(id: string, ign: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("IGN Unlinking Success")
    .setDescription(`Successfully unlinked <@${id}> from \`${ign}\`.`)
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function unlinkFailedEmbed(id: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("IGN Unlinking Failed")
    .setDescription(
      `Could not unlink <@${id}> from an IGN because there was no link to begin with.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

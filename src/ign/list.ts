import { playerIGNs, playerIGN } from "../index";
import { Message, MessageEmbed } from "discord.js";

export default async function list(msg: Message): Promise<void> {
  msg.channel.send(ignListEmbed(playerIGNs));
}

function ignListEmbed(playerIGNs: Array<playerIGN>): MessageEmbed {
  const fields = playerIGNs.map((ign) => ({
    name: ign.tag,
    value: ign.ign,
    inline: true,
  }));

  return new MessageEmbed()
    .setColor("#0099ff")
    .setTitle("List of IGNs")
    .setDescription("List of users with their IGNs.")
    .addFields(fields)
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

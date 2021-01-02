// import { Message, MessageEmbed } from "discord.js";
// import { teamCreating } from "../index";

// export default async function deny(msg: Message, index: number): Promise<void> {
//   msg.channel.send(
//     teamCreationDeniedEmbed(teamCreating[index].tag, teamCreating[index].name)
//   );
//   teamCreating.splice(
//     teamCreating.findIndex((arg) => arg.leader === msg.author.id),
//     1
//   );
// }

// export function teamCreationDeniedEmbed(
//   tag: string,
//   name: string
// ): MessageEmbed {
//   return new MessageEmbed()
//     .setColor("#ff0000")
//     .setTitle("Team Creation Halted")
//     .setDescription(`The creation of \`[${tag}] ${name}\` has been stopped.`)
//     .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
// }

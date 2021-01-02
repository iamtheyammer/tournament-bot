import { Message, MessageEmbed } from "discord.js";
import { Args, prefix } from "..";
import { listTeamMemberships } from "../db/team_memberships";

export default async function info(msg: Message, args: Args): Promise<void> {
  let memberships;
  if (args.splitCommand[2]) {
    memberships = await listTeamMemberships({ team_tag: args.splitCommand[2] });
    console.log(JSON.stringify(memberships, null, 2));
  } else {
    memberships = await listTeamMemberships({ user_id: msg.author.id });
  }
  if (!args.splitCommand[2] && !memberships.length) {
    msg.channel.send(noTeamEmbed(prefix));
    return;
  } else if (memberships.length && !args[2]) {
    console.log(memberships);
    // msg.channel.send(await teamInfoEmbed(teamData));
    return;
  } else {
    console.log(memberships);
  }
}

function noTeamEmbed(prefix: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle(`No Team Specified`)
    .setDescription(
      `This command didn't work because you didn't specify a team. Either use \`${prefix}team info <team tag>\` or join a team to get its info using \`${prefix}team info\`.`
    )

    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

// async function teamInfoEmbed(teamData: DBTeam): Promise<MessageEmbed> {
//   let member2IGN, member3IGN, member4IGN;

//   return new MessageEmbed()
//     .setColor("#0099ff")
//     .setTitle(`\`[${teamData.tag}] ${teamData.name}\``)
//     .setDescription(`**Description:**\n${teamData.description}`)
//     .addFields(
//       {
//         name: "Leader:",
//         value: `<@${teamData.leader}> | IGN: ${leaderIGN}`,
//       },
//       {
//         name: "Members:",
//         value: `${
//           teamData.members[1]
//             ? `<@${teamData.members[1]}> | IGN: ${member2IGN}\n${
//                 teamData.members[2]
//                   ? `<@${teamData.members[2]}> | IGN: ${member3IGN}\n${
//                       teamData.members[3]
//                         ? `<@${teamData.members[3]}> | IGN: ${member4IGN}\n`
//                         : `\`Open Slot\``
//                     }`
//                   : `\`Open Slot\`\n\`Open Slot\``
//               }`
//             : `\`Open Slot\`\n\`Open Slot\`\n\`Open Slot\``
//         }`,
//       }
//     )
//     .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
// }

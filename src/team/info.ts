import { Message, MessageEmbed } from "discord.js";
import { teams, fullTeam, playerIGNs, prefix } from "../index";

export default async function info(
  msg: Message,
  args: Array<string>
): Promise<void> {
  let teamData: fullTeam;
  const index = teams.findIndex((team) => team.members.includes(msg.author.id));
  if (!args[2] && index === -1) {
    msg.channel.send(noTeamEmbed(prefix));
    return;
  } else if (index !== 1 && !args[2]) {
    teamData = teams[index];
    msg.channel.send(teamInfoEmbed(teamData));
    return;
  } else {
    teamData =
      teams[teams.findIndex((team) => team.tag === args[2].toUpperCase())];
    msg.channel.send(teamInfoEmbed(teamData));
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

function teamInfoEmbed(teamData: fullTeam): MessageEmbed {
  let member2IGN, member3IGN, member4IGN;
  const leaderIGN =
    playerIGNs[playerIGNs.findIndex((user) => user.id === teamData.leader)].ign;
  if (teamData.members[1]) {
    member2IGN =
      playerIGNs[
        playerIGNs.findIndex((user) => user.id === teamData.members[1])
      ].ign;
    if (teamData.members[2]) {
      member3IGN =
        playerIGNs[
          playerIGNs.findIndex((user) => user.id === teamData.members[2])
        ].ign;
      if (teamData.members[3]) {
        member4IGN =
          playerIGNs[
            playerIGNs.findIndex((user) => user.id === teamData.members[3])
          ].ign;
      }
    }
  }
  return new MessageEmbed()
    .setColor("#0099ff")
    .setTitle(`\`[${teamData.tag}] ${teamData.name}\``)
    .setDescription(`**Description:**\n${teamData.description}`)
    .addFields(
      {
        name: "Leader:",
        value: `<@${teamData.leader}> | IGN: ${leaderIGN}`,
      },
      {
        name: "Members:",
        value: `${
          teamData.members[1]
            ? `<@${teamData.members[1]}> | IGN: ${member2IGN}\n${
                teamData.members[2]
                  ? `<@${teamData.members[2]}> | IGN: ${member3IGN}\n${
                      teamData.members[3]
                        ? `<@${teamData.members[3]}> | IGN: ${member4IGN}\n`
                        : `\`Open Slot\``
                    }`
                  : `\`Open Slot\`\n\`Open Slot\``
              }`
            : `\`Open Slot\`\n\`Open Slot\`\n\`Open Slot\``
        }`,
      }
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

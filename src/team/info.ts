import { Message } from "discord.js";
import { DBTeamMembership, listTeamMemberships } from "../db/team_memberships";
import { DBTeam, listTeams } from "../db/teams";
import { errorEmbed, infoEmbed } from "../util/embeds";
import { TeamArgs } from "./index";

export default async function info(
  msg: Message,
  args: TeamArgs
): Promise<void> {
  let team: DBTeam;
  let memberships: DBTeamMembership[];

  // if a team tag is specified, use that
  if (args.splitCommand[2]) {
    const teams = await listTeams({ tag: args.splitCommand[2] });
    if (!teams.length) {
      await msg.channel.send(
        errorEmbed()
          .setTitle("Invalid team tag")
          .setDescription(
            `A team with tag \`${args.splitCommand[2]}\` doesn't exist.`
          )
      );
      return;
    }
    memberships = await listTeamMemberships({ team_id: teams[0].id });
  } else {
    // otherwise, use the calling member's team
    const userMembership = await listTeamMemberships({
      user_id: msg.author.id,
    });

    if (!userMembership.length) {
      await msg.channel.send(
        errorEmbed()
          .setTitle("No team found")
          .setDescription(
            "In order to use this command without a team tag, you need to be in a team.\nTry `!team info TAG`."
          )
      );
      return;
    }

    const [teams, teamMemberships] = await Promise.all([
      listTeams({ id: userMembership[0].team_id }),
      listTeamMemberships({ team_id: userMembership[0].team_id }),
    ]);

    team = teams[0];
    memberships = teamMemberships;
  }

  const leader = memberships.find((m) => m.type === "leader");
  const otherMembers = memberships.filter((m) => m.type !== "leader");

  const memberList: string[] = [];

  // need to exclude the leader, we already have them
  for (let i = 0; i < args.currentTournament.max_team_size - 1; i++) {
    if (otherMembers[i]) {
      memberList.push(`<@${otherMembers[i].user_id}>`);
    } else {
      memberList.push(`Open Slot (use \`!team invite @User\`!)`);
    }
  }

  await msg.channel.send(
    infoEmbed()
      .setTitle(`\`[${team.tag}] ${team.name}\``)
      .setDescription(`**Team Description**: ${team.description}`)
      .addFields(
        {
          name: "Leader:",
          value: `<@${leader.user_id}>`,
        },
        {
          name: "Members:",
          value: memberList.map((m, idx) =>
            idx + 1 === memberList.length ? `- ${m}` : `- ${m}`
          ),
        }
      )
  );
}

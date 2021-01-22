import { Message } from "discord.js";
import { TeamArgs } from ".";
import { listTeams } from "../db/teams";
import { listTeamMemberships } from "../db/team_memberships";
import { infoEmbed, errorEmbed } from "../util/embeds";

export default async function list(
  msg: Message,
  args: TeamArgs
): Promise<void> {
  const page = parseInt(args.splitCommandLower[2]) || 1;
  if (isNaN(page)) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Invalid page number")
        .setDescription("The page number you entered isn't a number.")
    );
    return;
  }

  const teams = await listTeams({
    tournament_id: args.currentTournament.id,
    meta: { limit: 10, offset: page, order_by: { exp: "id", dir: "DESC" } },
  });

  const leaderMemberships = await listTeamMemberships({
    team_id: teams.map((t) => t.id),
    type: "leader",
  });

  const leaderById = leaderMemberships.reduce((acc, cur) => {
    acc[cur.team_id] = cur;
    return acc;
  }, {});

  const fields = teams.map((team) => ({
    name: `\`[${team.tag}] ${team.name}\``,
    value: `Leader: <@${leaderById[team.id].user_id}>`,
    inline: true,
  }));

  await msg.channel.send(
    infoEmbed()
      .setTitle("List of Teams")
      .setDescription(
        "This list shows all of the teams created for this tournament."
      )
      .addFields(fields)
  );
}

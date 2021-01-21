import { Message } from "discord.js";
import { listTeams } from "../db/teams";
import { listTeamMemberships } from "../db/team_memberships";
import { listTournaments } from "../db/tournaments";
import { infoEmbed } from "../util/embeds";

export default async function list(msg: Message): Promise<void> {
  const tournament = await listTournaments({ meta: { active_only: true } });
  const teams = await listTeams({
    tournament_id: tournament[0].id,
    meta: { limit: 10 },
  });
  const fields = [];
  teams.forEach(async (team) => {
    const leader = await listTeamMemberships({
      team_id: team.id,
      type: "leader",
    });
    const data = {
      name: `\`[${team.tag}] ${team.name}\``,
      value: `Leader: <@${leader[0].user_id}>`,
      inline: true,
    };
    fields.push(data);
  });
  await msg.channel.send(
    infoEmbed()
      .setTitle("List of Teams")
      .setDescription(
        "This list shows all of the teams created for this tournament."
      )
      .addFields(fields)
  );
}

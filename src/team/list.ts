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
  for (let i = 0; i < teams.length; i++) {
    const leader = await listTeamMemberships({
      team_id: teams[i].id,
      type: "leader",
    });
    const data = {
      name: `\`[${teams[i].tag}] ${teams[i].name}\``,
      value: `Leader: <@${leader[0].user_id}>`,
      inline: true,
    };
    fields.push(data);
  }
  await msg.channel.send(
    infoEmbed()
      .setTitle("List of Teams")
      .setDescription(
        "This list shows all of the teams created for this tournament."
      )
      .addFields(fields)
  );
}

import { Message } from "discord.js";
import { getTeamTextChannel, TeamArgs } from "./index";
import { errorEmbed, infoEmbed, successEmbed } from "../util/embeds";
import { listTeamInvites } from "../db/team_invites";
import { listTeams } from "../db/teams";
import { deleteTeamMemberships } from "../db/team_memberships";

export default async function leave(
  msg: Message,
  args: TeamArgs
): Promise<void> {
  if (args.teamMembership.type === "leader") {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Can't abandon team")
        .setDescription(
          "You're the leader of your team, so you can't just leave. See options below."
        )
        .addFields(
          {
            name: "Transferring leadership",
            value:
              "You can transfer leadership to someone else with `!team transfer @NewLeader`. " +
              "Once you do that, you can use `!team leave`.",
          },
          {
            name: "Deleting the team",
            value:
              "Alternatively, you can use `!team delete` to delete the team. Note that doing so is **permanent**.",
          }
        )
    );
    return;
  }

  const [team] = await listTeams({ id: args.teamMembership.team_id });

  // remove roles
  await msg.member.roles.remove([
    team.role_id,
    args.currentTournament.participant_role_id,
  ]);

  // remove team membership
  await deleteTeamMemberships({ id: args.teamMembership.id });

  // alert team
  const textChannel = await getTeamTextChannel(msg, team.category_id);
  await textChannel.send(
    `<@&${team.role_id}>`,
    infoEmbed()
      .setTitle(`${msg.author.tag} has left`)
      .setDescription(
        "They no longer have access to this text channel or the associated voice channel. " +
          "If you want them to rejoin, you must reinvite them."
      )
  );

  await msg.channel.send(
    successEmbed()
      .setTitle("Left team")
      .setDescription(
        `You can now join another team. \`[${team.tag}] ${team.name}\` will miss you!`
      )
  );
}

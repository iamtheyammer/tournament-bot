import { Message } from "discord.js";
import { Args, prefix } from "..";
import { listTeams } from "../db/teams";
import { listTeamInvites } from "../db/team_invites";
import { listTournaments } from "../db/tournaments";
import { noIGNLinked } from "../team";
import { errorEmbed, successEmbed } from "../util/embeds";

export default async function invitesHandler(
  msg: Message,
  args: Args
): Promise<void> {
  if (!args.user || !args.user.minecraft_uuid) {
    msg.channel.send(noIGNLinked(prefix));
    return;
  }

  const tournaments = await listTournaments({ meta: { active_only: true } });

  if (!tournaments.length) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("No current tournament")
        .setDescription(
          "There isn't a tournament right now. Check our announcements channels for more info!"
        )
    );
    return;
  }

  switch (args.splitCommandLower[1]) {
    default: {
      // List Invites
      const invites = await listTeamInvites({
        invited_user_id: msg.author.id,
        meta: { valid_only: true },
      });
      if (!invites.length) {
        msg.channel.send(
          errorEmbed()
            .setTitle("No Team Invites")
            .setDescription("You do not have any team invites.")
        );
        return;
      }

      const teams = await listTeams({ id: invites.map((i) => i.team_id) });
      const teamsById = teams.reduce((acc, cur) => {
        acc[cur.id] = cur;
        return acc;
      }, {});

      const fields = invites.map((invite) => {
        const team = teamsById[invite.team_id];
        return {
          name: `Invitation to join: \`[${team.tag}] ${team.name}\``,
          value: `Invited by: <@${
            invite.inviter_user_id
          }> | To join: \`${prefix}team join ${team.tag.toLowerCase()}\``,
        };
      });

      msg.channel.send(
        successEmbed()
          .setTitle("Team Invites")
          .setDescription("Run `!team join <TAG>` to join one of these teams!")
          .addFields(fields)
      );
    }
  }
}

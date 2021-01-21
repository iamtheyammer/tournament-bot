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
      const teams = [];
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
      for (let i = 0; i < invites.length; i++) {
        const team = await listTeams({ id: invites[i].team_id });
        teams.push(team);
      }
      const fields = [];
      for (let i = 0; i < invites.length; i++) {
        fields.push({
          name: `Invitation to join: \`[${teams[0][i].tag}] ${teams[0][i].name}\``,
          value: `Invited by: <@${
            invites[i].inviter_user_id
          }> | To join: \`${prefix}team join ${teams[0][
            i
          ].tag.toLowerCase()}\``,
        });
      }
      msg.channel.send(
        successEmbed()
          .setTitle("Team Invites")
          .setDescription("Run `!team join <TAG>` to join one of these teams!")
          .addFields(fields)
      );
    }
  }
}

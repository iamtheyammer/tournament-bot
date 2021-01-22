import { CategoryChannel, Message } from "discord.js";
import { TeamArgs } from "./index";
import { deleteTeams, listTeams } from "../db/teams";
import {
  deleteTeamMemberships,
  listTeamMemberships,
} from "../db/team_memberships";
import { errorEmbed, successEmbed, warnEmbed } from "../util/embeds";
import discordConfirm from "../util/discord_confirm";
import db from "../db";
import { deleteTeamInvite } from "../db/team_invites";

export default async function deleteTeam(
  msg: Message,
  args: TeamArgs
): Promise<void> {
  const [[team], memberships] = await Promise.all([
    listTeams({ id: args.teamMembership.team_id }),
    listTeamMemberships({ team_id: args.teamMembership.team_id }),
  ]);

  if (memberships.length > 1) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Team not empty")
        .setDescription(
          "You must remove all members from your team in order to delete it. " +
            "Use `!team info` and `!team kick` to empty the team, then try deleting it again."
        )
    );
    return;
  }

  const confirmMessage = await msg.channel.send(
    warnEmbed()
      .setTitle(`Confirm deleting \`[${team.tag}] ${team.name}\``)
      .setDescription(
        "You're about to delete your team. " +
          "It is **permanent** and **can not be recovered.** " +
          "Everything related to your team will be deleted, including your text and voice channel. " +
          "If you're completely sure you want to delete it, react with the check emoji."
      )
  );

  const confirmation = await discordConfirm(
    msg.author.id,
    confirmMessage,
    errorEmbed()
      .setTitle("Delete team timeout")
      .setDescription("Nothing was changed."),
    errorEmbed()
      .setTitle("Delete team cancelled")
      .setDescription("Nothing was changed.")
  );

  if (!confirmation) {
    return;
  }

  try {
    await msg.member.roles.remove([
      team.role_id,
      args.currentTournament.participant_role_id,
    ]);
  } catch {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Error removing roles")
        .setDescription(
          "There was a server error removing roles. Nothing was changed."
        )
    );
    return;
  }

  const rollbackStack = [
    () =>
      msg.member.roles.add([
        team.role_id,
        args.currentTournament.participant_role_id,
      ]),
  ];
  const rollback = async () => await Promise.all(rollbackStack.map((r) => r()));

  try {
    const teamCategory = msg.guild.channels.resolve(
      team.category_id
    ) as CategoryChannel;
    await Promise.all(
      teamCategory.children.map(
        async (c) => await c.delete(`Team ID ${team.id} deletion`)
      )
    );
    await teamCategory.delete(`Team ID ${team.id} deletion`);
  } catch {
    await rollback();
    await msg.channel.send(
      errorEmbed()
        .setTitle("Error removing channels")
        .setDescription(
          "There was a server error removing channels. Nothing was changed."
        )
    );
    return;
  }

  const trx = await db.transaction();
  rollbackStack.push(() => trx.rollback());

  try {
    await Promise.all([
      deleteTeamInvite({ team_id: team.id }, trx),
      deleteTeamMemberships({ team_id: team.id }, trx),
    ]);
  } catch {
    await rollback();
    await msg.channel.send(
      errorEmbed()
        .setTitle("Error removing invites and memberships")
        .setDescription(
          "Your team is likely in a bad state. Please please contact an admin."
        )
    );
    return;
  }

  try {
    await deleteTeams({ id: team.id }, trx);
  } catch {
    await rollback();
    await msg.channel.send(
      errorEmbed()
        .setTitle("Error removing the team")
        .setDescription(
          "A server error occurred and it's likely your team hasn't been properly removed. " +
            "Please please contact an admin."
        )
    );
    return;
  }

  try {
    await trx.commit();
  } catch {
    await rollback();
    await msg.channel.send(
      errorEmbed()
        .setTitle("Error saving deletions")
        .setDescription(
          "A server error occurred and your team probably has not been properly removed. " +
            "Please please contract an admin."
        )
    );
    return;
  }

  await msg.guild.roles.resolve(team.role_id).delete();

  await msg.channel.send(
    successEmbed()
      .setTitle(`\`[${team.tag}] ${team.name}\` has been deleted`)
      .setDescription(
        "Your team is all gone. Feel free to join a new one. It'll be missed."
      )
  );
}

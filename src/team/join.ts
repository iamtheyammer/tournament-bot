import { Message } from "discord.js";
import { listTeams } from "../db/teams";
import { listTeamInvites, updateTeamInvite } from "../db/team_invites";
import {
  insertTeamMemberships,
  listTeamMemberships,
} from "../db/team_memberships";
import { getTeamTextChannel, TeamArgs } from "./index";
import { errorEmbed, infoEmbed, successEmbed } from "../util/embeds";
import db from "../db";

export default async function join(
  msg: Message,
  args: TeamArgs
): Promise<void> {
  if (args.teamMembership) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Already in team")
        .setDescription(
          "You need to leave your current team before joining a new one. " +
            "Use `!team leave` first, then re-run this command."
        )
    );
    return;
  }

  if (!args.splitCommandLower[2]) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Missing team tag")
        .setDescription(
          "Please specify which team you wish to join, like `!team join <tag>`"
        )
    );
    return;
  }

  const joiningTeamTag = args.splitCommand[2].toUpperCase();

  const invites = await listTeamInvites({
    invited_user_id: msg.author.id,
    team_tag: joiningTeamTag,
    retracted: false,
  });
  if (!invites.length) {
    await msg.channel.send(
      errorEmbed().setTitle("No invite found").setDescription(
        `Either a team with tag \`${joiningTeamTag}\` doesn't exist or they didn't invite you. 
          Try \`!team invite ${joiningTeamTag}\`.`
      )
    );
    return;
  }

  const invite = invites[0];

  const [[team], teamMembers] = await Promise.all([
    listTeams({ id: invite.team_id }),
    listTeamMemberships({
      team_id: invite.team_id,
      meta: { order_by: { exp: "team_memberships.inserted_at", dir: "DESC" } },
    }),
  ]);

  if (teamMembers.length >= args.currentTournament.max_team_size) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Team full")
        .setDescription(
          `Team \`${team.name}\` already has ${teamMembers.length}, which is the maximum team size for this tournament.`
        )
    );
    return;
  }

  const trx = await db.transaction();

  try {
    await updateTeamInvite(
      {
        retracted: true,
        where: { invited_user_id: msg.author.id, team_id: invite.team_id },
      },
      trx
    );
  } catch (e) {
    await trx.rollback();
    await msg.channel.send(
      errorEmbed()
        .setTitle("Error updating invite")
        .setDescription(
          "There was a server error removing your invite. Try again later or contact admins."
        )
    );
    throw e;
  }

  try {
    await insertTeamMemberships(
      {
        user_id: msg.author.id,
        team_id: invite.team_id,
        tournament_id: team.tournament_id,
        invite_id: invite.id,
      },
      trx
    );
  } catch (e) {
    await trx.rollback();
    await msg.channel.send(
      errorEmbed()
        .setTitle("Error adding you to the team")
        .setDescription(
          "There was a server error adding you to the team. Try again later or contact admins."
        )
    );
    throw e;
  }

  const [teamRole, participantRole] = await Promise.all([
    msg.guild.roles.fetch(team.role_id),
    msg.guild.roles.fetch(args.currentTournament.participant_role_id),
  ]);

  try {
    await msg.member.roles.add([teamRole, participantRole]);
  } catch (e) {
    await Promise.all([
      trx.rollback(e),
      msg.member.roles.remove([teamRole, participantRole]),
    ]);
    await msg.channel.send(
      errorEmbed()
        .setTitle("Error assigning roles")
        .setDescription(
          "There was a server error assigning roles to you. Try again later or contact admins."
        )
    );
    throw e;
  }

  try {
    await trx.commit();
  } catch (e) {
    await Promise.all([
      trx.rollback(e),
      msg.member.roles.remove([teamRole, participantRole]),
    ]);
    await msg.channel.send(
      errorEmbed()
        .setTitle("Error saving membership")
        .setDescription(
          "There was a server error saving your team membership. Try again later or contact admins."
        )
    );
    throw e;
  }

  await msg.channel.send(
    successEmbed()
      .setTitle(`Welcome to \`[${team.tag}] ${team.name}\`!`)
      .setDescription(
        "Chat with other members in your private voice and text channels!"
      )
      .addField(
        "You'll be playing with:",
        teamMembers.map((m) => `- <@${m.user_id}> (${m.type})`)
      )
  );

  const textChannel = await getTeamTextChannel(msg, team.category_id);

  const joinMessage = await textChannel.send(
    `<@&${team.role_id}>`,
    infoEmbed()
      .setTitle(`${msg.author.tag} joined the team!`)
      .setDescription("Please give them a warm welcome!")
  );
  await Promise.all([joinMessage.react("👋"), joinMessage.react("🎉")]);
}

import { Message } from "discord.js";
import { getTeamTextChannel, TeamArgs } from "./index";
import { listTeams } from "../db/teams";
import {
  deleteTeamMemberships,
  listTeamMemberships,
} from "../db/team_memberships";
import { errorEmbed, infoEmbed, successEmbed } from "../util/embeds";
import discordConfirm from "../util/discord_confirm";

export default async function kick(
  msg: Message,
  args: TeamArgs
): Promise<void> {
  if (msg.mentions.members.size < 1) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Missing user mention")
        .setDescription(
          "You need to @ mention the user you want to kick, like `!team kick @BadMember`."
        )
    );
    return;
  }

  const toKick = msg.mentions.users.first();
  const toKickMember = msg.mentions.members.first();

  const [[team], memberships] = await Promise.all([
    listTeams({ id: args.teamMembership.team_id }),
    listTeamMemberships({
      team_id: args.teamMembership.team_id,
      user_id: toKick.id,
    }),
  ]);

  if (!memberships.length) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("User not in team")
        .setDescription(`<@${toKick.id}> isn't in your team!`)
    );
    return;
  }

  if (memberships[0].id === args.teamMembership.id) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Can't kick yourself")
        .setDescription("Try `!team leave`.")
    );
    return;
  }

  const kickReason = args.splitCommand[3] || "No reason specified.";

  const kickConfirmMessage = await msg.channel.send(
    infoEmbed()
      .setTitle(`Confirm kicking ${toKick.tag}`)
      .setDescription(
        `<@${toKick.id}> will be immediately removed from your team. 
        The team and the user will be notified. 
        You can reinvite them at any time.`
      )
      .addField("Reason for kick", kickReason)
  );

  const confirmation = await discordConfirm(
    msg.author.id,
    kickConfirmMessage,
    errorEmbed()
      .setTitle("Kick timeout")
      .setDescription(`<@${toKick.id}> is still on your team.`),
    errorEmbed()
      .setTitle("Kick cancelled")
      .setDescription(`<@${toKick.id}> is still on your team.`)
  );

  if (!confirmation) {
    return;
  }

  try {
    await toKickMember.roles.remove([
      team.role_id,
      args.currentTournament.participant_role_id,
    ]);
  } catch (e) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Error removing roles")
        .setDescription(
          `There was an error removing roles from <@${toKick.id}>. They are still on your team.`
        )
    );
    return;
  }

  try {
    await deleteTeamMemberships({ id: memberships[0].id });
  } catch (e) {
    await toKickMember.roles.add([
      team.role_id,
      args.currentTournament.participant_role_id,
    ]);
    await msg.channel.send(
      errorEmbed()
        .setTitle("Error deleting team membership")
        .setDescription(
          `There was an error removing <@${toKick.id}>'s membership. They are still on your team.`
        )
    );
    return;
  }

  try {
    await toKick.dmChannel.send(
      infoEmbed()
        .setTitle(`Kicked from \`\`[${team.tag}] ${team.name}\`\``)
        .setDescription(
          `You were kicked from \`[${team.tag}] ${team.name}\` by <@${msg.author.id}>.`
        )
        .addField("Reason for kick:", kickReason)
    );
  } catch {
    await msg.channel.send(
      `<@${toKick.id}>, you've been kicked from \`[${team.tag}] ${team.name}\` for reason \`${kickReason}\`.
       I couldn't DM you to deliver the news :(.`
    );
  }

  const teamChannel = await getTeamTextChannel(msg, team.category_id);
  await teamChannel.send(
    `<@&${team.role_id}>`,
    infoEmbed()
      .setTitle(`${toKick.tag} has been kicked`)
      .setDescription(`<@${msg.author.id}> gave <@${toKick.id}> the boot.`)
      .addField("Reason for kick:", kickReason)
  );

  await msg.channel.send(
    successEmbed()
      .setTitle(`Successfully kicked ${toKick.tag}`)
      .setDescription(
        `They are no longer a member of \`[${team.tag}] ${team.name}\`.`
      )
      .addField("Reason for kick:", kickReason)
  );
}

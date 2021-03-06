import { Message } from "discord.js";
import { listTeams } from "../db/teams";
import { insertTeamInvite, listTeamInvites } from "../db/team_invites";
import { TeamArgs } from "./index";
import { errorEmbed, infoEmbed, warnEmbed } from "../util/embeds";
import { listUsers } from "../db/users";

export default async function invite(
  msg: Message,
  args: TeamArgs
): Promise<void> {
  if (msg.mentions.users.some((u) => u.bot)) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Invalid user")
        .setDescription("You can't invite bots to your team, silly!")
    );
    return;
  }
  if (!msg.mentions.users.first()) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("No user provided")
        .setDescription("You didn't give someone to invite.")
    );
    return;
  }
  const inviteesIds = msg.mentions.users.map((u) => u.id);

  const [invitees, [team]] = await Promise.all([
    listUsers({
      discord_id: inviteesIds,
      meta: { require_uuid: true },
    }),
    listTeams({ id: args.teamMembership.team_id }),
  ]);

  if (
    invitees.length !== msg.mentions.users.size ||
    invitees.some((u) => !u.minecraft_uuid)
  ) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Invalid user(s)")
        .setDescription(
          "One or more of the users you invited doesn't have their Minecraft username " +
            "linked to their account or isn't a member of this server. " +
            "Contact admins if you're sure everyone has done so."
        )
    );
    return;
  }

  const existingInvites = await listTeamInvites({
    invited_user_id: inviteesIds,
    team_id: team.id,
    retracted: false,
  });
  if (existingInvites.length) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Already invited")
        .setDescription(
          `One or more of the users you're trying to invite have already been invited: ${existingInvites
            .map(
              (i) =>
                `<@${i.invited_user_id}> (invited by <@${i.inviter_user_id}>)`
            )
            .join(", ")}`
        )
    );
    return;
  }

  // invited via db

  try {
    await insertTeamInvite(
      invitees.map((i) => ({
        team_id: team.id,
        invited_user_id: i.discord_id,
        inviter_user_id: msg.author.id,
      }))
    );
  } catch {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Error inserting invites")
        .setDescription(
          "There was a server error adding the invites. Try again later or contact admins."
        )
    );
    return;
  }

  msg.mentions.users.forEach(
    async (u): Promise<void> => {
      const embed = infoEmbed()
        .setTitle(`Invited to \`[${team.tag}] ${team.name}\``)
        .setDescription(
          `You've been invited to \`[${team.tag}] ${team.name}\` by <@${msg.author.id}>! Head over to the tournaments server and use \`!team join ${team.tag}\`!\n
        If you're already in a team, you'll need to use \`!team leave\` first. You can see other teams you've been invited to with \`!invites\`.`
        );
      try {
        await u.send(embed);
        await msg.channel.send(
          infoEmbed()
            .setTitle("Invite Successful")
            .setDescription(
              `<@${u.id}> was successfully invited! They received a DM from this bot.`
            )
        );
      } catch {
        await msg.channel.send(
          warnEmbed()
            .setTitle("Invite Successful")
            .setDescription(
              `<@${u.id}> was invited, but we couldn't DM them. Tell them you've invited them!\n(<@${u.id}>, use \`!invites\` to see all your invites!)`
            )
        );
      }
    }
  );
}

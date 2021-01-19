import { Message, MessageEmbed } from "discord.js";
import { listTeams } from "../db/teams";
import { insertTeamInvite, listTeamInvites } from "../db/team_invites";
import { TeamArgs } from "./index";
import { errorEmbed, infoEmbed } from "../util/embeds";
import { listUsers } from "../db/users";

export default async function invite(
  msg: Message,
  args: TeamArgs
): Promise<void> {
  if (!args.teamMembership) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("No team")
        .setDescription("You're not in a team! Use `!team create` to make one.")
    );
    return;
  }

  if (args.teamMembership.type !== "leader") {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Insufficient permissions")
        .setDescription(
          "Only the team leader can invite others. Ask them to do so."
        )
    );
    return;
  }

  if (msg.mentions.users.some((u) => u.bot)) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Invalid user")
        .setDescription("You can't invite bots to your team, silly!")
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
      const noDmMsg = `<@${u.id}> was invited, but we couldn't DM them. Tell them you've invited them!\n(<@${u.id}>, use \`!invites\` to see all your invites!)`;
      const successMsg = `${u.username} was successfully invited! They recieved a DM from this bot.`;

      if (!u.dmChannel) {
        const ch = await u.createDM();
        try {
          await ch.send(embed);
          await msg.reply(successMsg);
        } catch {
          await msg.reply(noDmMsg);
        }
      } else {
        try {
          await u.dmChannel.send(embed);
          await msg.reply(successMsg);
        } catch {
          await msg.reply(noDmMsg);
        }
      }
    }
  );
}

function invitedToJoinEmbed(
  tag: string,
  name: string,
  prefix: string
): MessageEmbed {
  return new MessageEmbed()
    .setColor("#00ff00")
    .setTitle("You've Been Invited")
    .setDescription(
      `You've been invited to join \`[${tag}] ${name}\`. Run \`${prefix}team join ${tag}\` in a server with this bot to join them.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function inviteSuccess(tag: string, name: string, id: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#00ff00")
    .setTitle("Successfully Invited ")
    .setDescription(`Invited <@${id}> to join \`[${tag}] ${name}\`.`)
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function cannotInviteBotEmbed(
  tag: string,
  name: string,
  id: string
): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Cannot Invite Bot")
    .setDescription(
      `You cannot invite <@${id}> to join \`[${tag}] ${name}\` because <@${id}> is a bot or another unexpected error occurred.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function notInTeamEmbed(id: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Cannot Invite")
    .setDescription(
      `You cannot invite <@${id}> to join your team because you are not in one currently.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function notLeaderEmbed(tag: string, name: string, id: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Cannot Invite")
    .setDescription(
      `You cannot invite <@${id}> to join \`[${tag}] ${name}\` because you are not the leader of this team.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function alreadyInvitedEmbed(
  tag: string,
  name: string,
  id: string
): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Already Invited")
    .setDescription(
      `You cannot invite <@${id}> to join \`[${tag}] ${name}\` because you already invited them.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function alreadyInDiffTeamEmbed(
  tag: string,
  name: string,
  id: string
): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Already In Different Team")
    .setDescription(
      `You cannot invite <@${id}> to join \`[${tag}] ${name}\` because they are already in a different team.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function alreadyInTeamEmbed(
  tag: string,
  name: string,
  id: string
): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Already In Team")
    .setDescription(
      `You cannot invite <@${id}> to join \`[${tag}] ${name}\` because they are already in this team.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

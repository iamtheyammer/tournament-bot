import { Message, MessageEmbed } from "discord.js";
import { listTeams } from "../db/teams";
import { listTeamInvites } from "../db/team_invites";
import { listTeamMemberships } from "../db/team_memberships";
import { prefix } from "../index";

export default async function invite(msg: Message): Promise<void> {
  const teamMembers = await listTeamMemberships({ user_id: msg.author.id });
  const team = await listTeams({ id: teamMembers[0].id });
  if (!teamMembers.length) {
    msg.channel.send(notInTeamEmbed(msg.mentions.members.first().id));
    return;
  }
  if (teamMembers[0].type !== "leader") {
    msg.channel.send(
      notLeaderEmbed(team[0].tag, team[0].name, msg.mentions.members.first().id)
    );
    return;
  }
  const invitee = await listTeamMemberships({
    user_id: msg.mentions.members.first().id,
  });
  if (invitee.length) {
    msg.channel.send(
      alreadyInDiffTeamEmbed(
        team[0].tag,
        team[0].name,
        msg.mentions.members.first().id
      )
    );
    return;
  }
  const inviteList = await listTeamInvites({
    invited_user_id: msg.mentions.members.first().id,
  });
  if (inviteList.length) {
    msg.channel.send(
      alreadyInvitedEmbed(
        team[0].tag,
        team[0].name,
        msg.mentions.members.first().id
      )
    );
    return;
  }
  if (invitee[0].team_id === team[0].id && invitee[0].tournament_id === team[0].tournament_id) {
    msg.channel.send(
      alreadyInTeamEmbed(
        team[0].tag,
        team[0].name,
        msg.mentions.members.first().id
      )
    );
    return;
  }
  msg.guild.members.cache
    .get(msg.mentions.members.first().id)
    .send(invitedToJoinEmbed(team[0].tag, team[0].name, prefix))
    .then(() => {
      msg.channel.send(
        inviteSuccess(
          team[0].tag,
          team[0].name,
          msg.mentions.members.first().id
        )
      );
    })
    .catch(() => {
      msg.channel.send(
        cannotInviteBotEmbed(
          team[0].tag,
          team[0].name,
          msg.mentions.members.first().id
        )
      );
      return;
    });
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
    .setDescription(
      `Invited <@${id}> to join \`[${tag}] ${name}\`.`
    )
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

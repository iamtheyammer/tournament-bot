import { Message, MessageEmbed } from "discord.js";
import { listTeams } from "../db/teams";
import { deleteTeamInvite, listTeamInvites } from "../db/team_invites";
import {
  insertTeamMemberships,
  listTeamMemberships,
} from "../db/team_memberships";
import { Args } from "../index";

export default async function join(msg: Message, args: Args): Promise<void> {
  const teamMembers = await listTeamMemberships({
    user_id: msg.author.id,
    meta: { order_by: { exp: "team_memberships.inserted_at", dir: "DESC" } },
  });
  const team = await listTeams({
    id: teamMembers[0].team_id,
  });
  const requestedTeam = await listTeams({
    tag: args.splitCommand[2].toUpperCase(),
  });
  if (teamMembers.length) {
    msg.channel.send(alreadyInTeamEmbed(team[0].tag, team[0].name));
    return;
  }
  const inviteList = await listTeamInvites({ invited_user_id: msg.author.id });
  if (!inviteList.length || inviteList[0].team_id !== requestedTeam[0].id) {
    msg.channel.send(notInvitedEmbed(team[0].tag, team[0].name));
  } else {
    await deleteTeamInvite({ invited_user_id: parseInt(msg.author.id) });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const teamJoinId = await insertTeamMemberships({
      user_id: msg.author.id,
      team_id: requestedTeam[0].id,
      tournament_id: requestedTeam[0].tournament_id,
    });
    msg.channel.send(joinedTeamEmbed(team[0].tag, team[0].name));
  }
}

function joinedTeamEmbed(tag: string, name: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#00ff00")
    .setTitle("Joined Team Successfully")
    .setDescription(`You've been joined \`[${tag}] ${name}\`.`)
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function notInvitedEmbed(tag: string, name: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#00ff00")
    .setTitle("You Don't Have An Invite To This Team")
    .setDescription(
      `You cannot join \`[${tag}] ${name}\` because you don't have an invite. Ask the leader for one.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function alreadyInTeamEmbed(tag: string, name: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#00ff00")
    .setTitle("Cannot Join Team")
    .setDescription(
      `You cannot join \`[${tag}] ${name}\` because you are already on a differen team.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

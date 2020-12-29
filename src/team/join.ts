import { Message, MessageEmbed } from "discord.js";
import { teams } from "../index";

export default async function join(
  msg: Message,
  args: Array<string>
): Promise<void> {
  const index = teams.findIndex((team) => team.members.includes(msg.author.id));
  const tagIndex = teams.findIndex(
    (team) => team.tag.toLowerCase() === args[2].toLowerCase()
  );
  if (index !== -1) {
    msg.channel.send(
      alreadyInTeamEmbed(teams[tagIndex].tag, teams[tagIndex].name)
    );
    return;
  }

  if (!teams[tagIndex].invites.includes(msg.author.id)) {
    msg.channel.send(
      notInvitedEmbed(teams[tagIndex].tag, teams[tagIndex].name)
    );
  } else {
    teams[tagIndex].invites.splice(
      teams[tagIndex].invites.findIndex((member) => member === msg.author.id),
      1
    );
    teams[tagIndex].members.push(msg.author.id);
    msg.channel.send(
      joinedTeamEmbed(teams[tagIndex].tag, teams[tagIndex].name)
    );
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

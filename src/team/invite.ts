import { Message, MessageEmbed } from "discord.js";
import { teams, prefix } from "../index";

export default async function invite(msg: Message): Promise<void> {
  const index = teams.findIndex((arg) => arg.members.includes(msg.author.id));
  if (index === -1) {
    msg.channel.send(notInTeamEmbed(msg.mentions.members.first().id));
    return;
  }
  if (teams[index].leader !== msg.author.id) {
    msg.channel.send(
      notLeaderEmbed(
        teams[index].tag,
        teams[index].name,
        msg.mentions.members.first().id
      )
    );
    return;
  }
  if (
    teams.findIndex((team) =>
      team.members.includes(msg.mentions.members.first().id)
    ) !== -1
  ) {
    msg.channel.send(
      alreadyInDiffTeamEmbed(
        teams[index].tag,
        teams[index].name,
        msg.mentions.members.first().id
      )
    );
    return;
  }
  if (teams[index].invites.includes(msg.mentions.members.first().id)) {
    msg.channel.send(
      alreadyInvitedEmbed(
        teams[index].tag,
        teams[index].name,
        msg.mentions.members.first().id
      )
    );
    return;
  }
  if (teams[index].members.includes(msg.mentions.members.first().id)) {
    msg.channel.send(
      alreadyInTeamEmbed(
        teams[index].tag,
        teams[index].name,
        msg.mentions.members.first().id
      )
    );
    return;
  }
  teams[index].invites.push(msg.mentions.members.first().id);
  msg.guild.members.cache
    .get(msg.mentions.members.first().id)
    .send(invitedToJoinEmbed(teams[index].tag, teams[index].name, prefix))
    .then(() => {
      msg.channel.send(
        inviteSuccess(
          teams[index].tag,
          teams[index].name,
          msg.mentions.members.first().id
        )
      );
      setTimeout(() => {
        teams[index].invites.splice(
          teams[index].invites.findIndex((arg) => arg === msg.author.id),
          1
        );
        msg.guild.members.cache
          .get(msg.mentions.members.first().id)
          .send(inviteExpiredEmbed(teams[index].tag, teams[index].name));
      }, 900000);
    })
    .catch(() => {
      msg.channel.send(
        cannotInviteBotEmbed(
          teams[index].tag,
          teams[index].name,
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
      `Invited <@${id}> to join \`[${tag}] ${name}\`. They have 15 minutes to accept.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function inviteExpiredEmbed(tag: string, name: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Invite Expired")
    .setDescription(
      `Your invite to join \`[${tag}] ${name}\` has expired. Ask the leader to send another one if you think this is a mistake.`
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

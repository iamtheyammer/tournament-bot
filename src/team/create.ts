import { Message, MessageEmbed } from "discord.js";
import { TeamArgs } from ".";
import { insertTeam, updateTeam } from "../db/teams";
import { prefix } from "../index";
import { isValidTeamTag } from "../util/regex";

export default async function create(
  msg: Message,
  args: TeamArgs
): Promise<void> {
  if (args.splitCommand.length < 4) {
    // error missing argument
  }

  const teamTag = args.splitCommand[2];
  const teamName = args.splitCommand[3];
  const teamDescription =
    args.splitCommand.length > 3 ? args.splitCommand[4] : "";

  if (!isValidTeamTag(teamTag)) {
    msg.channel.send(notAlphaNumericEmbed(teamTag, teamName));
    return;
  }
  if (args.team) {
    msg.channel.send(alreadyInTeamEmbed(teamTag, teamName));
    return;
  }
  let teamId: number;
  try {
    teamId = await insertTeam({
      // TODO: FIX
      tournament_id: 1,
      name: teamName,
      tag: teamTag,
      description: teamDescription,
    });
  } catch (e) {
    console.log(e);
    msg.channel.send(tagAlreadyExistsEmbed(teamTag, teamName));
  }

  // we know that team creation was a success

  // create discord role
  // create category
  // create channels
  // set channel permissions

  const discordRoleId = "await msg.guild.roles.create()";

  await updateTeam({ role_id: discordRoleId, where: { id: teamId } });

  msg.channel.send(teamCreationConfirmEmbed(teamTag, teamName, prefix));
}

function tagAlreadyExistsEmbed(tag: string, name: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Team Creation Not Allowed")
    .setDescription(
      `You cannot create \`[${tag}] ${name}\` because another team has already taken that tag.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function teamCreationConfirmEmbed(
  tag: string,
  name: string,
  prefix: string
): MessageEmbed {
  return new MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Confirm Team Creation")
    .setDescription(
      `Are you sure these are the settings you want? Type \`${prefix}team confirm\` to accept and create a new team, or \`${prefix}team deny\` to try again. This request will timeout in 30 seconds.`
    )
    .addFields({
      name: "Full Team Name (With Tag)",
      value: `\`[${tag}] ${name}\``,
    })
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function alreadyInTeamEmbed(tag: string, name: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Team Creation Not Allowed")
    .setDescription(
      `You cannot create \`[${tag}] ${name}\` because you are already in a team.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function notAlphaNumericEmbed(tag: string, name: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Team Creation Not Allowed")
    .setDescription(
      `You cannot create \`[${tag}] ${name}\` because the tag is not alphanumeric, the tag is too long, or the tag wasn't given.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

import { Message, MessageEmbed } from "discord.js";
import { TeamArgs } from ".";
import createTeam from "../bundles/create_team";
import { listTeams } from "../db/teams";
import { errorEmbed, infoEmbed } from "../util/embeds";
import { isValidTeamTag } from "../util/regex";

export default async function create(
  msg: Message,
  args: TeamArgs
): Promise<void> {
  if (args.splitCommand.length < 4) {
    // error missing argument
    return;
  }
  const teamTag = args.splitCommand[2].toUpperCase();
  const teamName = args.splitCommand[3];
  const teamList = await listTeams({ tag: teamTag });
  if (teamList.length) {
    msg.channel.send(
      errorEmbed()
        .setTitle("Team Creation Not Allowed")
        .setDescription(
          `You cannot create \`[${teamTag}] ${teamName}\` because another team has already taken that tag.`
        )
    );
  }
  if (!isValidTeamTag(teamTag)) {
    msg.channel.send(notAlphaNumericEmbed(teamTag, teamName));
    return;
  }
  if (args.teamMembership) {
    msg.channel.send(alreadyInTeamEmbed(teamTag, teamName));
    return;
  }

  const teamCreationMessage = await msg.channel.send(
    teamCreationConfirmEmbed(teamTag, teamName)
  );

  await teamCreationMessage.react("❌");
  await teamCreationMessage.react("✅");

  let reactions;
  try {
    reactions = await teamCreationMessage.awaitReactions(
      (reaction, user) =>
        msg.author.id === user.id &&
        (reaction.emoji.name === "✅" || reaction.emoji.name === "❌"),
      {
        time: 30000,
        max: 1,
        errors: ["time"],
      }
    );
  } catch {
    msg.channel.send(
      errorEmbed()
        .setTitle("Team Abandoned")
        .setDescription(
          "You didn't confirm the team within 30 seconds of its creation."
        )
    );
    return;
  }
  if (reactions.first().emoji.name === "❌") {
    msg.channel.send(
      infoEmbed()
        .setTitle("Team Creation Cancelled")
        .setDescription("Nothing was created.")
    );
    return;
  }

  await createTeam(
    msg,
    args.currentTournament,
    msg.author.id,
    teamName,
    teamTag
  );
}

function teamCreationConfirmEmbed(tag: string, name: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Confirm Team Creation")
    .setDescription(
      `Are you sure these are the settings you want? React with the adequate emoji to confirm creation. This request will timeout in 30 seconds.`
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

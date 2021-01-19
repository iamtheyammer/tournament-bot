import { Message, MessageEmbed } from "discord.js";
import { TeamArgs } from ".";
import createTeam from "../bundles/create_team";
import { listTeams } from "../db/teams";
import { errorEmbed, infoEmbed, successEmbed } from "../util/embeds";
import { isValidTeamTag } from "../util/regex";
import discordConfirm from "../util/discord_confirm";

export default async function create(
  msg: Message,
  args: TeamArgs
): Promise<void> {
  if (args.splitCommand.length < 4) {
    // error missing argument
    await msg.channel.send(
      errorEmbed()
        .setTitle("Missing arguments")
        .setDescription(
          'Use `!team create TAG "Team Name" "Team Description (optional)" to create your team!'
        )
    );
    return;
  }

  const teamTag = args.splitCommand[2].toUpperCase();
  const teamName = args.splitCommand[3];

  if (teamName.length > 30) {
    await msg.reply(
      errorEmbed()
        .setTitle("Team name too long")
        .setDescription("Team names can be a maximum of **30 characters**.")
    );
    return;
  }

  const teamList = await listTeams({ tag: teamTag });
  if (teamList.length) {
    msg.channel.send(
      errorEmbed()
        .setTitle("Tag Taken")
        .setDescription(
          `You cannot create \`[${teamTag}] ${teamName}\` because \`${teamList[0].tag} ${teamList[0].name}\` has already taken that tag.`
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

  const confirmation = await discordConfirm(
    msg.author.id,
    teamCreationMessage,
    errorEmbed()
      .setTitle("Team Abandoned")
      .setDescription(
        "You didn't confirm the team within 30 seconds of its creation."
      ),
    infoEmbed()
      .setTitle("Team Creation Cancelled")
      .setDescription("Nothing was created.")
  );

  if (!confirmation) {
    return;
  }

  try {
    await createTeam(
      msg,
      args.currentTournament,
      msg.author.id,
      teamName,
      teamTag
    );
  } catch (e) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Error creating team")
        .setDescription(
          "There was an error creating your team. Ask an admin to check the logs for more info.\nAnything created has been undone."
        )
    );
    return;
  }

  await msg.channel.send(
    successEmbed().setTitle("Team successfully created!").setDescription(
      `Team ${teamName} has been created!\nUse \`!team invite @SomeoneElse\` to invite others, 
        or use \`!team info\` to see your shiny new team!`
    )
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

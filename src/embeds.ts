import * as Discord from "discord.js";
import { playerIGN } from "./index";
export function ignList(playerIGNs: Array<playerIGN>): Discord.MessageEmbed {
  const fields = [];
  for (let i = 0; i < playerIGNs.length; i++) {
    fields.push({
      name: `${playerIGNs[i].tag}`,
      value: `${playerIGNs[i].ign}`,
      inline: true,
    });
  }
  return new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("List of IGNs")
    .setDescription("List of users with their IGNs.")
    .addFields(fields)
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function linkSuccess(ign: string, id: string): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#00ff00")
    .setTitle("Link Success")
    .setDescription(`Successfully linked user <@${id}> to \`${ign}\`.`)
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function linkFailed(ign: string, id: string): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Link Failed")
    .setDescription(
      `Failed to link user <@${id}> to \`${ign}\` because \`${ign}\` does not have them in their social links.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function linkWrongUser(ign: string, id: string): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Link Failed")
    .setDescription(
      `Failed to link user <@${id}> to \`${ign}\` because \`${ign}\` does not exist or an error occurred with the bot.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function linkBadUser(ign: string, id: string): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Link Failed")
    .setDescription(
      `Failed to link user <@${id}> to \`${ign}\` because \`${ign}\` does not have a discord account linked.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function getIGNSuccess(ign: string, id: string): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#00ff00")
    .setTitle("IGN Grab Success")
    .setDescription(`<@${id}>'s in game name is \`${ign}\`.`)
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function getIGNFailed(
  notAUser: boolean,
  id?: string,
  tag?: string
): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#ff0000")
    .setTitle("IGN Grab Failed")
    .setDescription(
      `${
        notAUser
          ? `Couldn't grab \`${tag}\`'s in game name because that user doesn't exist or their data is missing.`
          : `Couldn't grab <@${id}>'s in game name because they haven't linked their discord yet.`
      }`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function delinkSuccess(id: string, ign: string): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#ff0000")
    .setTitle("IGN Delinking Success")
    .setDescription(`Successfully delinked <@${id}> from \`${ign}\`.`)
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function delinkFailed(id: string): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#ff0000")
    .setTitle("IGN Delinking Failed")
    .setDescription(
      `Could not delink <@${id}> from an IGN because there was no link to begin with.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function ignInfo(prefix: string): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle("IGN Subcommands")
    .setDescription(`List of all commands that use ${prefix}ign to begin with.`)
    .addFields(
      {
        name: `\`${prefix}ign link <username>\``,
        value: `Allows you to link your discord profile to hypixel. Must have linked your discord on hypixel's social media link system.\nUsage: **${prefix}ign link SweetPlum**`,
      },
      {
        name: `\`${prefix}ign get <mention | tag>\``,
        value: `Queries the database to find someone's IGN.\nUsage: **${prefix}ign get <@302942608676880385>**\nAlternate usage: **${prefix}ign get Sweetplum123#6205**`,
      },
      {
        name: `\`${prefix}ign delink\``,
        value: `Removes any existing link you have with your minecraft username.\nUsage: **${prefix}ign delink**`,
      },
      {
        name: `\`${prefix}ign list\``,
        value: `Lists all discord users that have linked their discord and minecraft and displays their IGN below.\nUsage: **${prefix}ign list**`,
      }
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function linkArgumentMissing(prefix: string): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Argument Missing")
    .setDescription(
      `You didn't put a username you wanted to link to.\nUsage: \`${prefix}ign link <username>\``
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function getArgumentMissing(prefix: string): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Argument Missing")
    .setDescription(
      `You didn't put a user you wanted to get the IGN of.\nUsage: \`${prefix}ign get <mention | tag>\``
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function teamCreationConfirm(
  tag: string,
  name: string,
  prefix: string
): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
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

export function teamCreationConfirmed(
  tag: string,
  name: string,
  leader: string
): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#00ff00")
    .setTitle("Team Creation Successful")
    .setDescription(
      `Success! \`[${tag}] ${name}\` has been created with <@${leader}> as its leader.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function teamCreationDenied(
  tag: string,
  name: string
): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Team Creation Halted")
    .setDescription(`The creation of \`[${tag}] ${name}\` has been stopped.`)
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function tagAlreadyExists(
  tag: string,
  name: string
): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Team Creation Not Allowed")
    .setDescription(
      `You cannot create \`[${tag}] ${name}\` because another team has already taken that tag.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function alreadyInTeam(tag: string, name: string): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Team Creation Not Allowed")
    .setDescription(
      `You cannot create \`[${tag}] ${name}\` because you are already in a team.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

export function noIGNLinked(prefix: string): Discord.MessageEmbed {
  return new Discord.MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Team Command Blocked")
    .setDescription(
      `You cannot use any team commands because you haven't linked your discord account to Hypixel. Use \`${prefix}ign link <name>\` to link your account.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

import { Message, MessageEmbed } from "discord.js";
import { prefix } from "../index";
import link from "./link";
import list from "./list";
import get from "./get";
import unlink from "./unlink";

export default async function ignHandler(
  msg: Message,
  args: Array<string>
): Promise<void> {
  switch (args[1]) {
    case "link": {
      await link(msg, args);
      break;
    }
    case "list": {
      await list(msg);
      break;
    }
    case "get": {
      await get(msg);
      break;
    }
    case "unlink": {
      await unlink(msg);
      break;
    }
    default: {
      msg.channel.send(getIgnHelpEmbed(prefix));
    }
  }
}

function getIgnHelpEmbed(prefix: string): MessageEmbed {
  return new MessageEmbed()
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
        name: `\`${prefix}ign unlink\``,
        value: `Removes any existing link you have with your minecraft username.\nUsage: **${prefix}ign unlink**`,
      },
      {
        name: `\`${prefix}ign list\``,
        value: `Lists all discord users that have linked their discord and minecraft and displays their IGN below.\nUsage: **${prefix}ign list**`,
      }
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

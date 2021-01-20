import { Message } from "discord.js";
import { TeamArgs } from "../index";
import { infoEmbed } from "../../util/embeds";
import name from "./name";
import description from "./description";

export default async function edit(
  msg: Message,
  args: TeamArgs
): Promise<void> {
  if (args.splitCommandLower.length < 4) {
    await msg.channel.send(commandUsage);
    return;
  }

  const action = args.splitCommandLower[2];

  switch (action) {
    case "name": {
      await name(msg, args);
      break;
    }
    case "description": {
      await description(msg, args);
      break;
    }
    default: {
      await msg.channel.send(commandUsage);
    }
  }
}

const commandUsage = infoEmbed()
  .setTitle("`!team edit` usage")
  .setDescription(
    'A field is missing. Usage: `!team edit [name|description] ["new value"|(clear)]`'
  )
  .addFields(
    {
      name: "To clear description",
      value: "Run `!team edit description (clear)`",
    },
    {
      name: "To update description",
      value:
        'Run `!team edit description "My new description"`. ' +
        "Note descriptions are limited to 255 characters.",
    },
    {
      name: "To update name",
      value:
        'Run `!team edit name "New team name"`. Team names are limited to 30 characters.',
    }
  );

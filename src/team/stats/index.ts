import { Message } from "discord.js";
import { TeamArgs } from "..";

import { listTeams } from "../../db/teams";
import { errorEmbed } from "../../util/embeds";
import bw from "./bw";
import sw from "./sw";

export default async function stats(
  msg: Message,
  args: TeamArgs
): Promise<void> {
  let teams;
  if (args.splitCommand[3]) {
    const specifiedTag = args.splitCommandLower[3].toUpperCase();
    teams = await listTeams({ tag: specifiedTag });
    if (!teams.length) {
      await msg.channel.send(
        errorEmbed()
          .setTitle("Invalid team tag")
          .setDescription(`A team with tag \`${specifiedTag}\` doesn't exist.`)
      );
      return;
    }
  } else {
    if (!args.teamMembership) {
      await msg.channel.send(
        errorEmbed()
          .setTitle("No team found")
          .setDescription(
            "In order to use this command without a team tag, you need to be in a team.\nTry `!team stats TAG`."
          )
      );
      return;
    }
    teams = await listTeams({ id: args.teamMembership.team_id });
  }
  switch (args.splitCommandLower[2]) {
    case "bw": {
      await bw(msg, args, teams);
      break;
    }
    case "sw": {
      await sw(msg, args, teams);
      break;
    }
  }
}

import { Message, MessageEmbed } from "discord.js";
import { prefix, Args } from "../index";
import info from "./info";
import join from "./join";
import create from "./create";
import invite from "./invite";
import { listUsers } from "../db/users";
import { DBTeam, listTeams } from "../db/teams";

export interface TeamArgs extends Args {
  team?: DBTeam;
}

export default async function teamHandler(
  msg: Message,
  args: Args
): Promise<void> {
  const users = await listUsers({ discord_id: msg.author.id });
  if (!users.length || !users[0].minecraft_uuid) {
    msg.channel.send(noIGNLinked(prefix));
    return;
  }
  // get the team
  const teams = await listTeams({
    user_id: msg.author.id,
    meta: { order_by: { exp: "team_memberships.inserted_at", dir: "DESC" } },
  });

  const teamArgs: TeamArgs = args;

  if (teams.length) {
    teamArgs.team = teams[0];
  }

  switch (args.splitCommandLower[1]) {
    // case "confirm": {
    //   await confirm(msg, index);
    //   break;
    // }
    // case "deny": {
    //   await deny(msg, index);
    //   break;
    // }
    case "create": {
      await create(msg, args);
      break;
    }
    case "invite": {
      await invite(msg);
      break;
    }
    case "join": {
      await join(msg, args);
      break;
    }
    case "info": {
      await info(msg, args);
      break;
    }
  }
}

export function noIGNLinked(prefix: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Team Command Blocked")
    .setDescription(
      `You cannot use any team commands because you haven't linked your discord account to Hypixel. Use \`${prefix}ign link <name>\` to link your account.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

import { Message, MessageEmbed } from "discord.js";
import { prefix, Args } from "../index";
import info from "./info";
import join from "./join";
import create from "./create";
import invite from "./invite";
import { DBTeamMembership, listTeamMemberships } from "../db/team_memberships"
import { DBTournament, listTournaments } from "../db/tournaments";

export interface TeamArgs extends Args {
  teamMembership?: DBTeamMembership;
  currentTournament?: DBTournament;
}

export default async function teamHandler(
  msg: Message,
  args: Args
): Promise<void> {
  if (!args.user || !args.user.minecraft_uuid) {
    msg.channel.send(noIGNLinked(prefix));
    return;
  }

  const tournaments = await listTournaments({ meta:{ active_only: true} });

  if (!tournaments.length) {
    // something error no team commands allowed whatever
    return;
  }

  const activeTournament = tournaments[0];

  const userTeamMembership = await listTeamMemberships({ user_id: msg.author.id, tournament_id: activeTournament.id})
  
  const teamArgs: TeamArgs = args;

  if (userTeamMembership.length) {
    teamArgs.teamMembership = userTeamMembership[0];
  }

  switch (args.splitCommandLower[1]) {
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

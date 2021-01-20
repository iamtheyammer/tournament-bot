import {
  CategoryChannel,
  Message,
  MessageEmbed,
  TextChannel,
} from "discord.js";
import { prefix, Args } from "../index";
import info from "./info";
import join from "./join";
import create from "./create";
import invite from "./invite";
import { DBTeamMembership, listTeamMemberships } from "../db/team_memberships";
import { DBTournament, listTournaments } from "../db/tournaments";
import { errorEmbed } from "../util/embeds";
import leave from "./leave";
import transfer from "./transfer";
import kick from "./kick";
import edit from "./edit/index";
import deleteTeam from "./delete";
import stats from "./stats";

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

  const tournaments = await listTournaments({ meta: { active_only: true } });

  if (!tournaments.length) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("No current tournament")
        .setDescription(
          "There isn't a tournament right now. Check our announcements channels for more info!"
        )
    );
    return;
  }

  const activeTournament = tournaments[0];

  const userTeamMembership = await listTeamMemberships({
    user_id: msg.author.id,
    tournament_id: activeTournament.id,
  });

  const teamArgs: TeamArgs = {
    ...args,
    currentTournament: activeTournament,
  };

  if (userTeamMembership.length) {
    teamArgs.teamMembership = userTeamMembership[0];
  }

  switch (args.splitCommandLower[1]) {
    case "create": {
      await create(msg, teamArgs);
      break;
    }
    case "invite": {
      if (!(await requireLeaderMembership(msg, teamArgs))) return;
      await invite(msg, teamArgs);
      break;
    }
    case "join": {
      await join(msg, teamArgs);
      break;
    }
    case "leave": {
      if (!(await requireTeamMembership(msg, teamArgs))) return;
      await leave(msg, teamArgs);
      break;
    }
    case "info": {
      await info(msg, teamArgs);
      break;
    }
    case "transfer": {
      if (!(await requireLeaderMembership(msg, teamArgs))) return;
      await transfer(msg, teamArgs);
      break;
    }
    case "kick": {
      if (!(await requireLeaderMembership(msg, teamArgs))) return;
      await kick(msg, teamArgs);
      break;
    }
    case "edit": {
      if (!(await requireLeaderMembership(msg, teamArgs))) return;
      await edit(msg, teamArgs);
      break;
    }
    case "delete": {
      if (!(await requireLeaderMembership(msg, teamArgs))) return;
      await deleteTeam(msg, teamArgs);
      break;
    }
    case "stats": {
      await stats(msg, teamArgs);
      break;
    }
    default: {
      await msg.channel.send(
        errorEmbed()
          .setTitle("Unknown command")
          .setDescription("Try `!team help` for more information.")
      );
      return;
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

export async function requireTeamMembership(
  msg: Message,
  args: TeamArgs
): Promise<boolean> {
  if (!args.teamMembership) {
    await msg.reply(
      errorEmbed()
        .setTitle("No team")
        .setDescription(
          "This command requires you to be in a team. " +
            "Create one with `!team create` or ask another team's leader to invite you."
        )
    );
    return false;
  }
  return true;
}

export async function requireLeaderMembership(
  msg: Message,
  args: TeamArgs
): Promise<boolean> {
  if (!(await requireTeamMembership(msg, args))) return false;

  if (args.teamMembership.type !== "leader") {
    await msg.reply(
      errorEmbed()
        .setTitle("Insufficient permissions")
        .setDescription("You must be the team leader to execute that command.")
    );
    return false;
  }

  return true;
}

export async function getTeamTextChannel(
  msg: Message,
  teamCategoryId: string
): Promise<TextChannel> {
  const category = msg.guild.channels.resolve(
    teamCategoryId
  ) as CategoryChannel;

  return (await category.children.find(
    (c) => c.type === "text"
  )) as TextChannel;
}

import { Message } from "discord.js";
import { Args } from "../index";
import { DBTournament, listTournaments } from "../db/tournaments";
import currentInfo from "./current_info";
import join from "./join";
import leave from "./leave";

export interface TournamentArgs extends Args {
  currentTournament?: DBTournament;
}

export default async function tournamentHandler(
  msg: Message,
  args: Args
): Promise<void> {
  const tournaments = await listTournaments({ meta: { active_only: true } });

  const tournamentArgs: TournamentArgs = { ...args };

  if (tournaments[0]) {
    tournamentArgs.currentTournament = tournaments[0];
  }

  switch (args.splitCommandLower[1]) {
    case "join": {
      await join(msg, tournamentArgs);
      break;
    }
    case "leave": {
      await leave(msg, tournamentArgs);
      break;
    }
    default: {
      await currentInfo(msg, tournamentArgs);
      break;
    }
  }
}

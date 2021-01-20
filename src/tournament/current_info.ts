import { Message } from "discord.js";
import { TournamentArgs } from "./index";
import { infoEmbed } from "../util/embeds";
import { DateTime } from "luxon";

export default async function currentInfo(
  msg: Message,
  args: TournamentArgs
): Promise<void> {
  const tourney = args.currentTournament;

  if (!tourney) {
    await msg.channel.send(
      infoEmbed()
        .setTitle("No current tournament")
        .setDescription(
          "There's no tournament scheduled right now. Check announcements channels!"
        )
    );
    return;
  }

  await msg.channel.send(
    infoEmbed()
      .setTitle(`Current Tournament: ${tourney.name}`)
      .addFields(
        {
          name: "Short Name",
          value: tourney.short_name,
          inline: true,
        },
        {
          name: "Game Type",
          value: tourney.gamemode,
          inline: true,
        },
        {
          name: "Max Team Size",
          value: tourney.max_team_size,
          inline: true,
        },
        {
          name: "Signups Start (PST)",
          value: tourney.opens_at
            ? DateTime.fromJSDate(tourney.opens_at)
                .setZone("America/Los_Angeles")
                .toRelativeCalendar()
            : "unknown",
          inline: true,
        },
        {
          name: "Tournament Starts (PST)",
          value: tourney.starts_at
            ? DateTime.fromJSDate(tourney.starts_at)
                .setZone("America/Los_Angeles")
                .toRelativeCalendar()
            : "unknown",
          inline: true,
        }
      )
  );
}

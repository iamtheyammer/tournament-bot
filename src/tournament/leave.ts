import { Message } from "discord.js";
import { TournamentArgs } from ".";
import { deleteParticipant, listParticipants } from "../db/participants";
import { errorEmbed, successEmbed } from "../util/embeds";

export default async function join(
  msg: Message,
  args: TournamentArgs
): Promise<void> {
  const participant = await listParticipants({
    discord_id: msg.author.id,
    tournament_id: args.currentTournament.id,
  });
  if (!participant.length) {
    msg.channel.send(
      errorEmbed()
        .setTitle("Cannot Leave Tournament")
        .setDescription(
          "You cannot leave this tournament because you have not yet joined this tournament."
        )
    );
  }

  await deleteParticipant({
    id: participant[0].id,
  });
  msg.channel.send(
    successEmbed()
      .setTitle("Left Tournament")
      .setDescription("You have successfully left the tournament.")
  );
}

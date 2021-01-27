import { Message } from "discord.js";
import { TournamentArgs } from ".";
import { insertParticipant, listParticipants } from "../db/participants";
import { listUsers } from "../db/users";
import { errorEmbed, successEmbed } from "../util/embeds";

export default async function join(
  msg: Message,
  args: TournamentArgs
): Promise<void> {
  if (args.currentTournament.team_selection_type === "manual") {
    msg.channel.send(
      errorEmbed()
        .setTitle("Unable to Join")
        .setDescription(
          "You cannot join because creation of teams are manual during this tournament."
        )
    );
    return;
  }
  const user = await listUsers({ discord_id: msg.author.id });
  if (!user.length) {
    msg.channel.send(
      errorEmbed()
        .setTitle("No IGN Linked")
        .setDescription(
          "You cannot join this tournament because you have not yet linked your IGN."
        )
    );
  }
  const participant = await listParticipants({
    discord_id: msg.author.id,
    tournament_id: args.currentTournament.id,
  });
  if (!participant.length) {
    msg.channel.send(
      errorEmbed()
        .setTitle("Already Joined")
        .setDescription(
          "You cannot join this tournament again because you have already joined this tournament."
        )
    );
  }
  await insertParticipant({
    tournament_id: args.currentTournament.id,
    discord_id: user[0].discord_id,
    minecraft_uuid: user[0].minecraft_uuid,
  });
  msg.channel.send(
    successEmbed()
      .setTitle("Joined Tournament")
      .setDescription(
        "You have successfully joined the tournament! Wait until your team is randomly chosen."
      )
  );
}

import { Message } from "discord.js";
import { TeamArgs } from "../index";
import { listTeams, updateTeam } from "../../db/teams";
import { errorEmbed, infoEmbed, successEmbed } from "../../util/embeds";
import discordConfirm from "../../util/discord_confirm";

export default async function description(
  msg: Message,
  args: TeamArgs
): Promise<void> {
  let description = args.splitCommand[3];
  if (description.length > 255) {
    await msg.reply(
      errorEmbed()
        .setTitle("Description too long")
        .setDescription(`Descriptions can be a max of 255 characters.`)
    );
    return;
  }

  if (description === "(clear)") {
    description = null;
  }

  const [team] = await listTeams({ id: args.teamMembership.team_id });

  const confirmMessage = await msg.reply(
    infoEmbed()
      .setTitle("Confirm new description")
      .addFields(
        { name: "Old description:", value: team.description },
        { name: "New description:", value: description }
      )
  );

  const confirmation = await discordConfirm(
    msg.author.id,
    confirmMessage,
    errorEmbed()
      .setTitle("Update timeout")
      .setDescription("Your team's description was not changed."),
    errorEmbed()
      .setTitle("Update cancelled")
      .setDescription("Your team's description was not changed.")
  );

  if (!confirmation) {
    return;
  }

  await updateTeam({ description, where: { id: team.id } });

  await msg.reply(
    successEmbed()
      .setTitle("Successfully updated description")
      .setDescription("Your shiny new description is below.")
      .addField("New description:", description)
  );
}

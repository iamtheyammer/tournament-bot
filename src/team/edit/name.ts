import { CategoryChannel, Message } from "discord.js";
import { TeamArgs } from "../index";
import { errorEmbed, infoEmbed, successEmbed } from "../../util/embeds";
import { listTeams, updateTeam } from "../../db/teams";
import discordConfirm from "../../util/discord_confirm";

export default async function name(
  msg: Message,
  args: TeamArgs
): Promise<void> {
  const name = args.splitCommand[3];
  if (name.length > 30) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Name too long")
        .setDescription(`Team names can be a max of 30 characters.`)
    );
    return;
  }

  const [team] = await listTeams({ id: args.teamMembership.team_id });

  const confirmMessage = await msg.channel.send(
    infoEmbed()
      .setTitle("Confirm new name")
      .addFields(
        { name: "Old name:", value: team.name },
        { name: "New name:", value: name }
      )
  );

  const confirmation = await discordConfirm(
    msg.author.id,
    confirmMessage,
    errorEmbed()
      .setTitle("Update timeout")
      .setDescription("Your team's name was not changed."),
    errorEmbed()
      .setTitle("Update cancelled")
      .setDescription("Your team's name was not changed.")
  );

  if (!confirmation) {
    return;
  }

  await updateTeam({ name, where: { id: team.id } });
  const teamCategory = msg.guild.channels.resolve(
    team.category_id
  ) as CategoryChannel;
  await Promise.all([
    ...teamCategory.children.map((c) => {
      if (c.type === "voice") {
        return c.setName(c.name.replace(team.name, name));
      } else {
        return c.setName(
          c.name.replace(c.name, name.toLowerCase().replace(" ", "-"))
        );
      }
    }),
    teamCategory.setName(name),
  ]);

  await msg.channel.send(
    successEmbed()
      .setTitle("Successfully updated name")
      .setDescription("Your shiny new name is below.")
      .addField("New name:", name)
  );
}

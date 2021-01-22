import { Message } from "discord.js";
import { TeamArgs } from ".";
import getTeamStats from "../bundles/team_stats";
import { listTeams } from "../db/teams";
import { errorEmbed, infoEmbed } from "../util/embeds";

export default async function stats(
  msg: Message,
  args: TeamArgs
): Promise<void> {
  let teams;
  await msg.react("👍");
  if (args.splitCommand[2]) {
    const specifiedTag = args.splitCommandLower[2].toUpperCase();
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
  const teamData = await getTeamStats(teams);
  msg.channel.send(
    infoEmbed()
      .setTitle(`Collective Stats for \`[${teams[0].tag}] ${teams[0].name}\``)
      .setDescription(
        `All of the collective stats for \`[${teams[0].tag}] ${teams[0].name}\` will be placed here.`
      )
      .addFields(
        { name: `Total Games:`, value: `\`${teamData.games}\``, inline: true },
        { name: `Total Stars:`, value: `\`${teamData.stars}\``, inline: true },
        { name: `Team Rating:`, value: `\`${teamData.rating}\``, inline: true },
        {
          name: `Total Final Kills:`,
          value: `\`${teamData.finals}\``,
          inline: true,
        },
        {
          name: `Total Final Deaths:`,
          value: `\`${teamData.fDeaths}\``,
          inline: true,
        },
        {
          name: `Average Final Kill/Death Ratio:`,
          value: `\`${teamData.fkdr}\``,
          inline: true,
        },
        {
          name: `Total Beds Broken:`,
          value: `\`${teamData.beds}\``,
          inline: true,
        },
        {
          name: `Total Beds Lost:`,
          value: `\`${teamData.bLost}\``,
          inline: true,
        },
        {
          name: `Average Beds Broken/Lost Ratio:`,
          value: `\`${teamData.bblr}\``,
          inline: true,
        },
        { name: `Total Wins:`, value: `\`${teamData.wins}\``, inline: true },
        {
          name: `Total Losses:`,
          value: `\`${teamData.losses}\``,
          inline: true,
        },
        {
          name: `Average Win/Loss Ratio:`,
          value: `\`${teamData.wlr}\``,
          inline: true,
        }
      )
  );
  msg.reactions.removeAll();
}

import { Message } from "discord.js";
import { TeamArgs } from "..";
import getTeamBedwarsStats from "../../bundles/team_stats";
import { DBTeam } from "../../db/teams";

import { infoEmbed } from "../../util/embeds";
export default async function bw(
  msg: Message,
  args: TeamArgs,
  teams: DBTeam[]
): Promise<void> {
  await msg.react("👍");
  const teamData = await getTeamBedwarsStats(teams);
  msg.channel.send(
    infoEmbed()
      .setTitle(`Collective Stats for \`[${teams[0].tag}] ${teams[0].name}\``)
      .setDescription(
        `All of the collective bedwars stats for \`[${teams[0].tag}] ${teams[0].name}\` will be placed here.`
      )
      .addFields(
        {
          name: `Total Games:`,
          value: `\`${teamData.games}\``,
          inline: true,
        },
        {
          name: `Total Stars:`,
          value: `\`${teamData.stars}\``,
          inline: true,
        },
        {
          name: `Team Rating:`,
          value: `\`${teamData.rating}\``,
          inline: true,
        },
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

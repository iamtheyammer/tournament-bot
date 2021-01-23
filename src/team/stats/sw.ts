import { Message } from "discord.js";
import { TeamArgs } from "..";
import { getTeamSkywarsStats } from "../../bundles/team_stats";
import { DBTeam } from "../../db/teams";

import { infoEmbed } from "../../util/embeds";
export default async function sw(
  msg: Message,
  args: TeamArgs,
  teams: DBTeam[]
): Promise<void> {
  await msg.react("👍");
  const teamData = await getTeamSkywarsStats(teams);
  msg.channel.send(
    infoEmbed()
      .setTitle(`Collective Stats for \`[${teams[0].tag}] ${teams[0].name}\``)
      .setDescription(
        `All of the collective stats for \`[${teams[0].tag}] ${teams[0].name}\` will be placed here.`
      )
      .addFields(
        {
          name: `Total Games:`,
          value: `\`${teamData.games}\``,
          inline: true,
        },
        {
          name: `Total Level:`,
          value: `\`${teamData.level}\``,
          inline: true,
        },
        {
          name: `Team Rating:`,
          value: `\`${teamData.rating}\``,
          inline: true,
        },
        {
          name: `Total Kills:`,
          value: `\`${teamData.kills}\``,
          inline: true,
        },
        {
          name: `Total Deaths:`,
          value: `\`${teamData.deaths}\``,
          inline: true,
        },
        {
          name: `Average Kill/Death Ratio:`,
          value: `\`${teamData.kdr}\``,
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

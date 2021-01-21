import { Message } from "discord.js";
import { TeamArgs } from ".";
import { fetchBedwarsData } from "../apis";
import { listTeams } from "../db/teams";
import { listTeamMemberships } from "../db/team_memberships";
import { listUsers } from "../db/users";
import { errorEmbed, infoEmbed } from "../util/embeds";

interface stats {
  finals: number;
  beds: number;
  wins: number;
  games: number;
  fDeaths: number;
  bLost: number;
  losses: number;
  fkdr: number;
  bblr: number;
  wlr: number;
  winPercent: number;
  rating: number;
  stars: number;
}

export function calculateRating(stats: stats): number {
  let fkdrPts: number = -1 * (1000 / (stats.fkdr + 10)) + 2 * stats.fkdr + 100;
  const starPts: number = Math.pow(stats.stars, 0.65);
  let wlrPts: number = Math.pow(stats.wlr, 1.5) * 10;
  let bblrPts: number = Math.pow(stats.bblr, 1.5) * 10;
  const finalPts: number = stats.finals / 120;
  const bedPts: number = stats.beds / 60;
  const winPts: number = stats.wins / 30;
  if (stats.fkdr > 10) {
    fkdrPts = 0.1 * Math.pow(stats.fkdr, 2) + 2.5 * stats.fkdr + 35;
  }
  if (stats.wlr > 10) {
    wlrPts = 45 * stats.wlr - 134;
  }
  if (stats.bblr > 10) {
    bblrPts = 45 * stats.bblr - 134;
  }
  const score =
    fkdrPts + starPts + wlrPts + bblrPts + finalPts + bedPts + winPts;
  return score * 10;
}

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
  const members = await listTeamMemberships({ team_id: teams[0].id });
  const memberIds = members.map((item) => item.user_id);
  const uuids = [];
  for (let i = 0; i < memberIds.length; i++) {
    const uuid = await listUsers({ discord_id: memberIds[i] });
    uuids.push(uuid[0].minecraft_uuid);
  }
  const stats = [];
  for (let i = 0; i < uuids.length; i++) {
    const player = await fetchBedwarsData(uuids[i]);
    stats.push(player);
  }
  const initTeamData = {
    finals: 0,
    beds: 0,
    wins: 0,
    games: 0,
    fDeaths: 0,
    bLost: 0,
    losses: 0,
    fkdr: 0,
    bblr: 0,
    wlr: 0,
    winPercent: 0,
    rating: 0,
    stars: 0,
  };
  const teamData = stats.reduce((acc, cur) => {
    acc.finals += cur.finals;
    acc.beds += cur.beds;
    acc.wins += cur.wins;
    acc.games += cur.games;
    acc.fDeaths += cur.fDeaths;
    acc.bLost += cur.bLost;
    acc.losses += cur.losses;
    acc.fkdr += cur.fkdr;
    acc.bblr += cur.bblr;
    acc.wlr += cur.wlr;
    acc.stars += cur.stars;

    return acc;
  }, initTeamData);

  teamData.fkdr /= stats.length;
  teamData.bblr /= stats.length;
  teamData.wlr /= stats.length;
  teamData.winPercent = (teamData.wlr * 100) / (teamData.wlr + 1);
  teamData.rating = calculateRating(teamData);
  Object.keys(teamData).map(function (key) {
    if (!(teamData[key] === Math.round(teamData[key]))) {
      teamData[key] = parseFloat(teamData[key].toFixed(2));
    }
  });
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

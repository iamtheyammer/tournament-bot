import {
  SkywarsStatsResponse,
  fetchBedwarsData,
  BedwarsStatsResponse,
  fetchSkywarsData,
} from "../apis";
import { DBTeam } from "../db/teams";
import { listTeamMemberships } from "../db/team_memberships";
import { listUsers } from "../db/users";

const xpPerPrestige = 487000;

export function calculateBedwarsStars(exp: number): number {
  const prestiges = Math.floor(exp / xpPerPrestige);
  let remainder = exp % xpPerPrestige;

  let numStars = prestiges * 100;

  if (remainder >= 500) {
    remainder = remainder - 500;
    numStars++;
  }

  if (remainder >= 1000) {
    remainder = remainder - 1000;
    numStars++;
  }

  if (remainder >= 2000) {
    remainder = remainder - 2000;
    numStars++;
  }

  if (remainder >= 3500) {
    remainder = remainder - 3500;
    numStars++;
  }

  if (remainder >= 5000) {
    numStars = numStars + Math.floor(remainder / 5000);
  }
  return numStars;
}

export function calculateSkywarsLevel(exp: number): number {
  const levels = [
    0,
    20,
    70,
    150,
    250,
    500,
    1000,
    2000,
    3500,
    6000,
    10000,
    15000,
  ];

  if (exp >= 15000) {
    return (exp - 15000) / 10000 + 12;
  } else {
    for (let i = 0; i < levels.length; i++) {
      if (exp < levels[i]) {
        return i + (exp - levels[i - 1]) / (levels[i] - levels[i - 1]);
      }
    }
  }
}

interface BedwarsStats {
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

interface SkywarsStats {
  kills: number;
  deaths: number;
  kdr: number;
  wins: number;
  losses: number;
  wlr: number;
  games: number;
  level: number;
  rating: number;
}

export function calculateBedwarsRating(stats: BedwarsStatsResponse): number {
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

export function calculateSkywarsRating(stats: SkywarsStatsResponse): number {
  const kdrPts: number = 32 * Math.pow(stats.kdr, 1.8);
  const levelPts: number = Math.pow(stats.level, 1.5);
  const wlrPts: number = Math.pow(15, stats.wlr * 3 + 0.5) - 1;
  const killPts: number = stats.kills / 300;
  const winPts: number = stats.wins / 60;
  const score = kdrPts + levelPts + wlrPts + killPts + winPts;
  return score * 10;
}

export default async function getTeamBedwarsStats(
  teams: DBTeam[]
): Promise<BedwarsStats> {
  const members = await listTeamMemberships({ team_id: teams[0].id });
  const memberIds = members.map((item) => item.user_id);
  const uuids = await listUsers({ discord_id: memberIds });
  const initStats = await Promise.all(
    uuids.map((u) => fetchBedwarsData(u.minecraft_uuid))
  );
  const stats: BedwarsStatsResponse[] = initStats.map((stats) => {
    Object.values(stats).map((value) => {
      if (isNaN(value)) {
        value = 0;
      }
    });
    return stats;
  });
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
  teamData.rating = calculateBedwarsRating(teamData);
  Object.keys(teamData).map(function (key) {
    if (teamData[key] !== Math.round(teamData[key])) {
      teamData[key] = parseFloat(teamData[key].toFixed(2));
    }
  });
  return teamData;
}

export async function getTeamSkywarsStats(
  teams: DBTeam[]
): Promise<SkywarsStats> {
  const members = await listTeamMemberships({ team_id: teams[0].id });
  const memberIds = members.map((item) => item.user_id);
  const uuids = await listUsers({ discord_id: memberIds });
  const initStats = await Promise.all(
    uuids.map((u) => fetchSkywarsData(u.minecraft_uuid))
  );
  const stats: SkywarsStatsResponse[] = initStats.map((stats) => {
    Object.values(stats).map((value) => {
      if (isNaN(value)) {
        value = 0;
      }
    });
    return stats;
  });
  const initTeamData = {
    kills: 0,
    deaths: 0,
    kdr: 0,
    wins: 0,
    losses: 0,
    wlr: 0,
    games: 0,
    level: 0,
    rating: 0,
  };
  const teamData = stats.reduce((acc, cur) => {
    acc.kills += cur.kills;
    acc.deaths += cur.deaths;
    acc.kdr += cur.kdr;
    acc.wins += cur.wins;
    acc.losses += cur.losses;
    acc.wlr += cur.wlr;
    acc.games += cur.games;
    acc.level += cur.level;
    return acc;
  }, initTeamData);

  teamData.kdr /= stats.length;
  teamData.wlr /= stats.length;
  teamData.rating = calculateSkywarsRating(teamData);
  Object.keys(teamData).map(function (key) {
    if (teamData[key] !== Math.round(teamData[key])) {
      teamData[key] = parseFloat(teamData[key].toFixed(2));
    }
  });
  return teamData;
}

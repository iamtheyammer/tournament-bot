import axios, { AxiosResponse } from "axios";
import {
  calculateBedwarsStars,
  calculateSkywarsLevel,
} from "./bundles/team_stats";
import { hypixelApiKey } from "./index";

interface HypixelPlayerResponse {
  displayname: string;
  uuid: string;
  socialMedia?: {
    links: {
      DISCORD?: string;
    };
  };
}

export interface BedwarsStatsResponse {
  error?: string;
  username?: string;
  playerUuid?: string;
  fkdr?: number;
  stars?: number;
  finals?: number;
  beds?: number;
  wins?: number;
  games?: number;
  fDeaths?: number;
  bLost?: number;
  losses?: number;
  wlr?: number;
  bblr?: number;
}

export interface SkywarsStatsResponse {
  error?: string;
  username?: string;
  playerUuid?: string;
  kills?: number;
  deaths?: number;
  kdr?: number;
  wins?: number;
  losses?: number;
  wlr?: number;
  games?: number;
  level?: number;
}

export async function fetchPlayerData(
  username: string
): Promise<HypixelPlayerResponse | null> {
  const resp = await axios({
    url: "https://api.hypixel.net/player",
    params: {
      name: username,
      key: hypixelApiKey,
    },
    method: "GET",
  });
  return resp.data.player as HypixelPlayerResponse;
}
export async function fetchBedwarsData(
  uuid: string
): Promise<BedwarsStatsResponse | null> {
  let resp: AxiosResponse;
  try {
    resp = await axios({
      url: "https://api.hypixel.net/player",
      params: {
        uuid: uuid,
        key: hypixelApiKey,
      },
      method: "GET",
    });
  } catch (e) {
    return {
      error: e,
    };
  }
  const stats = resp.data.player;
  const bedwars = stats.stats.Bedwars;
  if (!bedwars) {
    return {
      username: stats.displayname,
      playerUuid: stats.uuid,
      fkdr: 0,
      stars: 0,
      finals: 0,
      wins: 0,
      beds: 0,
      games: 0,
      fDeaths: 0,
      bLost: 0,
      losses: 0,
      wlr: 0,
      bblr: 0,
    };
  }
  if (!bedwars.final_kills_bedwars) {
    bedwars.final_kills_bedwars = 0;
  }
  if (!bedwars.wins_bedwars) {
    bedwars.wins_bedwars = 0;
  }
  if (!bedwars.beds_broken_bedwars) {
    bedwars.beds_broken_bedwars = 0;
  }
  if (!bedwars.final_deaths_bedwars) {
    bedwars.final_deaths_bedwars = 0;
  }
  if (!bedwars.losses_bedwars) {
    bedwars.losses_bedwars = 0;
  }
  if (!bedwars.beds_lost_bedwars) {
    bedwars.beds_lost_bedwars = 0;
  }
  let fkdr = bedwars.final_kills_bedwars / bedwars.final_deaths_bedwars;
  let wlr = bedwars.wins_bedwars / bedwars.losses_bedwars;
  let bblr = bedwars.beds_broken_bedwars / bedwars.beds_lost_bedwars;
  if (isNaN(fkdr)) {
    if (!bedwars.final_deaths_bedwars) {
      fkdr = bedwars.final_kills_bedwars;
    } else {
      fkdr = 0;
    }
  }
  if (isNaN(wlr)) {
    if (!bedwars.losses_bedwars) {
      wlr = bedwars.wins_bedwars;
    } else {
      wlr = 0;
    }
  }
  if (isNaN(bblr)) {
    if (!bedwars.beds_lost_bedwars) {
      bblr = bedwars.beds_broken_bedwars;
    } else {
      bblr = 0;
    }
  }
  return {
    username: stats.displayname,
    playerUuid: stats.uuid,
    fkdr,
    stars: calculateBedwarsStars(bedwars.Experience),
    finals: bedwars.final_kills_bedwars,
    wins: bedwars.wins_bedwars,
    beds: bedwars.beds_broken_bedwars,
    games: bedwars.wins_bedwars + bedwars.losses_bedwars,
    fDeaths: bedwars.final_deaths_bedwars,
    bLost: bedwars.beds_lost_bedwars,
    losses: bedwars.losses_bedwars,
    wlr,
    bblr,
  };
}

export async function fetchSkywarsData(
  uuid: string
): Promise<SkywarsStatsResponse | null> {
  let resp: AxiosResponse;
  try {
    resp = await axios({
      url: "https://api.hypixel.net/player",
      params: {
        uuid: uuid,
        key: hypixelApiKey,
      },
      method: "GET",
    });
  } catch (e) {
    return {
      error: e,
    };
  }
  const stats = resp.data.player;
  const skywars = stats.stats.SkyWars;

  let kdr = skywars.kills / skywars.deaths;
  let wlr = skywars.wins / skywars.losses;
  if (isNaN(kdr)) {
    if (!skywars.deaths) {
      kdr = skywars.final_kills_bedwars;
    } else {
      kdr = 0;
    }
  }
  if (isNaN(wlr)) {
    if (!skywars.losses) {
      wlr = skywars.wins;
    } else {
      wlr = 0;
    }
  }
  return {
    username: stats.displayname,
    playerUuid: stats.uuid,
    kills: skywars.kills,
    deaths: skywars.deaths,
    kdr,
    wins: skywars.wins,
    losses: skywars.losses,
    wlr,
    games: skywars.games,
    level: calculateSkywarsLevel(skywars.skywars_experience),
  };
}

interface MojangUserProfile {
  id: string;
  name: string;
  properties: {
    name: string;
    value: string;
  }[];
}

interface MojangUuidProfile {
  name: string;
  id: string;
}

interface MojangUserProfileError {
  error: string;
  path: string;
}

export async function fetchMojangUserProfile(
  uuid: string
): Promise<MojangUserProfile> {
  const req = await axios({
    method: "get",
    url: `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`,
  });

  if (req.data.error) {
    throw req.data as MojangUserProfileError;
  }

  return req.data as MojangUserProfile;
}

export async function fetchMojangUuidProfile(
  username: string
): Promise<MojangUuidProfile> {
  const req = await axios({
    method: "get",
    url: `https://api.mojang.com/users/profiles/minecraft/${username}`,
  });

  if (req.data.error) {
    throw req.data as MojangUserProfileError;
  }

  return req.data as MojangUuidProfile;
}

import axios, { AxiosResponse } from "axios";
import { hypixelApiKey } from "./index";

const xpPerPrestige = 487000;

interface HypixelPlayerResponse {
  displayname: string;
  uuid: string;
  socialMedia?: {
    links: {
      DISCORD?: string;
    };
  };
}

interface PlayerStatsResponse {
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
  winstreak?: number;
}

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
): Promise<PlayerStatsResponse | null> {
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
  if (!stats) {
    return {
      error: "Invalid username.",
    };
  }

  const bedwars = stats.stats.Bedwars;
  let fkdr = bedwars.final_kills_bedwars / bedwars.final_deaths_bedwars;
  let wlr = bedwars.wins_bedwars / bedwars.losses_bedwars;
  let bblr = bedwars.beds_broken_bedwars / bedwars.beds_lost_bedwars;
  const winstreak = bedwars.winstreak;
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
    winstreak,
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

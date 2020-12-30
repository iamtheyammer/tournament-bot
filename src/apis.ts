import axios from "axios";
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

export async function fetchPlayerData(
  username: string
): Promise<HypixelPlayerResponse | null> {
  const resp = await axios({
    url: "player",
    params: {
      name: username,
      key: hypixelApiKey,
    },
    method: "GET",
    baseURL: "https://api.hypixel.net/",
  });

  return resp.data.player as HypixelPlayerResponse;
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

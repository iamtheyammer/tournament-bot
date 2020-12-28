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

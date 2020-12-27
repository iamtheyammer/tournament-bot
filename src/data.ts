import axios, { AxiosResponse } from "axios";
import { hypixelApiKey } from "./index";
export async function fetchPlayerData(
  username: string
): Promise<AxiosResponse> {
  return axios({
    url: "player",
    params: {
      name: username,
      key: hypixelApiKey,
    },
    method: "GET",
    baseURL: "https://api.hypixel.net/",
  });
}

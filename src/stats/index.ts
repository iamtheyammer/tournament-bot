import { Message } from "discord.js";
import { Args } from "..";
import bw from "./bw";
import sw from "./sw";

export default async function statsHandler(
  msg: Message,
  args: Args
): Promise<void> {
  switch (args.splitCommandLower[1]) {
    case "bw": {
      await bw(msg, args);
      break;
    }
    case "sw": {
      await sw(msg, args);
      break;
    }
  }
}

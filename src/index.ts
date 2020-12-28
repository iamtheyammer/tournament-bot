import * as Discord from "discord.js";
import ignHandler from "./ign";
const client = new Discord.Client();
const token = process.env.DISCORD_TOKEN;

export const hypixelApiKey = process.env.HYPIXEL_API_KEY;
export const prefix = "!";

// Ready Message

client.on("ready", () => {
  console.log("Bot ready!");
  client.user.setActivity("over you ;)", { type: "WATCHING" });
});

export interface playerIGN {
  tag: string;
  id: string;
  ign: string;
}

export type Args = Array<string>;

export const playerIGNs: Array<playerIGN> = [];

client.on("message", async (msg) => {
  if (msg.author.bot || !msg.content.startsWith(prefix)) return;
  const args = msg.content
    .split(" ")
    .map((arg, idx) =>
      idx === 0 ? arg.slice(1).toLowerCase() : arg.toLowerCase()
    );

  switch (args[0]) {
    case "ign": {
      await ignHandler(msg, args);
      break;
    }
  }
});

client.login(token);

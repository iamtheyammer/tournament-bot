// Import statements

import * as Discord from "discord.js";
import * as embeds from "./embeds";
import { fetchPlayerData } from "./data";
const client = new Discord.Client();
const token = process.env.DISCORD_TOKEN;
export const hypixelApiKey = process.env.HYPIXEL_API_KEY;
const prefix = "!";

// Ready Message

client.on("ready", () => {
  console.log("Bot ready!");
});

// Interfaces

export interface playerIGN {
  tag: string;
  id: string;
  ign: string;
}

// Data Initialization

const playerIGNs: Array<playerIGN> = [];

// Handle IGN related commands

async function ignHandler(
  msg: Discord.Message,
  args: Array<string>
): Promise<void> {
  switch (args[1]) {
    case "link": {
      const resp = await fetchPlayerData(args[2]);
      const discordName: string = resp.data.player.socialMedia.links.DISCORD;
      if (discordName === msg.author.tag) {
        msg.channel.send(embeds.linkSuccess(args[2], msg.author.id));
        const index = playerIGNs.findIndex(
          (data) => data.tag === msg.author.tag
        );
        if (index !== -1) {
          playerIGNs.splice(index, 1);
        }
        playerIGNs.push({
          tag: msg.author.tag,
          id: msg.author.id,
          ign: args[2],
        });
      } else {
        msg.channel.send(embeds.linkFailed(args[2], msg.author.id));
      }
      break;
    }
    case "list": {
      msg.channel.send(embeds.ignList(playerIGNs));
    }
  }
}

// Main Function

client.on("message", (msg) => {
  if (msg.author.bot) return;
  const args = msg.content.split(" ");
  const subcommand = args[0].split("");
  if (subcommand[0] === prefix) {
    subcommand.shift();
    const initcmd: string = subcommand.join("");
    switch (initcmd) {
      case "ign": {
        ignHandler(msg, args);
      }
    }
  }
});
client.login(token);

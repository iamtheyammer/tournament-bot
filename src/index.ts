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
      if (!args[2]) {
        msg.channel.send(embeds.linkArgumentMissing(prefix));
        return;
      }
      const resp = await fetchPlayerData(args[2]);
      if (!resp.data.player) {
        msg.channel.send(embeds.linkWrongUser(args[2], msg.author.id));
        return;
      }
      try {
        if (!resp.data.player.socialMedia.links.DISCORD) {
          msg.channel.send(embeds.linkBadUser(args[2], msg.author.id));
          return;
        }
      } catch {
        msg.channel.send(embeds.linkBadUser(args[2], msg.author.id));
        return;
      }
      const discordName: string = resp.data.player.socialMedia.links.DISCORD;
      const ign: string = resp.data.player.displayname;
      if (discordName === msg.author.tag) {
        msg.channel.send(embeds.linkSuccess(ign, msg.author.id));
        const index = playerIGNs.findIndex(
          (data) => data.tag === msg.author.tag
        );
        if (index !== -1) {
          playerIGNs.splice(index, 1);
        }
        playerIGNs.push({
          tag: msg.author.tag.toLowerCase(),
          id: msg.author.id,
          ign: ign,
        });
      } else {
        msg.channel.send(embeds.linkFailed(ign, msg.author.id));
      }
      break;
    }
    case "list": {
      msg.channel.send(embeds.ignList(playerIGNs));
      break;
    }
    case "get": {
      if (!args[2]) {
        msg.channel.send(embeds.getArgumentMissing(prefix));
        return;
      }
      let idtemp: Array<string>;
      let id: string;
      if (args[2].startsWith("<")) {
        idtemp = args[2].split("").slice(3, args[2].split("").length);
        idtemp.pop();
        id = idtemp.join("");
      } else {
        const tagIndex = playerIGNs.findIndex((data) => data.tag === args[2]);
        console.log(tagIndex);
        if (tagIndex === -1) {
          msg.channel.send(embeds.getIGNFailed(true, id, args[2]));
          return;
        }
        id = playerIGNs[tagIndex].id;
      }
      const index = playerIGNs.findIndex((data) => data.id === id);
      if (index !== -1) {
        msg.channel.send(embeds.getIGNSuccess(playerIGNs[index].ign, id));
      } else {
        msg.channel.send(embeds.getIGNFailed(false, id));
      }
      break;
    }
    case "delink": {
      const index = playerIGNs.findIndex((data) => data.id === msg.author.id);
      if (index === -1) {
        msg.channel.send(embeds.delinkFailed(msg.author.id));
      } else {
        msg.channel.send(
          embeds.delinkSuccess(msg.author.id, playerIGNs[index].ign)
        );
        playerIGNs.splice(index, 1);
      }
      break;
    }
    default: {
      msg.channel.send(embeds.ignInfo(prefix));
    }
  }
}

// Main Function

client.on("message", (msg) => {
  if (msg.author.bot) return;
  const args = msg.content.split(" ").map((argument) => argument.toLowerCase());
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

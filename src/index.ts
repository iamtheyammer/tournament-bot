import * as Discord from "discord.js";
import * as embeds from "./embeds";
import ignHandler from "./ign";
import teamHandler from "./team";
const client = new Discord.Client();
const token = process.env.DISCORD_TOKEN;
export const teamCreating: Array<team> = [];
export const teams: Array<fullTeam> = [];

export const hypixelApiKey = process.env.HYPIXEL_API_KEY;
export const prefix = "!";

// Ready Message

client.on("ready", () => {
  console.log("Bot ready!");
  client.user.setActivity("too much bedwars", { type: "PLAYING" });
});

export interface playerIGN {
  tag: string;
  id: string;
  ign: string;
}

export type Args = Array<string>;
export interface fullTeam {
  tag: string;
  name: string;
  description: string;
  leader: string;
  members: Array<string>;
}

export interface team {
  tag: string;
  name: string;
  leader: string;
  members: Array<string>;
}

// Data Initialization

export const playerIGNs: Array<playerIGN> = [];

client.on("message", async (msg) => {
  if (msg.author.bot || !msg.content.startsWith(prefix)) return;
  const args = msg.content
    .split(" ")
    .map((arg, idx) =>
      idx === 0 ? arg.slice(1).toLowerCase() : arg.toLowerCase()
    );
  const argsCapital = msg.content.split(" ");
  switch (args[0]) {
    case "ign": {
      await ignHandler(msg, args);
      break;
    }
    case "team": {
      if (playerIGNs.findIndex((data) => data.id === msg.author.id) === -1) {
        msg.channel.send(embeds.noIGNLinked(prefix));
        return;
      }
      teamHandler(msg, args, argsCapital);
      break;
    }
  }
});

client.login(token);

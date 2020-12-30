import * as Discord from "discord.js";
import * as chalk from "chalk";
import ignHandler from "./ign";
import teamHandler from "./team";
import { setupDatabase } from "./db/setup";
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
  invites: Array<string>;
}

export interface team {
  tag: string;
  name: string;
  leader: string;
  members: Array<string>;
}

// Data Initialization

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
        msg.channel.send(noIGNLinked(prefix));
        return;
      }
      teamHandler(msg, args, argsCapital);
      break;
    }
  }
});

async function init() {
  console.log(chalk.bold.white("Starting Tournament Bot"));
  try {
    console.log(chalk.white("Checking and configuring database..."));
    const tableStatuses = await setupDatabase();
    Object.entries(tableStatuses).forEach((ts) =>
      console.log(chalk.gray(`    ${ts.join(": ")}`))
    );
  } catch (e) {
    console.error(chalk.red("Error configuring database!"), e);
    process.exit(2);
  }
  await client.login(token);
}

init();

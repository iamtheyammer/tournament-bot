import * as Discord from "discord.js";
import * as chalk from "chalk";
import { splitargs } from "./util/splitargs";
import ignHandler from "./ign";
import teamHandler from "./team";
import { setupDatabase } from "./db/setup";
import { DBUser, listUsers } from "./db/users";
const client = new Discord.Client();
const token = process.env.DISCORD_TOKEN;

export const hypixelApiKey = process.env.HYPIXEL_API_KEY;
export const prefix = "!";

// Ready Message

client.on("ready", () => {
  console.log("Bot ready!");
  client.user.setActivity("too much bedwars", { type: "PLAYING" });
});

export type Args = {
  splitCommand: string[];
  splitCommandLower: string[];
  user?: DBUser[];
};

/*
const currentTournaments = await listTournaments({ meta: { active_only: true }});
const currentTournament = currentTournaments[0];

// set it so that if we create a new tournament, this updates
// i'd also add a "update current tournament" command
*/

client.on("message", async (msg) => {
  if (msg.author.bot || !msg.content.startsWith(prefix)) return;
  const splitCommand = splitargs(msg.content).map((a, idx) =>
    idx === 0 ? a.slice(1) : a
  );
  const splitCommandLower = splitCommand.map((c) => c.toLowerCase());

  const user = await listUsers({ discord_id: msg.author.id });

  const args: Args = {
    splitCommand,
    splitCommandLower,
    user,
  };

  switch (args.splitCommandLower[0]) {
    case "ign": {
      await ignHandler(msg, args);
      break;
    }
    case "team": {
      await teamHandler(msg, args);
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

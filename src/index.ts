import * as Discord from "discord.js";
import * as chalk from "chalk";
import ignHandler from "./ign";
import { setupDatabase } from "./db/setup";
const client = new Discord.Client();
const token = process.env.DISCORD_TOKEN;

export const hypixelApiKey = process.env.HYPIXEL_API_KEY;
export const prefix = "!";

export type Args = Array<string>;

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

client.on("ready", () => {
  console.log(chalk.green("Bot running successfully!"));
  client.user.setActivity("over you ;)", { type: "WATCHING" });
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

import * as Discord from "discord.js";
import * as chalk from "chalk";
// commonjs only
// eslint-disable-next-line @typescript-eslint/no-var-requires
const splitargs = require("splitargs");
import ignHandler from "./ign";
import teamHandler from "./team";
import { setupDatabase } from "./db/setup";
import { DBUser, listUsers } from "./db/users";
import { errorEmbed } from "./util/embeds";
import tournamentHandler from "./tournament";
import invitesHandler from "./invites";
import statsHandler from "./stats";
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
  user?: DBUser;
  memberIsAdmin: boolean;
};

/*
const currentTournaments = await listTournaments({ meta: { active_only: true }});
const currentTournament = currentTournaments[0];

// set it so that if we create a new tournament, this updates
// i'd also add a "update current tournament" command
*/

client.on("message", async (msg) => {
  if (msg.author.bot || !msg.content.startsWith(prefix) || !msg.guild) return;
  const splitCommand = splitargs(msg.content).map((a, idx) =>
    idx === 0 ? a.slice(1) : a
  );
  const splitCommandLower = splitCommand.map((c) => c.toLowerCase());

  const users = await listUsers({ discord_id: msg.author.id });

  const args: Args = {
    splitCommand,
    splitCommandLower,
    user: users.length && users[0],
    memberIsAdmin: false,
  };

  if (msg.member.roles.cache.some((r) => r.name === "Tournament Bot Admin")) {
    args.memberIsAdmin = true;
  }

  try {
    switch (args.splitCommandLower[0]) {
      case "ign": {
        await ignHandler(msg, args);
        break;
      }
      case "team": {
        await teamHandler(msg, args);
        break;
      }
      case "tournament": {
        await tournamentHandler(msg, args);
        break;
      }
      case "invites": {
        await invitesHandler(msg, args);
        break;
      }
      case "stats": {
        await statsHandler(msg, args);
        break;
      }
    }
  } catch (e) {
    console.error("Unexpected error:", e);
    await msg.channel.send(
      errorEmbed()
        .setTitle("Unexpected Error")
        .setDescription(
          "We're sorry, an unexpected error occured in the processing of your command. Please follow up with admins!"
        )
    );
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

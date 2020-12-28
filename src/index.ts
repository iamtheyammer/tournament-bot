import * as Discord from "discord.js";
import ignHandler from "./ign";
const client = new Discord.Client();
const token = process.env.DISCORD_TOKEN;

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
}
// Handle Team Commands

async function teamHandler(
  msg: Discord.Message,
  args: Array<string>,
  argsCapital: Array<string>
): Promise<void> {
  console.log(teams);
  const index = teamCreating.findIndex((arg: { leader: string; }) => arg.leader === msg.author.id);
  if (index !== -1) {
    switch (args[1]) {
      case "confirm": {
        msg.channel.send(
          embeds.teamCreationConfirmed(
            teamCreating[index].tag,
            teamCreating[index].name,
            teamCreating[index].leader
          )
        );
        teams.push({
          tag: teamCreating[index].tag,
          name: teamCreating[index].name,
          description: "None",
          leader: teamCreating[index].leader,
          members: [teamCreating[index].leader],
        });
        teamCreating.splice(
          teamCreating.findIndex((arg: { leader: string; }) => arg.leader === msg.author.id),
          1
        );
        break;
      }
      case "deny": {
        msg.channel.send(
          embeds.teamCreationDenied(
            teamCreating[index].tag,
            teamCreating[index].name
          )
        );
        teamCreating.splice(
          teamCreating.findIndex((arg) => arg.leader === msg.author.id),
          1
        );
        break;
      }
    }
  } else {
    switch (args[1]) {
      case "create": {
        const teamData: Array<string> = argsCapital;
        for (let i = 0; i < 2; i++) {
          teamData.shift();
        }
        const teamTag = teamData[0].toUpperCase();
        const teamTest = teamTag.split("");
        for (let i = 0; i < teamTest.length; i++) {
          if (!alphanum.includes(teamTest[i].toLowerCase())) {
            console.log(teamTest);
            msg.channel.send("not alphanumeric");
            return;
          }
        }
        teamData.shift();
        const teamName = teamData.join(" ");
        if (
          teams.findIndex((arg) => arg.members.includes(msg.author.id)) !== -1
        ) {
          msg.channel.send(embeds.alreadyInTeam(teamTag, teamName));
          return;
        }
        if (teams.findIndex((arg) => arg.tag === teamTag) !== -1) {
          msg.channel.send(embeds.tagAlreadyExists(teamTag, teamName));
          return;
        }
        msg.channel.send(embeds.teamCreationConfirm(teamTag, teamName, prefix));
        teamCreating.push({
          tag: teamTag,
          name: teamName,
          leader: msg.author.id,
          members: [msg.author.id],
        });
        setTimeout(() => {
          teamCreating.splice(
            teamCreating.findIndex((arg) => arg.leader === msg.author.id),
            1
          );
        }, 30000);
      }
    }
  }
}
// Main Function

client.on("message", (msg) => {
  if (msg.author.bot) return;
  const args = msg.content.split(" ").map((argument) => argument.toLowerCase());
  const argsCapital = msg.content.split(" ");
  const subcommand = args[0].split("");
  if (subcommand[0] === prefix) {
    subcommand.shift();
    const initcmd: string = subcommand.join("");
    switch (initcmd) {
      case "ign": {
        ignHandler(msg, args);
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
  }
});

client.login(token);

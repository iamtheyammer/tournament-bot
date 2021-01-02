# d.craft Tournament Bot v0.1

## Introduction

This bot is meant to support d.craft in creating, managing, and hosting tournaments, while providing QOL changes to make the tournament process much more efficient and smooth. The bot is run on discord.js, and all of the adequate code can be found in the `src` folder.

## List of Commands

### IGN Commands

These commands are meant to assist users in linking their discord profiles to Hypixel, using Hypixel's built in social media API.

`!ign link <username>`: Attempts to link the sender of the command to the username given in the command. The command succeeds if the user's discord tag matches the one they have put on Hypixel.

`!ign get <mention | tag>`: Attempts to grab the IGN of the person either mentioned or put in tag form. Only succeeds if

- The person mentioned actually exists
- If they have linked their discord.

`!ign unlink`: Attempts to unlink the sender of the command to any IGN they may have linked before. Only succeeds if the sender already has a linked IGN.

`!ign list`: Lists all discord users that have linked their IGN to their discord.

## Modules Used

| Module     | npm Link                                         | Version | Purpose                                                                 |
| ---------- | ------------------------------------------------ | ------- | ----------------------------------------------------------------------- |
| Discord.js | [Link](https://www.npmjs.com/package/discord.js) | v12.5.1 | Connect to Discord and send messages, get data from Discord users, etc. |
| Axios      | [Link](https://www.npmjs.com/package/axios)      | v0.21.1 | Generate API requests and get information from Hypixel                  |

## Goals/ideas to implement

### Teams Subcommands

These commands should allow display, creation, modification and deletion of tournament teams. Players can create teams and invite other users to their team. A full list of teams should be able to be displayed if queried for.

| Command        | Purpose                                                                                                             | Syntax                                                               | Completed?        |
| -------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------- |
| !team create   | Allows you to create a team                                                                                         | !team create <tag> <team name in quotations> <description in quotes> | lmfao no          |
| !team info     | Allows you to get information about a team using its tag, or get info about your own team by not providing a tag    | !team info <tag>                                                     | what do you think |
| !team invite   | Allows you to invite a player to your team                                                                          | !team invite <mention>                                               | surprisingly yes  |
| !team join     | Allows you to accept an invite and join a team                                                                      | !team join <tag>                                                     | surprisingly yes  |
| !team leave    | Allows you to leave a team (disbands the team if you're the leader)                                                 | !team leave                                                          | not even started  |
| !team transfer | Allows you to transfer leadership to another player                                                                 | !team transfer <mention>                                             | not even started  |
| !team config   | Allows you to set information about your team and modify its settings, like publicity, description, name, tag, etc. | !team config <setting> <value>                                       | not even started  |
| !team kick     | Allows you to remove a player forcefully                                                                            | !team kick <mention>                                                 | not even started  |
| !team stats    | Allows you to view the collective stats of a team                                                                   | !team stats <tag>                                                    | not even started  |

### Help Subcommands

These commands will go in-depth into the bot's syntax, how to get it on your server, and other relatively important information.

| Command          | Purpose                                                 | Syntax                                                               | Completed?                       |
| ---------------- | ------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------- |
| !stats bw or !bw | Allows you to view the bedwars stats of a player a team | !team create <tag> <team name in quotations> <description in quotes> | haven't started stats subsection |

### Stats-querying Subcommands

These commands will allow you to get the bedwars/skywars/duels stats of any Hypixel player. Will likely integrate this with teams to print out both individual and collective stats.

| Command                | Purpose                                          | Syntax                 | Completed?                       |
| ---------------------- | ------------------------------------------------ | ---------------------- | -------------------------------- |
| !stats bw or !bw       | Allows you to view the bedwars stats of a player | !stats bw <mention>    | haven't started stats subsection |
| !stats sw or !sw       | Allows you to view the skywars stats of a player | !stats sw <mention>    | haven't started stats subsection |
| !stats duels or !duels | Allows you to view the duels stats of a player   | !stats duels <mention> | haven't started stats subsection |

## More coming soon!

Since neither Sam or I code at light speed, it will take some time to fully develop, bug test and release this bot. Please stay patient during development!

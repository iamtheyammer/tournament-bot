# d.craft Tournament Bot v1

## Introduction

This bot is meant to support d.craft in creating, managing, and hosting tournaments, while providing QOL changes to make the tournament process much more efficient and smooth. The bot is run on discord.js, and all of the adequate code can be found in the `src` folder.

## List of Commands

### IGN Commands

These commands are meant to assist users in linking their discord profiles to Hypixel, using Hypixel's built in social media API.

`!ign link <username>`: Attempts to link you to the username given in the command. The command succeeds if the your discord tag matches the one you have put on Hypixel.

`!ign get <@mention>`: Attempts to grab the IGN of the person either mentioned or put in tag form. Only succeeds if:

- The person mentioned actually exists
- If they have linked their discord.

`!ign unlink`: Attempts to unlink you to any IGN they may have linked before. Only succeeds if you already have a linked IGN.

`!ign list`: Lists all discord users that have linked their IGN to their discord.

### Teams Commands

These commands are meant to allow users to create, modify, and delete teams, while being as simple and efficient as possible.

`!team create <tag> "name" "description"`: Creates a team with the information given. Tags can be 1-6 letters long and alphanumeric; descriptions can be up to 255 characters long.

`!team info [tag]`: Grabs the information about a team, such as its leader, its full name with tag, and its description. If no tag is specified, the command grabs the information about the team you are currently in.

`!team invite <@mention>`: Invites a player to your team. Only works if you are the leader of the team.

`!team join <tag>`: Joins a team with the tag specified. Only works if you already have an invite to that team.

`!team kick <@mention>`: Forcibly removes a player from your team. Only works if you are the leader of the team.

`!team delete`: Deletes the team alltogether, including the roles and channel. Only works if:

- You are the leader of the team
- There are no other members in the team

`!team transfer <@mention>`: Transfers ownership of the team to the person mentioned. Only works if you are the leader of the team.

`!team edit <name | description> "value"`: Edits the team's name or description. Only works if you are the leader of the team.

`!team leave`: Leaves the team you're currently in. Only works if you are not the leader of the team.

## Modules Used

| Module     | npm Link                                         | Version  | Purpose                                                                 |
| ---------- | ------------------------------------------------ | -------- | ----------------------------------------------------------------------- |
| Discord.js | [Link](https://www.npmjs.com/package/discord.js) | v12.5.1  | Connect to Discord and send messages, get data from Discord users, etc. |
| Axios      | [Link](https://www.npmjs.com/package/axios)      | v0.21.1  | Generate API requests and get information from Hypixel                  |
| Chalk      | [Link](https://www.npmjs.com/package/chalk)      | v4.1.0   | Make colored console messages                                           |
| Knex       | [Link](https://www.npmjs.com/package/knex)       | v0.21.15 | Create and modify SQL tables                                            |
| PG         | [Link](https://www.npmjs.com/package/pg)         | v8.5.1   | Knex dependency                                                         |
| Nodemon    | [Link](https://www.npmjs.com/package/nodemon)    | v2.0.4   | Automatically restart bot whenever changes are made                     |

## Goals/ideas to implement

### Teams Subcommands

These commands should allow display, creation, modification and deletion of tournament teams. Players can create teams and invite other users to their team. A full list of teams should be able to be displayed if queried for.

| Command     | Purpose                                           | Syntax            | Completed? |
| ----------- | ------------------------------------------------- | ----------------- | ---------- |
| !team stats | Allows you to view the collective stats of a team | !team stats <tag> | started    |

### Help Subcommands

These commands will go in-depth into the bot's syntax, how to get it on your server, and other relatively important information.

| Command | Purpose                              | Syntax                    | Completed?                      |
| ------- | ------------------------------------ | ------------------------- | ------------------------------- |
| !help   | Allows you to get a list of commands | !help [subsection] <page> | haven't started help subsection |

### Stats-querying Subcommands

These commands will allow you to get the bedwars/skywars/duels stats of any Hypixel player. Will likely integrate this with teams to print out both individual and collective stats.

| Command                | Purpose                                          | Syntax                 | Completed?                       |
| ---------------------- | ------------------------------------------------ | ---------------------- | -------------------------------- |
| !stats bw or !bw       | Allows you to view the bedwars stats of a player | !stats bw <mention>    | haven't started stats subsection |
| !stats sw or !sw       | Allows you to view the skywars stats of a player | !stats sw <mention>    | haven't started stats subsection |
| !stats duels or !duels | Allows you to view the duels stats of a player   | !stats duels <mention> | haven't started stats subsection |

## More coming soon!

Since neither Sam or I code at light speed, it will take some time to fully develop, bug test and release this bot. Please stay patient during development!

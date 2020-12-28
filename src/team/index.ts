import { Message } from "discord.js";
import { teamCreating, teams, prefix } from "../index";
import * as embeds from "../embeds";
const alphanum = "abcdefghijklmnopqrstuvwxyz123456789";

export default async function teamHandler(
  msg: Message,
  args: Array<string>,
  argsCapital: Array<string>
): Promise<void> {
  const index = teamCreating.findIndex(
    (arg: { leader: string }) => arg.leader === msg.author.id
  );
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
          teamCreating.findIndex(
            (arg: { leader: string }) => arg.leader === msg.author.id
          ),
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

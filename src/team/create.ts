import { Message, MessageEmbed } from "discord.js";
import { teams, teamCreating, prefix } from "../index";
import { alphanum } from "./index";

export default async function create(
  msg: Message,
  args: Array<string>,
  argsCapital: Array<string>
): Promise<void> {
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
  if (teams.findIndex((arg) => arg.members.includes(msg.author.id)) !== -1) {
    msg.channel.send(alreadyInTeamEmbed(teamTag, teamName));
    return;
  }
  if (teams.findIndex((arg) => arg.tag === teamTag) !== -1) {
    msg.channel.send(tagAlreadyExistsEmbed(teamTag, teamName));
    return;
  }
  msg.channel.send(teamCreationConfirmEmbed(teamTag, teamName, prefix));
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

function tagAlreadyExistsEmbed(tag: string, name: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Team Creation Not Allowed")
    .setDescription(
      `You cannot create \`[${tag}] ${name}\` because another team has already taken that tag.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function teamCreationConfirmEmbed(
  tag: string,
  name: string,
  prefix: string
): MessageEmbed {
  return new MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Confirm Team Creation")
    .setDescription(
      `Are you sure these are the settings you want? Type \`${prefix}team confirm\` to accept and create a new team, or \`${prefix}team deny\` to try again. This request will timeout in 30 seconds.`
    )
    .addFields({
      name: "Full Team Name (With Tag)",
      value: `\`[${tag}] ${name}\``,
    })
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

function alreadyInTeamEmbed(tag: string, name: string): MessageEmbed {
  return new MessageEmbed()
    .setColor("#ff0000")
    .setTitle("Team Creation Not Allowed")
    .setDescription(
      `You cannot create \`[${tag}] ${name}\` because you are already in a team.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

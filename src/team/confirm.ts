import { Message, MessageEmbed } from "discord.js";
import { teams, teamCreating } from "../index";

export default async function confirm(
  msg: Message,
  index: number
): Promise<void> {
  msg.channel.send(
    teamCreationConfirmedEmbed(
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
}

function teamCreationConfirmedEmbed(
  tag: string,
  name: string,
  leader: string
): MessageEmbed {
  return new MessageEmbed()
    .setColor("#00ff00")
    .setTitle("Team Creation Successful")
    .setDescription(
      `Success! \`[${tag}] ${name}\` has been created with <@${leader}> as its leader.`
    )
    .setFooter("Made by iamtheyammer and SweetPlum | d.craft Tournament Bot");
}

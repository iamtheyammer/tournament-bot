import { Message } from "discord.js";
import { infoEmbed } from "../util/embeds";

export default async function help(msg: Message): Promise<void> {
  msg.channel.send(
    infoEmbed()
      .setTitle("Team Command Help")
      .setDescription("Here is a list of all team commands.")
      .addFields(
        {
          name: `\`!team create <TAG> "Team Name" "Description of up to 255 characters"\``,
          value: `Create a team with the adequate information.`,
        },
        {
          name: `\`!team delete\``,
          value: `Deletes the team. \`(Leader Only)\``,
        },
        {
          name: `\`!team info [TAG]\``,
          value: `Gets information about the team specified. If no team tag is mentioned, grabs the information of the team you're currently in.`,
        },
        {
          name: `\`!team invite @username [@username...]\``,
          value: `Invite the mentioned player(s) to the team. \`(Leader Only)\``,
        },
        {
          name: `\`!team join <TAG>\``,
          value: `Joins a team you've been invited to.`,
        },
        {
          name: `\`!team kick @username\``,
          value: `Kicks the mentioned user from your team. \`(Leader Only)\``,
        },
        {
          name: `\`!team leave\``,
          value: `Leave the team. \`(Non-Leader Only)\``,
        },
        {
          name: `\`!team transfer @username\``,
          value: `Transfer leadership of the team to the mentioned user. \`(Leader Only)\``,
        },
        {
          name: `\`!team edit [name|description] "value"\``,
          value: `Edits team data. \`(Leader Only)\``,
        },
        {
          name: `\`!team party [TAG]\``,
          value: `Get the party command for your team.`,
        }
      )
  );
}

import { Message } from "discord.js";
import { getTeamTextChannel, TeamArgs } from "./index";
import { errorEmbed, infoEmbed, successEmbed } from "../util/embeds";
import db from "../db";
import {
  listTeamMemberships,
  updateTeamMembership,
} from "../db/team_memberships";
import { listTeams, updateTeam } from "../db/teams";
import info from "./info";

export default async function transfer(
  msg: Message,
  args: TeamArgs
): Promise<void> {
  if (!args.teamMembership) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("No team")
        .setDescription(
          "You're not in a team! Use `!team create` or have someone invite you!"
        )
    );
    return;
  }

  if (msg.mentions.members.size !== 1) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("No @ mention")
        .setDescription(
          "You need to mention who you want to transfer the team to, like `!team transfer @NewLeader`."
        )
    );
    return;
  }

  if (msg.mentions.members.first().id === msg.author.id) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Invalid recipient")
        .setDescription("You can't transfer a team to yourself!")
    );
    return;
  }

  if (args.teamMembership.type !== "leader") {
    await msg.channel.send(
      errorEmbed()
        .setTitle("Insufficient permissions")
        .setDescription("Only leaders can transfer their team.")
    );
    return;
  }

  const transferTo = msg.mentions.users.first();

  const [[team], memberships] = await Promise.all([
    listTeams({ id: args.teamMembership.team_id }),
    listTeamMemberships({
      team_id: args.teamMembership.team_id,
      user_id: transferTo.id,
    }),
  ]);
  if (!memberships.length) {
    await msg.channel.send(
      errorEmbed()
        .setTitle("User not in team")
        .setDescription(
          `<@${transferTo.id}> is not in your team. Invite them then try transferring again.`
        )
    );
    return;
  }

  const teamTransferMessage = await msg.channel.send(
    `<@${msg.author.id}>`,
    infoEmbed().setTitle("Confirm transferring team").setDescription(
      `You're about to transfer \`[${team.tag}] ${team.name}\` to <@${transferTo.id}>. 
        This will make them the leader and you a member. 
        This means they can kick you, delete the team, and more.
        This is **not reversible** unless they transfer the team back to you.
        React with ✅ to confirm transferring the team to <@${transferTo.id}>.`
    )
  );
  await Promise.all([
    teamTransferMessage.react("❌"),
    teamTransferMessage.react("✅"),
  ]);

  let reactions;
  try {
    reactions = await teamTransferMessage.awaitReactions(
      (reaction, user) =>
        msg.author.id === user.id &&
        (reaction.emoji.name === "✅" || reaction.emoji.name === "❌"),
      {
        time: 30000,
        max: 1,
        errors: ["time"],
      }
    );
  } catch {
    msg.channel.send(
      errorEmbed()
        .setTitle("Transfer cancelled (reaction timeout)")
        .setDescription(
          `You're still the leader of \`[${team.tag}] ${team.name}\`.`
        )
    );
    return;
  }

  if (reactions.first().emoji.name === "❌") {
    msg.channel.send(
      infoEmbed()
        .setTitle("Transfer cancelled")
        .setDescription(
          `You're still the leader of \`[${team.tag}] ${team.name}\`.`
        )
    );
    return;
  }

  const trx = await db.transaction();

  try {
    await Promise.all([
      updateTeamMembership(
        {
          type: "member",
          where: { id: args.teamMembership.id },
        },
        trx
      ),
      updateTeamMembership(
        {
          type: "leader",
          where: {
            team_id: args.teamMembership.team_id,
            user_id: transferTo.id,
          },
        },
        trx
      ),
    ]);
  } catch (e) {
    await trx.rollback();
    await msg.channel.send(
      errorEmbed()
        .setTitle("Error updating team memberships")
        .setDescription(
          "There was a server error updating the team memberships. " +
            "**Nothing was changed.** Try again later or contact admins."
        )
    );
    return;
  }

  try {
    await trx.commit();
  } catch (e) {
    await trx.rollback();
    await msg.channel.send(
      errorEmbed()
        .setTitle("Error saving updated team memberships")
        .setDescription(
          "There was a server error saving team memberships. **Nothing was changed.** " +
            "Try again later or contact admins."
        )
    );
  }

  const teamChannel = await getTeamTextChannel(msg, team.category_id);
  await teamChannel.send(
    `<@&${team.role_id}>`,
    infoEmbed()
      .setTitle(`Team transferred to ${transferTo.tag}`)
      .setDescription(
        `They are now the leader of \`[${team.tag}] ${team.name}\`.`
      )
  );

  await msg.channel.send(
    `<@${msg.author.id}>`,
    successEmbed()
      .setTitle(`Team transferred to ${transferTo.tag}`)
      .setDescription(
        `\`[${team.tag}] ${team.name}\` has been transferred to <@${transferTo.id}>. 
          They are now the leader of this team.`
      )
  );
}

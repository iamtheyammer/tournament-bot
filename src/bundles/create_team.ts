import { Message } from "discord.js";
import db from "../db/index";
import { insertTeam } from "../db/teams";
import { insertTeamMemberships } from "../db/team_memberships";
import { DBTournament } from "../db/tournaments";

export default async function createTeam(
  msg: Message,
  currentTournament: DBTournament,
  leaderId: string,
  teamName: string,
  teamTag: string,
  teamDescription = ""
): Promise<void> {
  const trx = await db.transaction();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  if (!msg.guild.available) throw "Guild not available!";

  const newRole = await msg.guild.roles.create({
    data: { name: `[${teamTag}] ${teamName}` },
  });

  const teamCategory = await msg.guild.channels.create(`${teamName}`, {
    type: "category",
    permissionOverwrites: [
      { id: msg.guild.roles.everyone.id, deny: ["VIEW_CHANNEL"] },
      { id: newRole.id, allow: ["VIEW_CHANNEL"] },
    ],
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const teamChat = await msg.guild.channels
    .create(`${teamName}`, {
      type: "text",
      permissionOverwrites: [
        { id: msg.guild.roles.everyone.id, deny: ["VIEW_CHANNEL"] },
        { id: newRole.id, allow: ["VIEW_CHANNEL"] },
      ],
    })
    .then((channel) => channel.setParent(teamCategory));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const teamVC = await msg.guild.channels
    .create(`${teamName}`, {
      type: "voice",
      permissionOverwrites: [
        { id: msg.guild.roles.everyone.id, deny: ["VIEW_CHANNEL"] },
        { id: newRole.id, allow: ["VIEW_CHANNEL"] },
      ],
    })
    .then((channel) => channel.setParent(teamCategory));
  msg.member.roles.add(newRole);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const teamId = await insertTeam(
    {
      tournament_id: 1,
      name: teamName,
      tag: teamTag,
      description: teamDescription,
      role_id: newRole.id,
      category_id: teamCategory.id,
    },
    trx
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const teamMembershipId = await insertTeamMemberships(
    {
      user_id: msg.author.id,
      team_id: teamId,
      tournament_id: 1,
    },
    trx
  );
  await trx.commit();
}

// Create Transaction done
// Insert Team done
// If errors rollback transaction
// Create role (colors and set perms) done
// Create category (save id and name to team tag + name) done
// Create channels (with perms so only team members can view) done
// Add player to role done
// Update database role ID and category ID done
// Commit Transaction

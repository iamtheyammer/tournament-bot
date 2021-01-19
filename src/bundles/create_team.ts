import {
  CategoryChannel,
  Message,
  Role,
  TextChannel,
  VoiceChannel,
} from "discord.js";
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

  if (!msg.guild.available) throw "Guild not available!";

  const rollbackStack = [trx.rollback];
  const rollback = (errorLocation: string) =>
    Promise.all(
      rollbackStack.map((f, i) =>
        i > 0 ? f(`Error at ${errorLocation}`) : f()
      )
    );

  let teamRole: Role;
  try {
    teamRole = await msg.guild.roles.create({
      data: { name: `[${teamTag}] ${teamName}`, hoist: true },
    });
    rollbackStack.push(teamRole.delete);
  } catch (e) {
    await rollback("team role creation");
    throw e;
  }

  let teamCategory: CategoryChannel;
  try {
    teamCategory = await msg.guild.channels.create(`${teamName}`, {
      type: "category",
      permissionOverwrites: [
        { id: msg.guild.roles.everyone.id, deny: ["VIEW_CHANNEL"] },
        { id: teamRole.id, allow: ["VIEW_CHANNEL"] },
      ],
    });
    rollbackStack.push(teamCategory.delete);
  } catch (e) {
    await rollback("team category creation");
    throw e;
  }

  let teamTextChannel: TextChannel;
  try {
    teamTextChannel = await msg.guild.channels.create(`${teamName}`, {
      type: "text",
      permissionOverwrites: [
        { id: msg.guild.roles.everyone.id, deny: ["VIEW_CHANNEL"] },
        { id: teamRole.id, allow: ["VIEW_CHANNEL"] },
      ],
    });
    await teamTextChannel.setParent(teamCategory);
    rollbackStack.push(teamTextChannel.delete);
  } catch (e) {
    await rollback("team text channel creation");
    throw e;
  }

  let teamVoiceChannel: VoiceChannel;
  try {
    teamVoiceChannel = await msg.guild.channels.create(`${teamName}`, {
      type: "voice",
      permissionOverwrites: [
        { id: msg.guild.roles.everyone.id, deny: ["VIEW_CHANNEL"] },
        { id: teamRole.id, allow: ["VIEW_CHANNEL"] },
      ],
    });
    await teamVoiceChannel.setParent(teamCategory);
    rollbackStack.push(teamVoiceChannel.delete);
  } catch (e) {
    await rollback("team voice channel creation");
    throw e;
  }

  try {
    await msg.member.roles.add(teamRole);
    // no rollback needed because role is removed from user when role is deleted
  } catch (e) {
    await rollback("add role to leader");
    throw e;
  }

  try {
    await msg.member.roles.add(currentTournament.participant_role_id);
    rollbackStack.push(
      msg.member.roles.remove(currentTournament.participant_role_id)
    );
  } catch (e) {
    await rollback("add participant role to leader");
    throw e;
  }

  let teamId: number;
  try {
    teamId = await insertTeam(
      {
        tournament_id: currentTournament.id,
        name: teamName,
        tag: teamTag,
        description: teamDescription,
        role_id: teamRole.id,
        category_id: teamTextChannel.id,
      },
      trx
    );
  } catch (e) {
    await rollback("insert team to database");
    throw e;
  }

  try {
    await insertTeamMemberships(
      {
        user_id: msg.author.id,
        team_id: teamId,
        tournament_id: currentTournament.id,
        type: "leader",
      },
      trx
    );
  } catch (e) {
    await rollback("insert team membership to database");
    throw e;
  }

  try {
    await trx.commit();
  } catch (e) {
    await rollback("commit database transaction");
    throw e;
  }
}

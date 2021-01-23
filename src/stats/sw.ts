import { Message } from "discord.js";
import { Args } from "..";
import { errorEmbed, infoEmbed } from "../util/embeds";

import {
  fetchMojangUserProfile,
  fetchMojangUuidProfile,
  fetchSkywarsData,
} from "../apis";
import { DBUser, listUsers } from "../db/users";
import { calculateSkywarsRating } from "../bundles/team_stats";

function invalidUser() {
  return errorEmbed()
    .setTitle("Invalid user specified")
    .setDescription("You didn't specify a valid player to grab the stats of.");
}

export default async function sw(msg: Message, args: Args): Promise<void> {
  let user: DBUser[];
  let uuid: string;
  if (msg.mentions.members.first()) {
    user = await listUsers({ discord_id: msg.mentions.members.first().id });
    if (!user.length) {
      msg.channel.send(invalidUser());
      return;
    }
    uuid = user[0].minecraft_uuid;
  } else if (args.splitCommandLower[2]) {
    const uuidProfile = await fetchMojangUuidProfile(args.splitCommandLower[2]);
    if (!uuidProfile) {
      msg.channel.send(invalidUser());
      return;
    }
    uuid = uuidProfile.id;
  } else {
    user = await listUsers({ discord_id: msg.author.id });
    if (!user.length) {
      msg.channel.send(invalidUser());
      return;
    }
    uuid = user[0].minecraft_uuid;
  }
  if (!uuid) {
    msg.channel.send(
      errorEmbed()
        .setTitle("Invalid user specified")
        .setDescription(
          "You didn't specify a valid player to grab the stats of."
        )
    );
    return;
  }
  await msg.react("👍");
  const nameProfile = await fetchMojangUserProfile(uuid);
  const name = nameProfile.name;
  const data = await fetchSkywarsData(uuid);
  Object.keys(data).map(function (key) {
    if (data[key] !== Math.round(data[key]) && typeof data[key] === "number") {
      data[key] = parseFloat(data[key].toFixed(2));
    }
    if (isNaN(data[key])) {
      data[key] = 0;
    }
  });
  const rating = calculateSkywarsRating(data).toFixed(2);
  msg.channel.send(
    infoEmbed()
      .setTitle(`Skywars Stats for \`${name}\``)
      .setDescription(
        `All of the bedwars stats for \`${name}\` are placed here.`
      )
      .setThumbnail(`https://crafatar.com/renders/body/${uuid}?overlay`)
      .addFields(
        {
          name: `Games:`,
          value: `\`${data.games}\``,
          inline: true,
        },
        {
          name: `Level:`,
          value: `\`${data.level}\``,
          inline: true,
        },
        {
          name: `Rating:`,
          value: `\`${rating}\``,
          inline: true,
        },
        {
          name: `Kills:`,
          value: `\`${data.kills}\``,
          inline: true,
        },
        {
          name: `Deaths:`,
          value: `\`${data.deaths}\``,
          inline: true,
        },
        {
          name: `Kill/Death Ratio:`,
          value: `\`${data.kdr}\``,
          inline: true,
        },
        { name: `Wins:`, value: `\`${data.wins}\``, inline: true },
        {
          name: `Losses:`,
          value: `\`${data.losses}\``,
          inline: true,
        },
        {
          name: `Win/Loss Ratio:`,
          value: `\`${data.wlr}\``,
          inline: true,
        }
      )
  );
  msg.reactions.removeAll();
}

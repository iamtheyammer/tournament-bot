import { Message } from "discord.js";
import { teamCreating } from "../index";
import confirm from "./confirm";
import deny from "./deny";
import info from "./info";
import join from "./join";
import create from "./create";
import invite from "./invite";

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
        await confirm(msg, index);
        break;
      }
      case "deny": {
        await deny(msg, index);
        break;
      }
    }
  } else {
    switch (args[1]) {
      case "create": {
        await create(msg, args, argsCapital);
        break;
      }
      case "invite": {
        await invite(msg);
        break;
      }
      case "join": {
        await join(msg, args);
        break;
      }
      case "info": {
        await info(msg, args);
        break;
      }
    }
  }
}

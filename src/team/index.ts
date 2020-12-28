import { Message } from "discord.js";
import { teamCreating } from "../index";
import confirm from "./confirm";
import deny from "./deny";
import create from "./create";
export const alphanum = "abcdefghijklmnopqrstuvwxyz123456789";

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
    }
  }
}

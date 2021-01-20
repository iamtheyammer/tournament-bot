export const isMinecraftUsername = (username: string): boolean =>
  /^[A-z0-9_]{2,16}$/.test(username);

export const isValidTeamTag = (tag: string): boolean =>
  /^[A-z0-9]{1,6}$/.test(tag);

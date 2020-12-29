export const isMinecraftUsername = (username: string): boolean =>
  /^[A-z0-9_]{2,16}$/.test(username);

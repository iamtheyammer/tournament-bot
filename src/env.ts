const envVarNames = ["DISCORD_TOKEN", "HYPIXEL_API_KEY"];

export interface EnvVars {
  DISCORD_TOKEN?: string;
  HYPIXEL_API_KEY?: string;
}

const envVars: EnvVars = {};

envVarNames.forEach((name) => {
  const value = process.env[name];

  if (!value) {
    console.error(`Unable to find environment variable ${name}!`);
    process.exit(1);
  }

  envVars[name] = value;
});

export default envVars;

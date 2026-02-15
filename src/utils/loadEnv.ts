import { loadEnv } from "vite";

function getModeFromArgs() {
  const modeFlagIndex = process.argv.indexOf('--mode');
  if (modeFlagIndex !== -1 && process.argv[modeFlagIndex + 1]) {
    return process.argv[modeFlagIndex + 1];
  }

  return process.env.NODE_ENV || 'development';
}

export function loadModeEnv(): Record<string,string> {
  const mode = getModeFromArgs();
  const env = loadEnv(mode, process.cwd(), "")
  env["MODE"] = mode
  
  return env
}
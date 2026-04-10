import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { sanitizeTauriEnvironment } from "./tauri-env.js";

const require = createRequire(import.meta.url);
const tauriEntrypoint = require.resolve("@tauri-apps/cli/tauri.js");
const child = spawn(process.execPath, [tauriEntrypoint, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: sanitizeTauriEnvironment(process.env)
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

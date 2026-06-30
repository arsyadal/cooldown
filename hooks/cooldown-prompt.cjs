#!/usr/bin/env node
const { execFileSync, spawnSync } = require("node:child_process");

function has(command) {
  return spawnSync(command, ["--help"], { stdio: "ignore" }).error === undefined;
}

if (!has("cooldown")) process.exit(0);

try {
  const output = execFileSync("cooldown", ["statusline"], {
    encoding: "utf8",
    timeout: 5000,
    maxBuffer: 1024 * 256,
  }).trim();
  if (output) process.stdout.write(output);
} catch {
  process.exit(0);
}

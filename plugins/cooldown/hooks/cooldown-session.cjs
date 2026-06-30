#!/usr/bin/env node
const { execFileSync, spawnSync } = require("node:child_process");

function has(command) {
  return spawnSync(command, ["--help"], { stdio: "ignore" }).error === undefined;
}

function cooldown(args) {
  if (!has("cooldown")) return "";
  try {
    return execFileSync("cooldown", args, {
      encoding: "utf8",
      timeout: 5000,
      maxBuffer: 1024 * 256,
    }).trim();
  } catch {
    return "";
  }
}

const line = cooldown(["statusline"]);
const status = line || cooldown(["status"]);

if (status) {
  process.stdout.write(
    `Cooldown plugin active.\n${status}\n\n` +
      "When the user asks about cooldown or reset reminders, use the bundled Cooldown skill and call the cooldown CLI."
  );
}

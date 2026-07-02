import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const cli = join(import.meta.dirname, "..", "dist", "cli.js");

function run(args, env) {
  return execFileSync("node", [cli, ...args], {
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

run(["__selftest"]);

const dir = mkdtempSync(join(tmpdir(), "cooldown-"));
try {
  const env = { COOLDOWN_DIR: dir };
  run(["update", "pi", "--reset", "1 Jul 2026 1.10", "--usage", "94"], env);
  run(["update", "pi", "--reset", "1 Jul 2026 1.10", "--usage", "89"], env);

  const status = run(["status"], env);
  const piLines = status.split("\n").filter((l) => l.startsWith("pi")).length;
  if (piLines !== 1) {
    throw new Error(`expected 1 'pi' line in status, got ${piLines}:\n${status}`);
  }

  run(["daemon", "install", "--dry-run"], env);

  const historyOut = run(["history"], env);
  if (!historyOut.includes("pi")) {
    throw new Error(`expected 'pi' in history:\n${historyOut}`);
  }

  const statuslineOut = run(["statusline"], env);
  if (!statuslineOut.includes("pi")) {
    throw new Error(`expected 'pi' in statusline:\n${statuslineOut}`);
  }

  const doctorOut = run(["doctor"], env);
  if (!doctorOut.includes("pending reminders: 1")) {
    throw new Error(`expected 1 pending reminder in doctor:\n${doctorOut}`);
  }

  const id = historyOut.trim().split("\n").pop().split("\t")[0];
  run(["cancel", id], env);
  const cancelledHistory = run(["history"], env);
  if (!cancelledHistory.includes(`${id}\tpi\tcancelled`)) {
    throw new Error(`expected ${id} marked cancelled:\n${cancelledHistory}`);
  }

  // `cooldown run <provider>` wraps a real provider CLI. The parser is generic,
  // but each provider prints limit messages in its own shape - verify all three.
  const binDir = mkdtempSync(join(tmpdir(), "cooldown-bin-"));
  const isWin = process.platform === "win32";
  function writeFakeProvider(name, stdout) {
    if (isWin) {
      // % is the batch variable sigil; escape it so "95%" survives echo
      writeFileSync(join(binDir, `${name}.cmd`), `@echo off\r\necho ${stdout.replaceAll("%", "%%")}\r\n`);
    } else {
      const file = join(binDir, name);
      writeFileSync(file, `#!/bin/sh\necho "${stdout}"\n`);
      chmodSync(file, 0o755);
    }
  }

  const pathKey = Object.keys(process.env).find((k) => k.toUpperCase() === "PATH") ?? "PATH";
  const runEnv = { COOLDOWN_DIR: dir, [pathKey]: `${binDir}${isWin ? ";" : ":"}${process.env[pathKey]}` };
  const providerCases = [
    ["claude", "Claude usage limit reached. Try again in 5 hours."],
    ["codex", "rate limit hit, resets at 23:59"],
    ["pi", "quota 80% used. cooldown until tomorrow at 9 AM"],
  ];
  for (const [provider, message] of providerCases) {
    writeFakeProvider(provider, message);
    run(["run", provider], runEnv);
    const state = run(["status"], runEnv);
    if (!state.split("\n").some((l) => l.startsWith(`${provider}\t`))) {
      throw new Error(`expected '${provider}' detected in status after run:\n${state}`);
    }
  }
  // Limit seen but no reset time -> fallback hint on stderr.
  writeFakeProvider("claude", "usage limit reached: 95% used");
  const fallback = spawnSync("node", [cli, "run", "claude"], { encoding: "utf8", env: { ...process.env, ...runEnv } });
  if (!fallback.stderr.includes("reset time was not found")) {
    throw new Error(`expected fallback hint on stderr:\n${fallback.stderr}`);
  }
  rmSync(binDir, { recursive: true, force: true });
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log("selftest ok");

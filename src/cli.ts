#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";

const dir = join(homedir(), ".cooldown");
const configFile = join(dir, "config.json");
const eventsFile = join(dir, "events.json");
const pidFile = join(dir, "cooldown.pid");
const logFile = join(dir, "cooldown.log");
const cliPath = process.argv[1];

type Config = { ntfy?: { topic: string; server: string }; telegram?: { token: string; chatId: string }; desktop?: boolean };
type Event = {
  id: string;
  provider: string;
  resetAt: string;
  status: "pending" | "notified" | "cancelled";
  createdAt: string;
  source?: "manual" | "detected";
  rawMatch?: string;
  notifiedAt?: string;
};

function ensureDir() {
  mkdirSync(dir, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
  if (!existsSync(file)) return fallback;
  return JSON.parse(readFileSync(file, "utf8")) as T;
}

function writeJson(file: string, data: unknown) {
  ensureDir();
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function log(message: string) {
  ensureDir();
  writeFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`, { flag: "a" });
}

function parseTime(value: string): Date {
  const now = new Date();
  const input = value.trim().replace(/[,.;]+$/, "");
  const duration = input.match(/^(?:in\s*)?(?:(\d+)\s*(?:h|hour|hours))?\s*(?:(\d+)\s*(?:m|min|minute|minutes))?$/i);
  if (duration?.[0].trim() && (duration[1] || duration[2])) {
    return new Date(now.getTime() + Number(duration[1] ?? 0) * 3600000 + Number(duration[2] ?? 0) * 60000);
  }

  const tomorrow = input.match(/^tomorrow(?:\s+at)?\s+(.+)$/i);
  if (tomorrow) {
    const d = parseClock(tomorrow[1], now);
    if (d) {
      d.setDate(now.getDate() + 1);
      return d;
    }
  }

  const clock = parseClock(input, now);
  if (clock) return clock;

  const parsed = new Date(input);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  throw new Error(`Cannot parse time: ${value}`);
}

function parseClock(value: string, now: Date): Date | undefined {
  const clock = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!clock) return;
  const d = new Date(now);
  let hour = Number(clock[1]);
  const minute = Number(clock[2] ?? 0);
  const ampm = clock[3]?.toLowerCase();
  if (ampm === "pm" && hour < 12) hour += 12;
  if (ampm === "am" && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return;
  d.setHours(hour, minute, 0, 0);
  if (d <= now) d.setDate(d.getDate() + 1);
  return d;
}

function detectReset(text: string): Date | undefined {
  if (!/(limit|rate limit|usage|try again|reset|cooldown|available|blocked)/i.test(text)) return;
  const patterns = [
    /(?:try again|reset(?:s)?|available|continue|come back)\s+(?:at|around|after|on)\s+([^\n]+)/i,
    /(?:try again|reset(?:s)?|available|continue|come back)\s+in\s+((?:(?:\d+)\s*(?:h|hour|hours))?\s*(?:(?:\d+)\s*(?:m|min|minute|minutes))?)/i,
    /(?:cooldown|limited|blocked)\s+until\s+([^\n]+)/i,
    /(?:at|around|until)\s+(tomorrow\s+(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
    /(?:at|around|until)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
    /in\s+((?:(?:\d+)\s*(?:h|hour|hours))?\s*(?:(?:\d+)\s*(?:m|min|minute|minutes))?)/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern)?.[1]?.trim();
    if (!match) continue;
    try { return parseTime(match); } catch { /* keep looking */ }
  }
}

async function ntfy(text: string) {
  const config = readJson<Config>(configFile, {});
  if (!config.ntfy) throw new Error("ntfy is not configured. Run: cooldown setup ntfy --topic <topic>");

  const res = await fetch(`${config.ntfy.server.replace(/\/$/, "")}/${config.ntfy.topic}`, {
    method: "POST",
    headers: { title: "Cooldown" },
    body: text
  });
  if (!res.ok) throw new Error(`ntfy failed: ${res.status} ${await res.text()}`);
}

async function telegram(text: string) {
  const config = readJson<Config>(configFile, {});
  if (!config.telegram) throw new Error("Telegram is not configured. Run: cooldown setup telegram --token <token> --chat-id <id>");

  const res = await fetch(`https://api.telegram.org/bot${config.telegram.token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: config.telegram.chatId, text })
  });
  if (!res.ok) throw new Error(`Telegram failed: ${res.status} ${await res.text()}`);
}

function desktop(text: string) {
  const p = platform();
  if (p === "darwin") return void spawn("osascript", ["-e", `display notification ${JSON.stringify(text)} with title "Cooldown"`]);
  if (p === "linux") return void spawn("notify-send", ["Cooldown", text]);
  if (p === "win32") return log(`desktop notification skipped on Windows: ${text}`);
}

async function notify(text: string) {
  try { await ntfy(text); }
  catch (error) { log(String(error)); }
  try { await telegram(text); }
  catch (error) { log(String(error)); }
  try { desktop(text); }
  catch (error) { log(String(error)); }
}

async function daemonLoop() {
  ensureDir();
  writeFileSync(pidFile, String(process.pid));
  log(`daemon started pid=${process.pid}`);

  const tick = async () => {
    const events = readJson<Event[]>(eventsFile, []);
    let changed = false;
    for (const event of events) {
      if (event.status !== "pending" || new Date(event.resetAt) > new Date()) continue;
      await notify(`${event.provider} is ready again. Your cooldown should be over now.`);
      event.status = "notified";
      event.notifiedAt = new Date().toISOString();
      changed = true;
    }
    if (changed) writeJson(eventsFile, events);
  };

  await tick();
  setInterval(() => void tick(), 30_000);
}

function pidAlive(pid: number) {
  try { process.kill(pid, 0); return true; }
  catch { return false; }
}

function daemonStart() {
  if (existsSync(pidFile)) {
    const pid = Number(readFileSync(pidFile, "utf8"));
    if (pidAlive(pid)) return console.log("Daemon already has a pid file. Run: cooldown daemon status");
    unlinkSync(pidFile);
  }
  const child = spawn(process.execPath, [cliPath, "__daemon"], {
    detached: true,
    stdio: "ignore"
  });
  child.unref();
  console.log(`Daemon started. pid=${child.pid}`);
}

function daemonStop() {
  if (!existsSync(pidFile)) return console.log("Daemon is not running.");
  const pid = Number(readFileSync(pidFile, "utf8"));
  try { process.kill(pid); } catch { /* already dead */ }
  unlinkSync(pidFile);
  console.log("Daemon stopped.");
}

function daemonStatus() {
  if (!existsSync(pidFile)) return console.log("Daemon: stopped");
  const pid = Number(readFileSync(pidFile, "utf8"));
  console.log(pidAlive(pid) ? `Daemon: running pid=${pid}` : "Daemon: stale pid file");
}

function daemonInstall(args: string[] = []) {
  const dryRun = args.includes("--dry-run");
  const p = platform();
  if (p === "darwin") {
    const launchDir = join(homedir(), "Library", "LaunchAgents");
    const plist = join(launchDir, "dev.cooldown.daemon.plist");
    if (dryRun) return console.log(`LaunchAgent dry-run ok: ${plist}`);
    mkdirSync(launchDir, { recursive: true });
    writeFileSync(plist, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>dev.cooldown.daemon</string>
  <key>ProgramArguments</key><array><string>${process.execPath}</string><string>${cliPath}</string><string>__daemon</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict></plist>
`);
    const result = spawnSync("launchctl", ["load", "-w", plist], { stdio: "inherit" });
    if (result.status !== 0) throw new Error("launchctl install failed");
    return console.log(`Installed LaunchAgent: ${plist}`);
  }
  if (p === "linux") {
    const serviceDir = join(homedir(), ".config", "systemd", "user");
    const service = join(serviceDir, "cooldown.service");
    if (dryRun) return console.log(`systemd dry-run ok: ${service}`);
    mkdirSync(serviceDir, { recursive: true });
    writeFileSync(service, `[Unit]
Description=Cooldown daemon

[Service]
ExecStart=${process.execPath} ${cliPath} __daemon
Restart=always

[Install]
WantedBy=default.target
`);
    if (spawnSync("systemctl", ["--user", "daemon-reload"], { stdio: "inherit" }).status !== 0) throw new Error("systemd daemon-reload failed");
    if (spawnSync("systemctl", ["--user", "enable", "--now", "cooldown.service"], { stdio: "inherit" }).status !== 0) throw new Error("systemd install failed");
    return console.log(`Installed systemd user service: ${service}`);
  }
  if (p === "win32") {
    const startup = join(process.env.APPDATA ?? join(homedir(), "AppData", "Roaming"), "Microsoft", "Windows", "Start Menu", "Programs", "Startup");
    const cmd = join(startup, "cooldown.cmd");
    if (dryRun) return console.log(`Windows startup dry-run ok: ${cmd}`);
    mkdirSync(startup, { recursive: true });
    writeFileSync(cmd, `@echo off\r\nstart "" /min "${process.execPath}" "${cliPath}" __daemon\r\n`);
    return console.log(`Installed Windows startup script: ${cmd}`);
  }
  throw new Error(`Unsupported platform: ${p}`);
}

function daemonUninstall() {
  const p = platform();
  if (p === "darwin") {
    const plist = join(homedir(), "Library", "LaunchAgents", "dev.cooldown.daemon.plist");
    spawnSync("launchctl", ["unload", "-w", plist], { stdio: "ignore" });
    if (existsSync(plist)) unlinkSync(plist);
    return console.log("Uninstalled LaunchAgent.");
  }
  if (p === "linux") {
    spawnSync("systemctl", ["--user", "disable", "--now", "cooldown.service"], { stdio: "inherit" });
    const service = join(homedir(), ".config", "systemd", "user", "cooldown.service");
    if (existsSync(service)) unlinkSync(service);
    spawnSync("systemctl", ["--user", "daemon-reload"], { stdio: "inherit" });
    return console.log("Uninstalled systemd user service.");
  }
  if (p === "win32") {
    const cmd = join(process.env.APPDATA ?? join(homedir(), "AppData", "Roaming"), "Microsoft", "Windows", "Start Menu", "Programs", "Startup", "cooldown.cmd");
    if (existsSync(cmd)) unlinkSync(cmd);
    return console.log("Uninstalled Windows startup script.");
  }
  throw new Error(`Unsupported platform: ${p}`);
}

function setupNtfy(args: string[]) {
  const topic = flag(args, "--topic");
  const server = flag(args, "--server") ?? "https://ntfy.sh";
  if (!topic) throw new Error("Usage: cooldown setup ntfy --topic <topic> [--server https://ntfy.sh]");
  writeJson(configFile, { ...readJson<Config>(configFile, {}), ntfy: { topic, server }, desktop: true });
  console.log("ntfy configured.");
}

function setupTelegram(args: string[]) {
  const token = flag(args, "--token");
  const chatId = flag(args, "--chat-id");
  if (!token || !chatId) throw new Error("Usage: cooldown setup telegram --token <token> --chat-id <id>");
  writeJson(configFile, { ...readJson<Config>(configFile, {}), telegram: { token, chatId }, desktop: true });
  console.log("Telegram configured.");
}

function saveReminder(provider: string, resetAt: Date, source: Event["source"] = "manual", rawMatch?: string) {
  const events = readJson<Event[]>(eventsFile, []);
  const event: Event = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    provider,
    resetAt: resetAt.toISOString(),
    status: "pending",
    createdAt: new Date().toISOString(),
    source,
    rawMatch
  };
  events.push(event);
  writeJson(eventsFile, events);
  console.log(`${provider} cooldown saved for ${resetAt.toLocaleString()}.`);
  if (!existsSync(pidFile)) console.log("Reminder saved, but daemon may not be running. Start it with: cooldown daemon start");
}

function remind(args: string[]) {
  const provider = args[0];
  const time = flag(args, "--in") ?? flag(args, "--at");
  if (!provider || !time) throw new Error("Usage: cooldown remind <provider> --in 5h | --at 15:30");
  saveReminder(provider, parseTime(time), "manual");
}

function runProvider(args: string[]) {
  const provider = args[0];
  if (!provider) throw new Error("Usage: cooldown run <provider> [-- <command args>]");
  const separator = args.indexOf("--");
  const commandArgs = separator >= 0 ? args.slice(separator + 1) : [];
  const command = provider === "claude" ? "claude" : provider === "codex" ? "codex" : provider;
  const child = spawn(command, commandArgs, { stdio: ["inherit", "pipe", "pipe"] });
  let saved = false;
  let buffer = "";

  const scan = (text: string) => {
    if (saved) return;
    buffer = `${buffer}${text}`.slice(-2000);
    const resetAt = detectReset(buffer);
    if (!resetAt) return;
    saved = true;
    saveReminder(provider, resetAt, "detected", buffer.slice(-500));
  };

  child.stdout?.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    process.stdout.write(text);
    scan(text);
  });
  child.stderr?.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    process.stderr.write(text);
    scan(text);
  });
  child.on("exit", code => { process.exitCode = code ?? 0; });
  child.on("error", error => { console.error(error.message); process.exitCode = 1; });
}

function status() {
  const events = readJson<Event[]>(eventsFile, []).filter(e => e.status === "pending");
  if (!events.length) return console.log("No pending cooldowns.");
  console.log("Provider\tReset At\tRemaining");
  for (const event of events) {
    const ms = Math.max(0, new Date(event.resetAt).getTime() - Date.now());
    console.log(`${event.provider}\t${new Date(event.resetAt).toLocaleString()}\t${formatMs(ms)}`);
  }
}

function history() {
  const events = readJson<Event[]>(eventsFile, []);
  if (!events.length) return console.log("No history.");
  for (const e of events) console.log(`${e.id}\t${e.provider}\t${e.status}\t${new Date(e.resetAt).toLocaleString()}`);
}

function cancel(id: string | undefined) {
  if (!id) throw new Error("Usage: cooldown cancel <event_id>");
  const events = readJson<Event[]>(eventsFile, []);
  const event = events.find(e => e.id === id);
  if (!event) throw new Error(`Event not found: ${id}`);
  event.status = "cancelled";
  writeJson(eventsFile, events);
  console.log(`Cancelled ${id}.`);
}

function hasCommand(command: string) {
  const checker = platform() === "win32" ? "where" : "which";
  return spawnSync(checker, [command], { stdio: "ignore" }).status === 0;
}

function doctor() {
  const config = readJson<Config>(configFile, {});
  const events = readJson<Event[]>(eventsFile, []);
  const pending = events.filter(e => e.status === "pending").length;
  const pid = existsSync(pidFile) ? Number(readFileSync(pidFile, "utf8")) : undefined;
  const daemon = pid && pidAlive(pid) ? `running pid=${pid}` : pid ? "stale pid file" : "stopped";
  const desktopCommand = platform() === "darwin" ? "osascript" : platform() === "linux" ? "notify-send" : undefined;

  const checks: Array<[string, boolean, string]> = [
    ["config", existsSync(configFile), existsSync(configFile) ? configFile : "missing; run setup"],
    ["ntfy", Boolean(config.ntfy), config.ntfy ? `${config.ntfy.server}/${config.ntfy.topic}` : "missing; run cooldown setup ntfy --topic <topic>"],
    ["telegram", Boolean(config.telegram), config.telegram ? "configured" : "optional"],
    ["daemon", daemon.startsWith("running"), daemon],
    ["desktop", desktopCommand ? hasCommand(desktopCommand) : true, desktopCommand ?? "skipped on Windows"],
    ["claude", hasCommand("claude"), hasCommand("claude") ? "found" : "not found"],
    ["codex", hasCommand("codex"), hasCommand("codex") ? "found" : "not found"],
    ["pending reminders", true, String(pending)]
  ];

  for (const [name, ok, detail] of checks) console.log(`${ok ? "✓" : "!"} ${name}: ${detail}`);
}

function flag(args: string[], name: string) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

function formatMs(ms: number) {
  const minutes = Math.ceil(ms / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

function selfTest() {
  const now = Date.now();
  const cases = [
    "1h",
    "in 5 minutes",
    "2h 30m",
    "23:59",
    "2:30 PM",
    "tomorrow at 9 AM"
  ];
  for (const value of cases) {
    const parsed = parseTime(value);
    if (Number.isNaN(parsed.getTime()) || parsed.getTime() <= now) throw new Error(`parse failed: ${value}`);
  }

  const messages = [
    "usage limit reached. try again in 5 minutes",
    "rate limit hit, try again at 23:59",
    "blocked until tomorrow at 9 AM",
    "cooldown until 2:30 PM",
    "limit reached. resets in 2h 30m"
  ];
  for (const message of messages) {
    const detected = detectReset(message);
    if (!detected || detected.getTime() <= now) throw new Error(`detect failed: ${message}`);
  }
  console.log("ok");
}

async function main() {
  const [cmd, sub, ...rest] = process.argv.slice(2);
  try {
    if (cmd === "__daemon") return void await daemonLoop();
    if (cmd === "__selftest") return selfTest();
    if (cmd === "setup" && sub === "ntfy") return setupNtfy(rest);
    if (cmd === "setup" && sub === "telegram") return setupTelegram(rest);
    if (cmd === "daemon" && sub === "start") return daemonStart();
    if (cmd === "daemon" && sub === "stop") return daemonStop();
    if (cmd === "daemon" && sub === "status") return daemonStatus();
    if (cmd === "daemon" && sub === "install") return daemonInstall(rest);
    if (cmd === "daemon" && sub === "uninstall") return daemonUninstall();
    if (cmd === "remind") return remind([sub, ...rest].filter(Boolean));
    if (cmd === "run") return runProvider([sub, ...rest].filter(Boolean));
    if (cmd === "status") return status();
    if (cmd === "history") return history();
    if (cmd === "cancel") return cancel(sub);
    if (cmd === "doctor") return doctor();
    if (cmd === "test" && sub === "ntfy") return void await ntfy("Cooldown test notification.");
    if (cmd === "test" && sub === "telegram") return void await telegram("Cooldown test notification.");
    if (cmd === "test" && sub === "desktop") return desktop("Cooldown test notification.");
    console.log(`Usage:
  cooldown setup ntfy --topic <topic> [--server https://ntfy.sh]
  cooldown setup telegram --token <token> --chat-id <id>
  cooldown daemon start|stop|status|install|uninstall
  cooldown remind <provider> --in 5h | --at 15:30
  cooldown run claude|codex [-- provider args]
  cooldown status
  cooldown history
  cooldown cancel <event_id>
  cooldown doctor
  cooldown test ntfy|telegram|desktop`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

void main();

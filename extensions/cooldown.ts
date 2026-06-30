import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

function hasCooldownCli() {
  return spawnSync("cooldown", ["--help"], { stdio: "ignore" }).error === undefined;
}

function runCooldown(args: string[]): string {
  if (!hasCooldownCli()) return "cooldown error: CLI not found. Run npm link in the cooldown repo or install the package.";
  try {
    return execFileSync("cooldown", args, {
      encoding: "utf8",
      timeout: 10_000,
      maxBuffer: 1024 * 1024,
    }).trim() || "ok";
  } catch (error: any) {
    const stderr = error?.stderr?.toString?.() ?? "";
    const stdout = error?.stdout?.toString?.() ?? "";
    const message = stderr || stdout || error?.message || String(error);
    return `cooldown error: ${message.trim()}`;
  }
}

function parseCommandArgs(args: string): string[] {
  return args.match(/(?:[^\s"]+|"[^"]*")+/g)?.map(part => part.replace(/^"|"$/g, "")) ?? [];
}

type Source = "manual" | "detected";
type Event = { provider: string; resetAt: string; status: string; usagePercent?: number; source?: Source; createdAt?: string };
type State = { provider: string; resetAt?: string; usagePercent?: number; source?: Source; updatedAt?: string };

function readJson<T>(file: string, fallback: T): T {
  if (!existsSync(file)) return fallback;
  try { return JSON.parse(readFileSync(file, "utf8")) as T; } catch { return fallback; }
}

function formatMs(ms: number) {
  const minutes = Math.ceil(ms / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
}

function cooldownLine() {
  const dir = join(homedir(), ".cooldown");
  const pending = readJson<Event[]>(join(dir, "events.json"), []).filter(e => e.status === "pending");
  const states = readJson<State[]>(join(dir, "state.json"), []);
  if (!hasCooldownCli()) return "⏳ cooldown: install needed";
  const item = pending[0] ?? states.find(s => s.resetAt || s.usagePercent !== undefined);
  if (!item) return "⏳ cooldown: waiting for provider usage";
  const state = states.find(s => s.provider === item.provider);
  const usage = item.usagePercent ?? state?.usagePercent;
  const resetAt = item.resetAt ?? state?.resetAt;
  const reset = resetAt ? new Date(resetAt) : undefined;
  const remaining = reset ? formatMs(Math.max(0, reset.getTime() - Date.now())) : "?";
  const usageText = usage === undefined ? "?" : `${usage}%`;
  const resetText = reset ? reset.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "?";
  const updatedAt = new Date(state?.updatedAt ?? item.createdAt ?? 0).getTime();
  const source = item.source ?? state?.source;
  const freshness = source === "manual" ? "manual" : updatedAt && Date.now() - updatedAt < 10 * 60_000 ? "auto" : "stale";
  return `⏳ cooldown: ${item.provider} ${usageText} reset ${resetText} (${remaining}) ${freshness}`;
}

function paintCooldown(ctx: any) {
  ctx.ui.setWidget("cooldown", undefined);
  ctx.ui.setStatus("cooldown", cooldownLine());
}

function header(headers: Record<string, string>, name: string) {
  return headers[name.toLowerCase()];
}

function saveHeaders(provider: string, headers: Record<string, string>, status?: number) {
  const limit = Number(header(headers, "x-ratelimit-limit-requests") ?? header(headers, "x-ratelimit-limit-tokens"));
  const remaining = Number(header(headers, "x-ratelimit-remaining-requests") ?? header(headers, "x-ratelimit-remaining-tokens"));
  const reset = header(headers, "x-ratelimit-reset-requests") ?? header(headers, "x-ratelimit-reset-tokens") ?? (status === 429 ? header(headers, "retry-after") : undefined);
  const args = ["update", provider];
  if (Number.isFinite(limit) && limit > 0 && Number.isFinite(remaining)) args.push("--usage", String(Math.max(0, Math.min(100, Math.round((remaining / limit) * 100)))));
  if (reset) args.push("--reset", /^\d+$/.test(reset) ? `${reset}s` : reset);
  if (args.length > 2) runCooldown(args);
}

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    paintCooldown(ctx);
    setInterval(() => paintCooldown(ctx), 10_000).unref();
  });

  pi.on("after_provider_response", async (event, ctx) => {
    saveHeaders("pi", event.headers ?? {}, event.status);
    paintCooldown(ctx);
  });

  pi.registerCommand("cooldown", {
    description: "Show or update Cooldown status without leaving pi. Examples: /cooldown, /cooldown update pi --reset \"1 Jul 2026 1.10\" --usage 94",
    handler: async (args, ctx) => {
      const parsed = parseCommandArgs(args.trim());
      const output = runCooldown(parsed.length ? parsed : ["status"]);
      paintCooldown(ctx);
      ctx.ui.notify(output, output.startsWith("cooldown error:") ? "error" : "info");
    },
  });

  pi.registerTool({
    name: "cooldown_status",
    label: "Cooldown Status",
    description: "Show current Cooldown status. Use when the user asks 'cooldown' or asks about limit/reset reminder status.",
    parameters: { type: "object", properties: {} },
    async execute() {
      return {
        content: [{ type: "text", text: runCooldown(["status"]) }],
        details: {},
        terminate: true,
      };
    },
  });

  pi.registerTool({
    name: "cooldown_remind",
    label: "Save Cooldown Reminder",
    description: "Save a Cooldown reminder from user-provided real usage/reset data. Use this when user gives usage percent and reset time.",
    parameters: {
      type: "object",
      properties: {
        provider: { type: "string", description: "Provider name, usually pi, claude, or codex" },
        resetAt: { type: "string", description: "Reset time, for example '1 Jul 2026 1.10' or '15:30'" },
        usagePercent: { type: "number", minimum: 0, maximum: 100, description: "Usage percentage, 0-100" },
      },
      required: ["provider", "resetAt"],
    },
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const args = ["update", params.provider, "--reset", params.resetAt];
      if (params.usagePercent !== undefined) args.push("--usage", String(params.usagePercent));
      const text = runCooldown(args);
      paintCooldown(ctx);
      return {
        content: [{ type: "text", text }],
        details: {},
        terminate: true,
      };
    },
  });

  pi.on("before_agent_start", async (event) => {
    if (event.prompt.trim().toLowerCase() !== "cooldown") return;
    const output = runCooldown(["status"]);
    return {
      message: {
        customType: "cooldown-status",
        content: output,
        display: true,
      },
      systemPrompt: `${event.systemPrompt}\n\nThe user typed exactly "cooldown". Answer with this Cooldown status and do not perform unrelated work:\n${output}`,
    };
  });
}

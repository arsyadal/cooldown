# Roadmap

## Phase 1 — Durable MVP

- CLI skeleton.
- Local config.
- Manual reminders.
- Background daemon.
- ntfy notifications.
- Desktop notification fallback.
- Status command.
- History command.

Goal: reminders still notify after the terminal closes.

## Phase 2 — Provider Detection

- `cooldown run claude`.
- `cooldown run codex`.
- Limit message parser.
- Reset time parser.
- Fallback when reset time is missing.

## Phase 3 — Agent Skills

- Claude Code skill.
- Codex skill/plugin.
- Pi skill.
- Install docs for each agent.

## Phase 4 — Desktop App

- Tray icon.
- Countdown UI.
- Notification settings.
- Provider status overview.

Possible stack: Tauri.

## Phase 5 — Team/SaaS Mode

Only if local tool gets traction.

- Shared team dashboard.
- Slack/Discord alerts.
- Team cooldown history.
- API usage monitor.

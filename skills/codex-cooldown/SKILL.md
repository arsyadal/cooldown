# Cooldown

Use when the user wants Codex CLI usage-limit, reset, or cooldown notifications.

## Rule

Cooldown reminders must be stored through the `cooldown` CLI so the daemon can notify after the terminal closes.

## Commands

```bash
cooldown doctor
cooldown setup ntfy --topic <secret-topic>
cooldown daemon start
cooldown daemon install
cooldown remind codex --in 3h
cooldown remind codex --at "15:30"
cooldown status
cooldown history
```

## Auto-detect wrapper

For future Codex sessions, suggest:

```bash
cooldown run codex
```

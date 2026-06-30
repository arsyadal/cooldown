---
name: codex-cooldown
description: Use when the user asks for Codex cooldown reminders, reset timing, notification setup, or cooldown status.
---

# Cooldown

Use when the user needs Codex cooldown reminders.

## Rule

Call the `cooldown` CLI. The daemon owns reminders.

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

## Auto-detect

```bash
cooldown run codex
```

---
name: cooldown
description: Use when the user asks for Codex cooldown reminders, cooldown status, notification setup, reminder history, or reset timing.
---

# Cooldown

Use when the user needs Codex cooldown reminders, status, setup, or history.

## Rule

Call the `cooldown` CLI. The daemon owns reminders and notifications.

If `cooldown` is not available, tell the user to install it:

```bash
npm install -g cooldown
```

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

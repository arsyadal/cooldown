---
description: Show or update Cooldown reminder status
argument-hint: [status|doctor|remind|update|history]
allowed-tools: [Bash]
---

# Cooldown

Use the `cooldown` CLI for cooldown reminders. The daemon owns scheduling and notifications.

The user invoked `/cooldown` with: $ARGUMENTS

## Behavior

- If no arguments were provided, run `cooldown status`.
- If arguments were provided, run `cooldown $ARGUMENTS`.
- If `cooldown` is missing, tell the user to install it with `npm install -g cooldown` or build from this repo.

## Common Commands

```bash
cooldown doctor
cooldown setup ntfy --topic <secret-topic>
cooldown daemon start
cooldown remind claude --in 5h
cooldown remind codex --at "15:30"
cooldown status
cooldown history
```

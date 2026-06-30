---
name: pi-cooldown
description: Use when the user asks for Pi agent cooldown reminders, reset timing, notification setup, or cooldown status.
---

# Cooldown

Use when the user needs Pi cooldown reminders.

## Rule

Call the `cooldown` CLI. The daemon owns reminders.

## Commands

```bash
cooldown doctor
cooldown setup ntfy --topic <secret-topic>
cooldown daemon start
cooldown daemon install
cooldown remind pi --in 5h
cooldown remind pi --at "15:30"
cooldown status
cooldown history
```

## Auto-detect

```bash
cooldown run pi
```

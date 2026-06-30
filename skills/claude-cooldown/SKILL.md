---
name: claude-cooldown
description: Use when the user asks for Claude Code cooldown reminders, reset timing, notification setup, or cooldown status.
---

# Cooldown

Use when the user needs Claude Code cooldown reminders.

## Install

```bash
mkdir -p ~/.claude/commands
cp skills/claude-cooldown/SKILL.md ~/.claude/commands/cooldown.md
# then inside Claude Code: /cooldown
```

## Rule

Call the `cooldown` CLI. The daemon owns reminders.

## Commands

```bash
cooldown doctor
cooldown setup ntfy --topic <secret-topic>
cooldown daemon start
cooldown daemon install
cooldown remind claude --in 5h
cooldown remind claude --at "15:30"
cooldown status
cooldown history
```

## Auto-detect

```bash
cooldown run claude
```

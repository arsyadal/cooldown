# Cooldown

Use when the user wants a reminder for Claude Code/Codex/agent CLI usage limits, reset times, or cooldowns.

## Install (Claude Code custom command)

```bash
mkdir -p ~/.claude/commands
cp skills/claude-cooldown/SKILL.md ~/.claude/commands/cooldown.md
# then inside Claude Code: /cooldown
```

## Rule

Do not stay alive as the scheduler. Call the `cooldown` CLI; the local daemon owns reminders.

## Commands

```bash
cooldown doctor
cooldown setup ntfy --topic <secret-topic>
cooldown daemon start
cooldown daemon install
cooldown remind claude --in 5h
cooldown remind codex --at "15:30"
cooldown status
cooldown history
```

## If user hit Claude limit

Ask for the visible reset time if needed, then run one of:

```bash
cooldown remind claude --in 5h
cooldown remind claude --at "15:30"
```

## Auto-detect wrapper

For future sessions, suggest:

```bash
cooldown run claude
```

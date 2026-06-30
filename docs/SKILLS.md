# Skills and Plugins

Cooldown can integrate with Claude Code, Codex, Pi, and other agent terminals through skills/plugins.

## Rule

Skills are adapters, not the scheduler.

They should call the Cooldown CLI and let the daemon handle long-running reminders.

## Why

If the terminal closes:

```txt
agent stops → skill stops
```

But the daemon can continue:

```txt
reminder saved → terminal closes → daemon notifies later
```

## Skill Responsibilities

A Cooldown skill can:

- create manual reminders;
- check status;
- show history;
- test notifications;
- guide setup;
- call `cooldown run <provider>` when appropriate.

## Example Skill Commands

```bash
cooldown remind claude --in 5h
cooldown remind codex --at "15:30"
cooldown status
cooldown history
cooldown test telegram
```

## Suggested Packages

```txt
cooldown
cooldown-skill-claude
cooldown-skill-codex
cooldown-skill-pi
```

## Integration Priority

1. Standalone CLI
2. Daemon
3. Claude/Codex/Pi skills
4. Claude hooks / provider hooks
5. Full plugin distribution

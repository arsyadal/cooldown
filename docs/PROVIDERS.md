# Providers

Cooldown should start with manual reminders, then add provider-specific detection.

## MVP Providers

- Claude Code
- Codex CLI
- Pi coding agent

## Manual Provider Support

Manual support requires no parser:

```bash
cooldown update pi --reset "1 Jul 2026 1.10" --usage 89
cooldown remind claude --in 5h
cooldown remind codex --at "15:30"
```

## Auto-detection

```bash
cooldown run claude
cooldown run codex
cooldown run pi
cooldown run claude -- --model sonnet
```

Cooldown wraps the provider process, reads stdout/stderr, detects limit messages, stores a reminder, and stores usage percentage when the provider output includes one.

## Patterns to Detect

Initial keywords:

```txt
limit reached
usage limit
rate limit
try again
reset at
available at
cooldown
remaining
usage 83%
quota 80% used
```

## Reset Time Formats

Support common formats:

```txt
15:30
2:30 PM
in 5 hours
in 37 minutes
tomorrow at 9 AM
2026-06-30 14:30
1 Jul 2026 1.10
```

## Fallbacks

If a limit is detected but reset time is missing:

```txt
Limit detected, but reset time was not found.
Use: cooldown update pi --reset "1 Jul 2026 1.10" --usage 89
```

## Known Limitations

- Provider CLI output may change.
- Reset time may not always be explicit.
- Cooldown cannot know quota if it never saw a limit/status event.
- Cooldown must not store full prompts or source output by default.

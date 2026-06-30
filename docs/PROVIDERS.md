# Providers

Cooldown should start with manual reminders, then add provider-specific detection.

## MVP Providers

- Claude Code
- Codex CLI

## Manual Provider Support

Manual support requires no parser:

```bash
cooldown remind claude --in 5h
cooldown remind codex --at "15:30"
```

## Auto-detection

```bash
cooldown run claude
cooldown run codex
cooldown run claude -- --model sonnet
```

Cooldown wraps the provider process, reads stdout/stderr, detects limit messages, and stores a reminder.

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
```

## Fallbacks

If a limit is detected but reset time is missing:

```txt
Limit detected, but reset time was not found.
Use: cooldown remind claude --in 5h
```

## Known Limitations

- Provider CLI output may change.
- Reset time may not always be explicit.
- Cooldown cannot know quota if it never saw a limit/status event.
- Cooldown must not store full prompts or source output by default.

# CLI

## Setup

```bash
cooldown setup
cooldown setup ntfy --topic <secret-topic>
cooldown setup telegram --token <token> --chat-id <id>
```

Stores local config in `~/.cooldown/config.json`.

## Daemon

```bash
cooldown daemon start
cooldown daemon stop
cooldown daemon status
cooldown daemon install
cooldown daemon uninstall
```

`start` is enough for MVP. `install` can later register auto-start on login.

## Manual Reminder

```bash
cooldown remind <provider> --in <duration>
cooldown remind <provider> --at <time>
```

Examples:

```bash
cooldown remind claude --in 5h
cooldown remind codex --at "15:30"
cooldown remind codex --at "tomorrow 9am"
```

## Status

```bash
cooldown status
```

Example output:

```txt
Provider     Status    Reset At     Remaining
Claude Code  Limited   16:30 WIB    2h 11m
Codex        Ready     -            -
```

## History

```bash
cooldown history
cooldown history --provider claude
```

## Doctor

```bash
cooldown doctor
```

Checks config, ntfy, daemon, desktop notification command, and provider CLI availability.

## Test Notifications

```bash
cooldown test ntfy
cooldown test telegram
cooldown test desktop
```

## Run Provider Wrapper

```bash
cooldown run claude
cooldown run codex
cooldown run claude -- --model sonnet
```

This starts the provider CLI and watches output for limit/reset messages.

## Cancel Reminder

```bash
cooldown cancel <event_id>
```

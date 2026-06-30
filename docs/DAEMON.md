# Daemon

The daemon keeps reminders alive after the terminal closes.

## Responsibilities

- Load pending reminders from local storage.
- Send notifications when `reset_at` is reached.
- Mark reminders as notified.
- Recover pending reminders after restart.

## Commands

```bash
cooldown daemon start
cooldown daemon stop
cooldown daemon status
cooldown daemon install
cooldown daemon uninstall
```

## Runtime Behavior

`cooldown daemon start` runs a background process with a pid file.

Suggested files:

```txt
~/.cooldown/cooldown.pid
~/.cooldown/cooldown.log
```

`cooldown daemon install` registers auto-start on login:

| OS | Mechanism |
| --- | --- |
| macOS | LaunchAgent |
| Windows | Startup folder script |
| Linux | systemd user service |

## Failure Handling

If the daemon is not running and a reminder is created, the CLI should warn:

```txt
Reminder saved, but daemon is not running.
Start it with: cooldown daemon start
```

## Recovery

On startup, the daemon should check overdue pending reminders and notify immediately or mark them missed.

MVP default: notify immediately with copy that says the reset time has passed.

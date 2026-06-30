# Architecture

Cooldown has three layers:

```txt
Agent skill/plugin → cooldown CLI → cooldown daemon → storage → notifier
```

## Core Rule

The skill/plugin is not the scheduler.

If a terminal closes, Claude/Codex/Pi and their skills stop running. The daemon must own reminders and notifications so Cooldown still works after the agent session dies.

## Components

### Repo shape

Keep one core and thin adapters:

```txt
src/          # shared CLI logic
extensions/    # pi integration only
skills/        # one folder per host, no framework layer
```

If a new host is needed, add one skill folder and point it at the same CLI.

### CLI

User-facing command interface.

Examples:

```bash
cooldown remind claude --in 5h
cooldown status
cooldown test telegram
```

### Daemon

Background process that:

- reads pending reminders;
- waits until `reset_at`;
- sends notifications;
- updates reminder status.

### Storage

Local-first storage. Start with a JSON file or SQLite.

Suggested paths:

```txt
~/.cooldown/config.json
~/.cooldown/events.json
~/.cooldown/cooldown.log
```

### Notifiers

MVP:

- ntfy
- desktop notification
- terminal fallback

### Skills/plugins

Agent integrations only call the CLI. They do not run forever.
They should stay thin and reuse the same core commands, not duplicate scheduler logic.

Example:

```bash
cooldown remind claude --in 5h
cooldown status
```

## Flow

```txt
User/agent creates reminder
        ↓
CLI writes event to local storage
        ↓
Daemon sees pending event
        ↓
Terminal may close
        ↓
Daemon sends ntfy/desktop notification at reset time
```

## Later: auto-detect flow

```txt
cooldown run claude
        ↓
Cooldown wraps Claude process
        ↓
Parser detects limit/reset message
        ↓
CLI stores reminder
        ↓
Daemon notifies later
```

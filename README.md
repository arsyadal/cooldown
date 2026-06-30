# Cooldown

Get notified when your AI coding agent is ready again.

Cooldown is a local-first CLI notifier for developers using Claude Code, Codex CLI, and other agent terminals. Set a cooldown reminder, close the terminal, and still get a push notification when the agent should be usable again.

Cooldown does **not** bypass limits, scrape accounts, or store prompts/source code.

## Install

```bash
npm install -g cooldown
```

From source:

```bash
npm install
npm run build
npm link
```

## Quick start

Use a long random ntfy topic. Public `ntfy.sh` topics are readable by anyone who guesses the topic name.

```bash
cooldown setup ntfy --topic cooldown-$(node -e "console.log(crypto.randomUUID())")
cooldown test ntfy
cooldown daemon start
cooldown remind claude --in 5h
```

Check it:

```bash
cooldown status
cooldown history
cooldown doctor
```

Optional: start daemon on login:

```bash
cooldown daemon install
```

## Commands

```bash
cooldown setup ntfy --topic <secret-topic> [--server https://ntfy.sh]
cooldown setup telegram --token <token> --chat-id <id>

cooldown daemon start|stop|status|install|uninstall

cooldown remind claude --in 5h
cooldown remind codex --at "15:30"
cooldown cancel <event_id>

cooldown run claude
cooldown run codex
cooldown run claude -- --model sonnet

cooldown status
cooldown history
cooldown doctor
cooldown test ntfy|telegram|desktop
```

## Notifications

Default: **ntfy**.

Fallbacks:

- macOS desktop notification via `osascript`
- Linux desktop notification via `notify-send`
- Windows logs desktop notifications for now
- Telegram is optional

## Daemon install

| OS | Auto-start mechanism |
| --- | --- |
| macOS | LaunchAgent |
| Linux | systemd user service |
| Windows | Startup folder script |

## Privacy

Cooldown stores local reminder metadata in `~/.cooldown`:

- provider
- reset time
- status
- notification config

It does not store prompts, source code, Claude/Codex credentials, cookies, or AI provider API keys.

## Docs

- [PRD](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [CLI](docs/CLI.md)
- [Daemon](docs/DAEMON.md)
- [Notifications](docs/NOTIFICATIONS.md)
- [Providers](docs/PROVIDERS.md)
- [Skills](docs/SKILLS.md)
- [Testing](docs/TESTING.md)
- [Privacy](docs/PRIVACY.md)
- [Roadmap](docs/ROADMAP.md)
- [FAQ](docs/FAQ.md)

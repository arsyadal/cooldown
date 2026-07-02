# Cooldown

Get notified when your AI coding agent is ready again.

Cooldown is a local-first CLI notifier for developers using Claude Code, Codex CLI, and other agent terminals. Set a cooldown reminder, close the terminal, and still get a push notification when the agent should be usable again.

Cooldown does **not** bypass limits, scrape accounts, or store prompts/source code.

## Install

Recommended for **Windows / macOS / Linux**:

```bash
npm install -g @arsyadal/cooldown
```

No `curl` needed for the normal install path.

From source:

```bash
npm install
npm run build
npm link
```

Claude Code plugin

```bash
/plugin marketplace add arsyadal/cooldown
/plugin install cooldown@cooldown
```

Send those as two separate Claude Code prompts. From source:

```bash
/plugin marketplace add /path/to/cooldown
/plugin install cooldown@cooldown
```

Claude Code desktop has no `/plugin` command. Install from the UI: Customize, personal plugins, add from repository, then enter the repo URL.

The Claude Code plugin has two tiny Node.js lifecycle hooks. If `node` or `cooldown` is not on the non-interactive shell PATH, the `/cooldown` command and skill still work and the always-on status hook stays quiet.

Codex plugin

```bash
codex plugin marketplace add arsyadal/cooldown
codex plugin add cooldown@cooldown-repo
```

From source:

```bash
codex plugin marketplace add /path/to/cooldown
codex plugin add cooldown@cooldown-repo
```

In the Codex desktop app, open `/plugins`, select the Cooldown marketplace, install Cooldown, then open `/hooks`, review and trust the lifecycle hooks, and start a new thread.

The Codex plugin has two tiny Node.js lifecycle hooks. If `node` or `cooldown` is not on the non-interactive shell PATH, the skill still works and the always-on status hook stays quiet.

Pi agent harness

```bash
pi install git:github.com/arsyadal/cooldown
# or from source:
pi install /home/cads/cooldown
# then inside pi: /reload
```

## Quick start

Use a long random ntfy topic. Public `ntfy.sh` topics are readable by anyone who guesses the topic name.

```bash
cooldown setup ntfy --topic cooldown-$(node -e "console.log(crypto.randomUUID())")
cooldown test ntfy
cooldown daemon start
cooldown update pi --reset "15:30" --usage 94
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

cooldown update pi --reset "1 Jul 2026 1.10" --usage 89
cooldown remind claude --in 5h
cooldown remind codex --at "15:30"
cooldown cancel <event_id>

cooldown run claude
cooldown run codex
cooldown run pi
cooldown run claude -- --model sonnet

cooldown status
cooldown history
cooldown doctor
cooldown test ntfy|telegram|desktop

# inside Claude Code after installing the plugin:
/cooldown

# inside Codex after installing the plugin:
Ask "cooldown" or "show my cooldown status"

# inside pi after installing the package:
/cooldown
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
- detected usage percentage when provider output includes it
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

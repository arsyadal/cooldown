# Notifications

## MVP Channels

### ntfy

Primary channel for developer CLI users. It is simple, cross-device, and does not require bot setup or OAuth.

Setup:

```bash
cooldown setup ntfy --topic cooldown-$(node -e "console.log(crypto.randomUUID())")
cooldown test ntfy
```

Use a long random topic. Public `ntfy.sh` topics are readable by anyone who guesses the topic name.

Optional self-hosted server:

```bash
cooldown setup ntfy --topic <secret-topic> --server https://ntfy.example.com
```

### Telegram

Optional channel.

Setup:

```bash
cooldown setup telegram --token <token> --chat-id <id>
cooldown test telegram
```

### Desktop Notification

Local fallback for laptop users. macOS and Linux are supported in the CLI. Windows desktop notification is skipped for now and logs instead.

```bash
cooldown test desktop
```

Implementation can be platform-specific later.

### Terminal Fallback

If all notification channels fail, log to terminal/daemon log.

## Message Examples

### Ready

```txt
Cooldown: Claude Code is ready again.
Your cooldown should be over now.
```

### Reminder Created

```txt
Claude Code cooldown saved.
I’ll notify you at 16:30 WIB.
```

### Overdue After Daemon Restart

```txt
Codex cooldown time has passed.
Try continuing your coding session now.
```

## Later Channels

- Email
- Discord
- Slack
- Pushover
- Web Push

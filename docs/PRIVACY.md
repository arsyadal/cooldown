# Privacy

Cooldown is local-first.

## What Cooldown Stores

Cooldown stores reminder metadata only:

- provider name;
- detected time;
- reset time;
- notification status;
- notification channel config;
- optional raw matched limit phrase.

## What Cooldown Must Not Store

Cooldown must not store:

- source code;
- prompts;
- full agent output;
- Claude/Codex login credentials;
- session cookies;
- API keys for AI providers;
- terminal history.

Telegram bot token is stored only if the user enables Telegram notifications.

## Suggested Local Files

```txt
~/.cooldown/config.json
~/.cooldown/events.json
~/.cooldown/cooldown.log
```

Logs should avoid provider output by default.

## Safe Defaults

- Do not upload data.
- Do not run a backend.
- Do not save raw terminal output.
- Do not inspect files in the user project.
- Make verbose/debug logging opt-in.

## Positioning

Cooldown is not a bypass tool. It only reminds users when their cooldown/reset time should be over.

# FAQ

## Is Cooldown a limit bypass tool?

No. Cooldown only creates reminders and sends notifications. It does not bypass provider limits.

## Does Cooldown keep working after I close the terminal?

Yes, if the daemon is running. The skill/plugin can stop, but the daemon keeps the reminder.

## Can Cooldown read my quota automatically?

Not always. Phase 1 uses manual reminders. Phase 2 will detect limit/reset messages from wrapped CLI sessions when possible.

## What if Cooldown cannot detect reset time?

Use a manual reminder:

```bash
cooldown remind claude --in 5h
cooldown remind codex --at "15:30"
```

## Does Cooldown store my code or prompts?

No. It should only store cooldown metadata.

## Why not make it only a Claude/Codex/Pi skill?

Because skills die when the terminal or agent process closes. The daemon is needed for reliable notifications.

## Which notification channel should MVP use?

ntfy first. It is developer-friendly, works on phones, and avoids bot/OAuth setup.

## What package name should be used?

Use `cooldown` for consistency.

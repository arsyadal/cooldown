# Cooldown

Use when the user wants Pi/Claude/Codex agent CLI cooldown notifications.

## Rule

This skill is only an adapter. Call `cooldown`; do not implement scheduling inside the agent.

## Commands

```bash
cooldown doctor
cooldown setup ntfy --topic <secret-topic>
cooldown daemon start
cooldown daemon install
cooldown remind claude --in 5h
cooldown remind codex --at "15:30"
cooldown status
cooldown history
```

## Reminder

If the terminal closes, the skill stops. The Cooldown daemon keeps running and sends ntfy/desktop notifications.

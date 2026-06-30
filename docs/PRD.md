# PRD — Cooldown

**Tagline:** Get notified when your AI coding agent is ready again.

## Summary

Cooldown is a local-first notifier for developers who use AI coding agents such as Claude Code and Codex CLI. It tracks cooldown/reset reminders and sends a notification when the agent should be usable again.

## Problem

Developers hit usage limits while coding, then lose time checking terminals, dashboards, or status commands. The real problem is not the limit itself, but missing the moment when the agent is ready again.

## Target Users

- Developers using Claude Code, Codex CLI, Pi, or similar terminal agents.
- Indie hackers and full-stack developers relying on AI-assisted coding.
- Small teams that want lightweight reset reminders.

## Goals

- Create reset reminders manually.
- Keep reminders alive after the terminal closes.
- Notify through ntfy and desktop notification.
- Show current cooldown status.
- Later, detect limit messages from wrapped CLI sessions.

## Non-goals

Cooldown does not:

- bypass usage limits;
- automate account switching;
- scrape private dashboards aggressively;
- store prompts, source code, provider credentials, or session tokens;
- guarantee exact reset time when providers do not expose it.

## MVP Scope

Phase 1 focuses on the durable foundation:

- CLI commands.
- Local config.
- Local reminder storage.
- Background daemon.
- ntfy notification.
- Desktop notification fallback.
- Status command.
- Manual reminders.

Auto-detection from Claude/Codex output comes after this works.

## Acceptance Criteria

MVP is done when a user can:

```bash
cooldown setup ntfy --topic <secret-topic>
cooldown daemon start
cooldown remind claude --in 5h
cooldown status
```

Then close the terminal and still receive an ntfy push notification when the reminder expires.

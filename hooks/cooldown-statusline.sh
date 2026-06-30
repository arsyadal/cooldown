#!/bin/bash
# cooldown — statusline badge for Claude Code
# Shows [COOLDOWN] or [COOLDOWN: 3% ↻11:00] when data available.

command -v cooldown &>/dev/null || exit 0

# Try statusline first (has usage/reset data when available)
LINE=$(cooldown statusline 2>/dev/null | head -1)

if [ -n "$LINE" ]; then
  # Parse: "⏳ cooldown: claude 3% reset 11:00 (2h30m) auto"
  USAGE=$(printf '%s' "$LINE" | grep -oE '[0-9]{1,3}%' | head -1)
  RESET=$(printf '%s' "$LINE" | grep -oE 'reset [0-9]{1,2}:[0-9]{2}' | head -1 | sed 's/reset //')

  if [ -n "$USAGE" ] && [ -n "$RESET" ]; then
    printf '\033[38;5;39m[COOLDOWN: %s ↻%s]\033[0m' "$USAGE" "$RESET"
  elif [ -n "$USAGE" ]; then
    printf '\033[38;5;39m[COOLDOWN: %s]\033[0m' "$USAGE"
  else
    printf '\033[38;5;39m[COOLDOWN]\033[0m'
  fi
else
  # Installed but no active state — dim blue badge
  printf '\033[38;5;39m[COOLDOWN]\033[0m'
fi

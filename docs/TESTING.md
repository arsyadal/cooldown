# Testing

## Local Windows

Tested:

```bash
npm test
npm pack --dry-run
cooldown daemon install
cooldown daemon uninstall
```

Windows daemon install uses a Startup folder script.

## WSL/Linux

Tested on WSL Ubuntu:

```bash
npm test
cooldown daemon install
systemctl --user is-enabled cooldown.service
systemctl --user is-active cooldown.service
cooldown daemon uninstall
```

Result:

```txt
enabled
active
linux_uninstall_clean
```

Linux daemon install uses a systemd user service.

## macOS

Not locally tested here because this machine is Windows. CI runs `npm test` on `macos-latest`, including daemon install dry-run.

Real macOS install should be tested on a Mac before calling the daemon installer production-stable.

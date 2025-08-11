# Session Tracking - MOVED

Session tracking has been consolidated to improve organization.

## New Location
All session and tracking files have been moved to:
`.sdlc/10-project-tracking/`

Specifically:
- `session-state.json` → `.sdlc/10-project-tracking/config/session-state.json`
- Other tracking files → `.sdlc/10-project-tracking/iterations/current/`

## Path Configuration
The `path-config.json` has been updated to reflect the new locations.
All scripts using the path configuration will automatically use the new paths.

## Migration Date
Moved on: 2025-08-10
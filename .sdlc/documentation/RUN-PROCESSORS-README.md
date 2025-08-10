# Running Processors

## Quick Start
1. Update manifest: `cp processor-manifest-vs2.json .sdlc/05-backlog/A-accounts/master-view/processor-manifest.json`
2. Run pipeline: `./run-processor-pipeline.sh`

## What it does
- Reads processor sequence from manifest
- Executes each processor in order
- Logs everything to timestamped file
- Validates after each step

## Files
- Script: `run-processor-pipeline.sh`
- Manifest: `.sdlc/05-backlog/A-accounts/master-view/processor-manifest.json`
- Logs: `processor-run-[timestamp].log`

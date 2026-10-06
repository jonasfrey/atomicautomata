# Development

Use `deno task start` from the repository root. The native Deno server binds to
127.0.0.1 on port 8080 and serves the application and its WebSocket connection.
It needs no third-party server packages, certificates, or installation commands.
Stop it with Ctrl+C. Set `PORT=8081 deno task start` if port 8080 is occupied.

Use `deno task test` for server checks. The browser needs WebGL 2 and internet
access to the pinned libraries on deno.land and the highlighting scripts on cdnjs.
If the canvas is blank, check browser console errors and WebGL availability.
Recording requires browser MediaRecorder and canvas capture support.

The older UUID-named server and background-process scripts remain available for
legacy deployments. The standard start task uses `scripts/start.js`.

Human-authored requirements in `hgc/` are read-only for machines, as specified in
`AGENTS.md`. Implementation documentation belongs in `docs/`.

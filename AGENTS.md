# AGENTS.md — Jaiden

Jaiden es un **compañero de terminal** open source — no un agente de desarrollo.
CLI minimalista en Node + TypeScript que usa Ollama local con modelos chicos
(1.5B–3B, default `qwen2.5-coder:1.5b-instruct-q4_K_M`).

**Objetivo v0.1:** el CLI solo responde (prompt → respuesta). No agregar tools,
REPL ni historial hasta que se decida lo contrario; mantenerlo lo más simple posible.

## Comandos

El proyecto usa **pnpm** como package manager.

- Dev (REPL): `pnpm dev`
- Build: `pnpm build`
- Typecheck: `pnpm typecheck`
- Lint + format (Biome): `pnpm check`
- Lint + format con autofix: `pnpm check:write`

## Convenciones

- ESM (`type: "module"`), imports internos con extensión `.js`.
- Sin framework web; stdlib de Node + `fetch` nativo para Ollama.
- Toda respuesta al usuario y comentarios de UX en español.
- Seguridad: los comandos de shell **siempre** requieren confirmación del usuario
  (`confirm()` en `src/index.ts`). No agregar tools que ejecuten código sin
  pasar por esa confirmación.

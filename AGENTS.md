# AGENTS.md — Jaiden

Jaiden es un **compañero de terminal** open source — no un agente de desarrollo.
CLI minimalista en Node + TypeScript que usa Ollama local con modelos chicos
(1.5B–3B, default `qwen2.5:3b-instruct-q4_K_M`).

**Objetivo v0.1:** el CLI solo responde (prompt → respuesta) más una memoria
absurdamente simple: UN string en `~/.jaiden/memory.txt` que el propio modelo
reescribe al mezclar recuerdos nuevos (`--recuerda`). La memoria se pasa como
contexto en el chat normal, pero NO en el prompt de mezcla. Modos: `normal`,
`--fast` (modelo chiquito `FAST_MODEL`) y `--smart` (borrador + refinado, dos
pasadas). **Una sola herramienta**: `run_command` (src/tools.ts) — el modelo
pide ejecutar un comando, el usuario lo aprueba uno por uno. No agregar más
tools, REPL ni historial hasta que se decida lo contrario; mantenerlo lo más
simple posible.

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

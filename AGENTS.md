# AGENTS.md — Jaiden

Mini asistente de código open source, CLI en Node + TypeScript que usa Ollama local.

## Comandos

- Dev (REPL): `npm run dev`
- Build: `npm run build`
- Typecheck: `npm run typecheck`

## Convenciones

- ESM (`type: "module"`), imports internos con extensión `.js`.
- Sin framework web; stdlib de Node + `fetch` nativo para Ollama.
- Toda respuesta al usuario y comentarios de UX en español.
- Seguridad: los comandos de shell **siempre** requieren confirmación del usuario
  (`confirm()` en `src/index.ts`). No agregar tools que ejecuten código sin
  pasar por esa confirmación.

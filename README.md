# Jaiden 🤖

Tu **compañero de terminal** open source. Jaiden corre 100% en local con los modelos **chicos** de [Ollama](https://ollama.com) (1.5B–3B).

> **v0.1 — objetivo actual:** un CLI que responde, nada más.

## Requisitos

- Node.js >= 18
- [Ollama](https://ollama.com/download) corriendo (`ollama serve`)
- El modelo descargado: `ollama pull qwen2.5-coder:1.5b-instruct-q4_K_M`

## Instalación

```bash
pnpm install
pnpm build
pnpm link --global  # opcional: instala el comando `jaiden` globalmente
```

## Uso

```bash
jaiden "explicame qué es un closure en JS"
echo "tu texto" | jaiden
jaiden            # muestra ayuda
```

## Configuración

| Variable       | Default                  | Descripción                    |
| -------------- | ------------------------ | ------------------------------ |
| `OLLAMA_URL`   | `http://localhost:11434` | URL de la API de Ollama        |
| `JAIDEN_MODEL` | `qwen2.5-coder:1.5b-instruct-q4_K_M`     | Modelo a usar (chico, 1.5B–3B) |

## Estructura

```
src/
  index.ts   # CLI: toma el prompt (argv o stdin) y escupe la respuesta
  ollama.ts  # cliente mínimo de la API de Ollama (/api/generate, streaming NDJSON)
```

## Roadmap

- [x] Streaming de respuestas
- [ ] Chat interactivo (REPL) con historial
- [ ] Tools de archivos (`read_file`, `write_file`)
- [ ] Ejecutar comandos con confirmación
- [ ] Streaming de respuestas

## Licencia

MIT

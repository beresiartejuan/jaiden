# Jaiden 🤖

[![CI](https://github.com/beresiartejuan/jaiden/actions/workflows/ci.yml/badge.svg)](https://github.com/beresiartejuan/jaiden/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Tu **compañero de terminal** open source. Jaiden corre 100% en local con los modelos **chicos** de [Ollama](https://ollama.com) (1.5B–3B).

> **v0.1 — objetivo actual:** un CLI que responde, nada más.

## Requisitos

- Node.js >= 18
- [Ollama](https://ollama.com/download) corriendo (`ollama serve`)
- El modelo descargado: `ollama pull qwen2.5:3b-instruct-q4_K_M`

## Instalación

```bash
pnpm install
pnpm build
pnpm link --global  # opcional: instala el comando `jaiden` globalmente
```

## Uso

```bash
jaiden "explicame qué es un closure en JS"    # chat normal (con memoria como contexto)
jaiden --fast "pregunta rápida"               # modelo chiquito, respuesta directa
jaiden --smart "pregunta difícil"             # dos pasadas: borrador + refinado
echo "tu texto" | jaiden                      # chat por stdin
jaiden --recuerda "me gusta el mate"          # agrega un recuerdo a la memoria
jaiden --memoria                              # muestra la memoria actual
jaiden --olvida                               # borra toda la memoria
jaiden --help                                 # ayuda
```

## Modos

| Modo     | Cómo responde                                                     |
| -------- | ----------------------------------------------------------------- |
| normal   | Una pasada con `JAIDEN_MODEL`                                     |
| `--fast` | Una pasada con el modelo chiquito (`JAIDEN_FAST_MODEL`)           |
| `--smart`| Pasada 1: borrador (oculto) → pasada 2: se critica y streama final |

Cada modo imprime una cabecera (`🤖` / `⚡ fast` / `🧠 smart`) para saber en qué está.

## Memoria

Absurdamente simple: **un solo string** en `~/.jaiden/memory.txt`.

- `--recuerda "<dato>"`: el propio modelo recibe (memoria vieja + dato nuevo) y **reescribe** ese único string mezclando todo. La memoria vieja NO se le pasa al chat del merge como contexto de usuario; es input directo del prompt de mezcla.
- Chat normal: el string de memoria se antepone como contexto al prompt.
- Advertencia honesta: con modelos de 1.5B el "resumen" puede inventar detalles. Es parte del encanto.

## Configuración

| Variable            | Default                              | Descripción                    |
| ------------------- | ------------------------------------ | ------------------------------ |
| `OLLAMA_URL`        | `http://localhost:11434`             | URL de la API de Ollama        |
| `JAIDEN_MODEL`      | `qwen2.5:3b-instruct-q4_K_M`         | Modelo normal y modo `--smart` |
| `JAIDEN_FAST_MODEL` | `qwen2.5-coder:1.5b-instruct-q4_K_M` | Modelo del modo `--fast`       |

## Estructura

```
src/
  index.ts   # CLI: flags de memoria + chat (prompt → respuesta, streaming)
  ollama.ts  # cliente mínimo de la API de Ollama (/api/generate, streaming NDJSON)
  memory.ts  # memoria: un solo string en ~/.jaiden/memory.txt, mezclado por el modelo
```

## Roadmap

- [x] Streaming de respuestas
- [x] Memoria de un solo string (`--recuerda` / `--memoria` / `--olvida`)
- [ ] Chat interactivo (REPL) con historial
- [ ] Tools de archivos (`read_file`, `write_file`)
- [ ] Ejecutar comandos con confirmación
- [ ] Streaming de respuestas

## Licencia

MIT

# Jaiden 🤖

Mini asistente de código **open source** que corre 100% en local usando [Ollama](https://ollama.com). Chateá desde la terminal y dejá que el modelo ejecute comandos del proyecto (siempre te pide confirmación antes).

## Requisitos

- Node.js >= 18
- [Ollama](https://ollama.com/download) corriendo (`ollama serve`)
- Un modelo descargado, por ejemplo: `ollama pull qwen2.5-coder:7b`

## Instalación

```bash
npm install
npm run build
npm link         # opcional: instala el comando `jaiden` globalmente
```

## Uso

```bash
jaiden            # si hiciste npm link
# o
npm run dev       # modo desarrollo con tsx
```

Dentro del REPL, escribí en lenguaje natural. Ejemplo:

```
vos ▸ qué archivos hay en este proyecto?
jaiden ▸ quiere ejecutar: `ls -la`. ¿Permitir? [s/N] s
```

- El modelo nunca ejecuta nada sin tu confirmación (`s/N`).
- Escribí `salir` para terminar.

## Configuración

| Variable       | Default                     | Descripción                    |
| -------------- | --------------------------- | ------------------------------ |
| `OLLAMA_URL`   | `http://localhost:11434`    | URL de la API de Ollama        |
| `JAIDEN_MODEL` | `qwen2.5-coder:7b`          | Modelo a usar                  |

## Cómo funciona

1. Todo el historial del chat va a `/api/chat` de Ollama (sin streaming por ahora).
2. El system prompt le dice al modelo que para inspeccionar cosas devuelva un
   tool-call en JSON: `{"tool": "run_command", "command": "..."}`.
3. `src/tools.ts` parsea ese JSON, te pide confirmación y ejecuta con
   `child_process.exec` (timeout 30s, salida truncada a 8KB).
4. El resultado se devuelve al modelo y el loop sigue (máx. 5 comandos seguidos).

## Estructura

```
src/
  index.ts   # REPL + loop agente
  ollama.ts  # cliente de la API de Ollama
  tools.ts   # tool "run_command" (parseo + ejecución segura)
```

## Roadmap

- [ ] Streaming de respuestas
- [ ] Tools de archivos (`read_file`, `write_file`)
- [ ] Historial persistente entre sesiones

## Licencia

MIT

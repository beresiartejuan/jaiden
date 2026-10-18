import { exec } from "node:child_process";

// Única herramienta de Jaiden: ejecutar un comando de shell, SIEMPRE con
// aprobación del usuario. El modelo la pide devolviendo este JSON en su
// respuesta (una línea, sin comillas triples):
//   {"tool": "run_command", "command": "ls -la"}

export interface ToolCall {
  tool: "run_command";
  command: string;
}

/** Busca un tool-call en la respuesta completa del modelo. */
export function parseToolCall(text: string): ToolCall | null {
  const match = text.match(/\{\s*"tool"\s*:\s*"run_command"\s*,\s*"command"\s*:\s*"[^"]*"\s*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    if (parsed.tool === "run_command" && typeof parsed.command === "string") {
      return { tool: "run_command", command: parsed.command };
    }
  } catch {
    return null;
  }
  return null;
}

/** Crea el prompt listo con las instrucciones de la herramienta. */
export const TOOL_HINT = `Tenés UNA herramienta disponible: ejecutar un comando de shell.
Si necesitás mirar algo del sistema (listar archivos, ver versiones, leer un log),
respondé SOLAMENTE con este JSON en una línea y nada más:
{"tool": "run_command", "command": "<el comando>"}
Si no necesitás ejecutar nada, respondé normal. Nunca pidas comandos destructivos.

`;

const TIMEOUT_MS = 30_000;
const MAX_OUTPUT = 4_000;

/**
 * Ejecuta un comando YA aprobado por el usuario.
 * La aprobación NO sucede acá: el llamador debe haberla pedido antes.
 */
export function runCommand(command: string, cwd: string): Promise<string> {
  return new Promise((resolve) => {
    exec(command, { cwd, timeout: TIMEOUT_MS }, (err, stdout, stderr) => {
      let out = "";
      if (stdout) out += stdout;
      if (stderr) out += stderr;
      if (err && !out) out = `Error: ${err.message}`;
      if (out.length > MAX_OUTPUT) out = `${out.slice(0, MAX_OUTPUT)}\n...[truncado]`;
      resolve(out.trim() || "(sin salida)");
    });
  });
}

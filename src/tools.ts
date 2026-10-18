import { exec } from "node:child_process";

/**
 * Formato de tool-call que le pedimos al modelo:
 * ```json { "tool": "run_command", "command": "ls -la" } ```
 *
 * Extrae el primer bloque tool-call válido de la respuesta.
 */
export interface ToolCall {
  tool: "run_command";
  command: string;
}

export function parseToolCall(text: string): ToolCall | null {
  const match = text.match(/\{[\s\S]*?"tool"\s*:\s*"run_command"[\s\S]*?\}/);
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

const TIMEOUT_MS = 30_000;
const MAX_OUTPUT = 8_000;

/** Ejecuta un comando de shell y devuelve stdout+stderr truncados. */
export function runCommand(command: string, cwd: string): Promise<string> {
  return new Promise((resolve) => {
    exec(command, { cwd, timeout: TIMEOUT_MS }, (err, stdout, stderr) => {
      let out = `$ ${command}\n`;
      if (stdout) out += stdout;
      if (stderr) out += stderr;
      if (err && !stdout && !stderr) out += `Error: ${err.message}`;
      if (out.length > MAX_OUTPUT) out = out.slice(0, MAX_OUTPUT) + "\n...[truncado]";
      resolve(out.trim() || "(sin salida)");
    });
  });
}

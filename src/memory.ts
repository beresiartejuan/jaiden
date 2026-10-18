import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { chat } from "./ollama.js";

const MEMORY_DIR = path.join(os.homedir(), ".jaiden");
const MEMORY_FILE = path.join(MEMORY_DIR, "memory.txt");

/** Lee la memoria (un solo string). "" si no existe. */
export function readMemory(): string {
  try {
    return fs.readFileSync(MEMORY_FILE, "utf8").trim();
  } catch {
    return "";
  }
}

function writeMemory(memory: string): void {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
  fs.writeFileSync(MEMORY_FILE, memory, "utf8");
}

const MERGE_PROMPT = (
  memoria: string,
  nuevo: string,
) => `Sos la memoria de Jaiden, un pequeño compañero de terminal.

Tu única memoria completa es este texto:
"${memoria || "(vacía)"}"

Acabás de aprender algo nuevo sobre el usuario:
"${nuevo}"

Reescribí tu memoria como UN SOLO texto corto y coherente que integre todo lo que sabés (lo viejo y lo nuevo). No enumeres, no expliques, no agregues títulos: escribí solamente el texto de la memoria actualizada, en español.`;

/**
 * Agrega un recuerdo: el propio modelo mezcla la memoria vieja con el dato
 * nuevo y devuelve UN solo string, que reemplaza a la memoria completa.
 */
export async function remember(fact: string): Promise<string> {
  const current = readMemory();
  const merged = await chat(MERGE_PROMPT(current, fact), () => {});
  writeMemory(merged.trim());
  return merged.trim();
}

/** Borra la memoria completa. */
export function forget(): void {
  try {
    fs.unlinkSync(MEMORY_FILE);
  } catch {
    // no había nada que olvidar
  }
}

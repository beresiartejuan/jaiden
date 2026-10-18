#!/usr/bin/env node
import { chat, MODEL } from "./ollama.js";

// Jaiden v0.1: un CLI que responde, nada más.
// Uso: jaiden "tu pregunta"   (o pipéale texto por stdin)

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return "";
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8").trim();
}

async function main() {
  const prompt = process.argv.slice(2).join(" ").trim() || (await readStdin());

  if (!prompt || prompt === "--help" || prompt === "-h") {
    console.log(`Uso: jaiden "<pregunta>"`);
    console.log(`     echo "tu texto" | jaiden`);
    console.log(`\nModelo actual: ${MODEL} (configurable con JAIDEN_MODEL)`);
    process.exit(0);
  }

  try {
    await chat(prompt, (text) => process.stdout.write(text));
    process.stdout.write("\n");
  } catch (err) {
    console.error(`jaiden: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

main();

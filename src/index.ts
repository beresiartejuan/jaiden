#!/usr/bin/env node
import { forget, readMemory, remember } from "./memory.js";
import { chat, MODEL } from "./ollama.js";

// Jaiden v0.1: un CLI que responde, con una memoria absurdamente simple
// (un solo string en ~/.jaiden/memory.txt que el propio modelo reescribe).

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return "";
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8").trim();
}

function showHelp() {
  console.log(`Uso: jaiden "<pregunta>"          pregunta normal (usa la memoria)`);
  console.log(`     echo "texto" | jaiden        idem, con stdin`);
  console.log(`     jaiden --recuerda "<dato>"   agrega un recuerdo a la memoria`);
  console.log(`     jaiden --memoria             muestra la memoria actual`);
  console.log(`     jaiden --olvida              borra toda la memoria`);
  console.log(`\nModelo actual: ${MODEL} (configurable con JAIDEN_MODEL)`);
}

async function main() {
  const [flag, ...rest] = process.argv.slice(2);

  try {
    if (flag === "--recuerda") {
      const fact = rest.join(" ").trim();
      if (!fact) return showHelp();
      process.stdout.write("mezclando en la memoria");
      const merged = await remember(fact);
      process.stdout.write("\r                           \r");
      console.log(`🧠 memoria: "${merged}"`);
      return;
    }
    if (flag === "--memoria") {
      const memory = readMemory();
      console.log(memory ? `🧠 ${memory}` : "🧠 (no recuerdo nada todavía)");
      return;
    }
    if (flag === "--olvida") {
      forget();
      console.log("🧠 ya no recuerdo nada.");
      return;
    }
    if (flag === "--help" || flag === "-h") return showHelp();

    // Chat normal: la memoria va como contexto. (En --recuerda NO se le pasa.)
    const prompt = process.argv.slice(2).join(" ").trim() || (await readStdin());
    if (!prompt) return showHelp();
    const memory = readMemory();
    const context = memory
      ? `Tenés esta única memoria sobre el usuario: "${memory}".\n\n${prompt}`
      : prompt;
    await chat(context, (text) => process.stdout.write(text));
    process.stdout.write("\n");
  } catch (err) {
    console.error(`jaiden: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

main();

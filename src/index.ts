#!/usr/bin/env node
import { forget, readMemory, remember } from "./memory.js";
import { chat, FAST_MODEL, MODEL } from "./ollama.js";

// Jaiden v0.1: un CLI que responde, con una memoria absurdamente simple
// (un solo string en ~/.jaiden/memory.txt que el propio modelo reescribe).
// Modos: normal | --fast (modelo chiquito) | --smart (borrador + refinado).

type Mode = "normal" | "fast" | "smart";

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return "";
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8").trim();
}

/** Cabecera de una línea que dice en qué modo está Jaiden. */
function header(mode: Mode): string {
  switch (mode) {
    case "fast":
      return `⚡ fast · ${FAST_MODEL}`;
    case "smart":
      return `🧠 smart · ${MODEL} × 2 pasadas`;
    default:
      return `🤖 ${MODEL}`;
  }
}

function showHelp() {
  console.log(`Uso: jaiden [--fast|--smart] "<pregunta>"   pregunta (usa la memoria)`);
  console.log(`     echo "texto" | jaiden                  idem, con stdin`);
  console.log(`     jaiden --recuerda "<dato>"            agrega un recuerdo a la memoria`);
  console.log(`     jaiden --memoria                      muestra la memoria actual`);
  console.log(`     jaiden --olvida                       borra toda la memoria`);
  console.log(`\nModos:`);
  console.log(`     --fast    responde con el modelo chiquito (${FAST_MODEL})`);
  console.log(`     --smart   dos pasadas: borrador, luego se critica y refina`);
  console.log(`\nModelo normal: ${MODEL} (JAIDEN_MODEL) · fast: JAIDEN_FAST_MODEL`);
}

const REFINE_PROMPT = (pregunta: string, borrador: string) => `Pregunta del usuario:
"${pregunta}"

Tu primer borrador de respuesta fue:
"${borrador}"

Revisalo con ojo crítico: corregí lo que esté mal, sacá lo que sobre y mejorá la claridad. Escribí únicamente la respuesta final, sin explicar qué cambiaste.`;

const EXTRACT_PROMPT = (
  memoria: string,
  pregunta: string,
) => `Todo lo que sabés del usuario es este texto:
"${memoria}"

La pregunta del usuario es:
"${pregunta}"

Extraé ÚNICAMENTE los datos de la memoria que sirvan para responder esa pregunta. Reglas:
- Copiá los datos tal cual están, NO inventes ni agregues nada.
- Respondé solo con los datos útiles, en una sola línea.
- Si nada de la memoria sirve para esta pregunta, respondé exactamente: NADA_RELEVANTE`;

async function main() {
  const args = process.argv.slice(2);
  const [flag, ...rest] = args;

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

    // Modo de respuesta: las flags se sacan del prompt, el resto es la pregunta.
    const mode: Mode = args.includes("--smart")
      ? "smart"
      : args.includes("--fast")
        ? "fast"
        : "normal";
    const words = args.filter((w) => w !== "--fast" && w !== "--smart");
    const prompt = words.join(" ").trim() || (await readStdin());
    if (!prompt) return showHelp();

    // Chat: la memoria va como contexto. (En --recuerda NO se le pasa.)
    const memory = readMemory();
    const context = memory
      ? `Tenés esta única memoria sobre el usuario: "${memory}".\n\n${prompt}`
      : prompt;

    if (mode === "fast") {
      console.log(header("fast"));
      await chat(context, (t) => process.stdout.write(t), FAST_MODEL);
      process.stdout.write("\n");
      return;
    }

    if (mode === "smart") {
      console.log(header("smart"));

      // Pasada 0: extraer de la memoria solo lo que sirva para esta pregunta.
      let relevant = "";
      if (memory) {
        process.stdout.write("  🔎 buscando en la memoria");
        const extracted = await chat(EXTRACT_PROMPT(memory, prompt), () =>
          process.stdout.write("."),
        );
        process.stdout.write("\r                              \r");
        if (!extracted.includes("NADA_RELEVANTE")) {
          relevant = extracted.trim();
          console.log(`  🔎 memoria útil: "${relevant}"`);
        }
      }

      // El contexto para las pasadas: pregunta + solo los datos relevantes.
      const smartContext = relevant
        ? `Datos que tenés sobre el usuario: ${relevant}.\n\n${prompt}`
        : prompt;

      // Pasada 1: borrador, no se muestra (solo un indicador de vida).
      process.stdout.write("  ✏️  borrador");
      const draft = await chat(smartContext, () => process.stdout.write("."));
      process.stdout.write("\n  ✨ refinando\n");
      // Pasada 2: critica el borrador y streama la respuesta final.
      await chat(REFINE_PROMPT(smartContext, draft), (t) => process.stdout.write(t));
      process.stdout.write("\n");
      return;
    }

    console.log(header("normal"));
    await chat(context, (t) => process.stdout.write(t));
    process.stdout.write("\n");
  } catch (err) {
    console.error(`jaiden: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

main();

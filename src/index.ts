#!/usr/bin/env node
import * as readline from "node:readline";
import { chat, MODEL, type ChatMessage } from "./ollama.js";
import { parseToolCall, runCommand } from "./tools.js";

const SYSTEM_PROMPT = `Sos Jaiden, un mini asistente de código abierto que corre en la terminal.
Ayudás al usuario con su proyecto de código en el directorio actual.

Reglas:
- Respondé en el idioma del usuario, de forma concisa.
- Si necesitás inspeccionar algo (ver archivos, correr tests), pedí ejecutar UN comando
  incluyendo exactamente este JSON en tu respuesta:
  {"tool": "run_command", "command": "<el comando>"}
- Un solo comando por respuesta. Nada de comandos destructivos (rm -rf, git reset --hard).
- Si no necesitás un comando, respondé texto plano directamente.`;

const MAX_TOOL_STEPS = 5;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function confirm(question: string): Promise<boolean> {
  const answer = await ask(`${question} [s/N] `);
  return /^[sSíyY]$/.test(answer.trim());
}

async function main() {
  const cwd = process.cwd();
  console.log(`🤖 Jaiden (modelo: ${MODEL}) — directorio: ${cwd}`);
  console.log('Escribí "salir" para terminar.\n');

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT + `\nDirectorio de trabajo: ${cwd}` },
  ];

  while (true) {
    const input = (await ask("vos ▸ ")).trim();
    if (!input) continue;
    if (["salir", "exit", "quit"].includes(input.toLowerCase())) break;

    messages.push({ role: "user", content: input });

    // Loop agente: el modelo puede pedir comandos hasta responder texto final.
    let steps = 0;
    try {
      while (true) {
        process.stdout.write("jaiden ▸ pensando...\r");
        const reply = await chat(messages);
        process.stdout.write("                      \r");
        messages.push({ role: "assistant", content: reply });

        const call = parseToolCall(reply);
        if (!call) {
          console.log(`jaiden ▸ ${reply}\n`);
          break;
        }

        if (steps >= MAX_TOOL_STEPS) {
          console.log("jaiden ▸ demasiados comandos seguidos, corto el loop.\n");
          break;
        }

        const ok = await confirm(`jaiden ▸ quiere ejecutar: \`${call.command}\`. ¿Permitir?`);
        let result: string;
        if (ok) {
          result = await runCommand(call.command, cwd);
          console.log(result);
        } else {
          result = `El usuario rechazó ejecutar: ${call.command}`;
        }
        messages.push({ role: "user", content: `Resultado:\n${result}` });
        steps++;
      }
    } catch (err) {
      console.error(`jaiden ▸ ${err instanceof Error ? err.message : String(err)}\n`);
    }
  }

  console.log("jaiden ▸ ¡nos vemos!");
  rl.close();
}

main();

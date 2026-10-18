const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
// Jaiden usa modelos chicos de Ollama local. Default: qwen2.5-coder:1.5b.
export const MODEL = process.env.JAIDEN_MODEL ?? "qwen2.5-coder:1.5b-instruct-q4_K_M";

interface GenerateChunk {
  response?: string;
  done?: boolean;
}

/**
 * Envía un mensaje suelto al modelo de Ollama en modo streaming (NDJSON).
 * Cada token llega por `onChunk`; devuelve la respuesta completa al final.
 */
export async function chat(prompt: string, onChunk: (text: string) => void): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, prompt, stream: true }),
    });
  } catch {
    throw new Error(
      `No se pudo conectar con Ollama en ${OLLAMA_URL}. ¿Está corriendo? (ollama serve)`,
    );
  }

  if (!res.ok) throw new Error(`Error de Ollama (${res.status}): ${await res.text()}`);
  if (!res.body) throw new Error("Respuesta vacía del modelo.");

  let full = "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Ollama manda un JSON por línea; procesamos las líneas completas.
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const chunk = JSON.parse(line) as GenerateChunk;
      if (chunk.response) {
        full += chunk.response;
        onChunk(chunk.response);
      }
    }
  }

  return full.trim();
}

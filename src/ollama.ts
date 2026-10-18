const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
export const MODEL = process.env.JAIDEN_MODEL ?? "qwen2.5-coder:7b";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Envía el historial al modelo de Ollama y devuelve la respuesta completa. */
export async function chat(messages: ChatMessage[]): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages, stream: false }),
    });
  } catch {
    throw new Error(
      `No se pudo conectar con Ollama en ${OLLAMA_URL}. ¿Está corriendo? (ollama serve)`
    );
  }

  if (!res.ok) {
    throw new Error(`Error de Ollama (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as { message?: { content?: string } };
  const content = data.message?.content;
  if (!content) throw new Error("Respuesta vacía del modelo.");
  return content;
}

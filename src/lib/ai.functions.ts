import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";

type Payload = { system: string; prompt: string };

async function runModel({ system, prompt }: Payload) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this app.");

  const { createLovableAiGatewayProvider, AI_MODEL } = await import("./ai-gateway.server");
  const gateway = createLovableAiGatewayProvider(key);

  try {
    const result = streamText({
      model: gateway(AI_MODEL),
      system,
      prompt,
    });
    return await result.text;
  } catch (err) {
    const status = (err as { statusCode?: number; status?: number }).statusCode ??
      (err as { status?: number }).status;
    if (status === 429) throw new Error("The AI service is busy right now. Please try again in a moment.");
    if (status === 402) throw new Error("AI credits are exhausted. Please add credits in Lovable to continue.");
    if (status === 403) throw new Error("AI access is currently blocked for this workspace.");
    throw new Error((err as Error).message || "The AI request failed.");
  }
}

export const generateEmailAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const d = (input ?? {}) as {
      purpose?: string;
      recipient?: string;
      keyPoints?: string;
      tone?: string;
      senderName?: string;
    };
    return {
      purpose: String(d.purpose ?? "").slice(0, 2000),
      recipient: String(d.recipient ?? "").slice(0, 500),
      keyPoints: String(d.keyPoints ?? "").slice(0, 4000),
      tone: String(d.tone ?? "formal"),
      senderName: String(d.senderName ?? "").slice(0, 200),
    };
  })
  .handler(async ({ data }) =>
    runModel({
      system:
        "You are an expert workplace communication assistant. Write a complete, ready-to-send professional email. Start with a line 'Subject: ...', then the greeting, body and sign-off. Use natural prose (short paragraphs, bullets only where they genuinely help). Never use placeholders other than [Your name] when no sender name is given. Output plain text only.",
      prompt: [
        `Tone: ${data.tone}`,
        `Purpose: ${data.purpose || "(not specified)"}`,
        `Recipient / context: ${data.recipient || "(not specified)"}`,
        `Key points:\n${data.keyPoints || "(none given — infer sensibly from the purpose)"}`,
        `Sender name: ${data.senderName || "(unknown, use [Your name])"}`,
      ].join("\n\n"),
    }),
  );

export const generateResearchAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ({
    topic: String((input as { topic?: string })?.topic ?? "").slice(0, 12000),
  }))
  .handler(async ({ data }) =>
    runModel({
      system:
        "You are a rigorous research analyst. Given a topic, question or pasted article, produce a workplace research brief in plain text with exactly these uppercase section headings on their own lines: SUMMARY, KEY FINDINGS, INSIGHTS, RECOMMENDATIONS. SUMMARY is 3-5 sentences of prose. The other three sections are bullet points starting with '• '. Be specific and substantive; avoid filler. Flag anything time-sensitive as needing verification.",
      prompt: data.topic,
    }),
  );

export const generateAssistantAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const d = input as { prompt?: string; history?: { role: string; text: string }[] };
    return {
      prompt: String(d?.prompt ?? "").slice(0, 8000),
      history: Array.isArray(d?.history)
        ? d.history.slice(-10).map((m) => ({ role: String(m.role), text: String(m.text).slice(0, 4000) }))
        : [],
    };
  })
  .handler(async ({ data }) =>
    runModel({
      system:
        "You are a helpful, concise workplace productivity assistant. Give practical, specific advice tailored to the user's question. Use short paragraphs and numbered or bulleted steps where useful. Avoid generic filler and boilerplate disclaimers.",
      prompt: [
        ...data.history.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`),
        `User: ${data.prompt}`,
      ].join("\n\n"),
    }),
  );

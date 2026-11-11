import { NextResponse } from "next/server";
import { z } from "zod";
import { AiConfigError, AiProviderError, generateAnswer } from "@/lib/ai";
import { findChunk, retrieve } from "@/lib/knowledge";

const requestSchema = z.object({
  message: z.string().trim().min(1, "Please type a question.").max(500, "Questions are limited to 500 characters."),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .max(20)
    .default([]),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }
  const { message, history } = parsed.data;

  // Retrieval: use the previous student question too, so follow-ups like "and their link?" still match.
  const previousQuestion = [...history].reverse().find((t) => t.role === "user")?.content ?? "";
  const retrieved = retrieve(`${message} ${previousQuestion}`, 6);

  try {
    const result = await generateAnswer(retrieved, [...history.slice(-6), { role: "user", content: message }]);
    const sources = [...new Set(result.sources)]
      .map(findChunk)
      .filter((c) => c !== undefined)
      .map((c) => ({ id: c.id, category: c.category, origin: c.origin, text: c.text, url: c.url ?? null }));

    return NextResponse.json({
      answer: result.answer,
      category: result.category,
      answerable: result.answerable,
      sources,
      model: result.model,
    });
  } catch (error) {
    if (error instanceof AiConfigError) return NextResponse.json({ error: error.message }, { status: 503 });
    if (error instanceof AiProviderError) return NextResponse.json({ error: error.message }, { status: 502 });
    console.error(error);
    return NextResponse.json({ error: "Something went wrong while generating the answer." }, { status: 500 });
  }
}

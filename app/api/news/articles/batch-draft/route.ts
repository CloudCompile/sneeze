import { NextRequest, NextResponse } from "next/server";
import { extractErrorMessage, generateNewsAiText, isValidNewsAdminPassword } from "@/lib/news/server";

const MAX_TOPICS = 5;

interface BatchDraftRequest {
  adminPassword?: string;
  topics?: string[];
  audience?: string;
  tone?: string;
  length?: "short" | "medium" | "long";
}

function buildPrompt(topic: string, audience: string, tone: string, targetWords: number) {
  return `Write a high-quality draft news article in Markdown.
Output strict JSON with keys: title, excerpt, category, tags, read_time, body, fact_checks.

Constraints:
- Target audience: ${audience}.
- Tone: ${tone}.
- Target length: about ${targetWords} words.
- Topic: ${topic}.
- Use headings and short paragraphs.
- If uncertain about a claim, phrase cautiously.
- fact_checks should be an array of claims an editor should verify before publishing.`;
}

async function generateOneDraft(
  topic: string,
  audience: string,
  tone: string,
  targetWords: number,
) {
  const raw = await generateNewsAiText([
    {
      role: "system",
      content: "You are a newsroom writing assistant. Return valid JSON only. Do not include markdown code fences.",
    },
    { role: "user", content: buildPrompt(topic, audience, tone, targetWords) },
  ]);

  const jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  let parsed: {
    title?: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    read_time?: string;
    body?: string;
    fact_checks?: string[];
  };
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  return {
    topic,
    article: {
      title: parsed.title ?? topic,
      excerpt: parsed.excerpt ?? "",
      category: parsed.category ?? "Analysis",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      read_time: parsed.read_time ?? "6 min",
      body: parsed.body ?? "",
    },
    factChecks: Array.isArray(parsed.fact_checks) ? parsed.fact_checks : [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BatchDraftRequest;

    if (!isValidNewsAdminPassword(body.adminPassword)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const topics = (body.topics ?? [])
      .map((t) => (typeof t === "string" ? t.trim() : ""))
      .filter(Boolean)
      .slice(0, MAX_TOPICS);

    if (!topics.length) {
      return NextResponse.json({ error: "At least one topic is required" }, { status: 400 });
    }

    const audience = body.audience?.trim() || "General readers";
    const tone = body.tone?.trim() || "Crisp editorial";
    const targetWords = body.length === "short" ? 500 : body.length === "long" ? 1600 : 1000;

    const results = await Promise.allSettled(
      topics.map((topic) => generateOneDraft(topic, audience, tone, targetWords)),
    );

    const drafts = results.map((result, i) => {
      if (result.status === "fulfilled") return result.value;
      return { topic: topics[i], error: extractErrorMessage(result.reason, "Generation failed") };
    });

    return NextResponse.json({ drafts });
  } catch (err) {
    const message = extractErrorMessage(err, "Batch draft generation failed");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

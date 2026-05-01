import { NextRequest, NextResponse } from "next/server";
import { extractErrorMessage, generateWebDraft, isValidNewsAdminPassword } from "@/lib/news/server";

const ALLOWED_MODELS = ["sonar", "sonar-pro"] as const;
type SonarModel = (typeof ALLOWED_MODELS)[number];

interface WebDraftRequest {
  adminPassword?: string;
  topic?: string;
  audience?: string;
  tone?: string;
  length?: "short" | "medium" | "long";
  model?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as WebDraftRequest;

    if (!isValidNewsAdminPassword(body.adminPassword)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const topic = body.topic?.trim();
    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const model: SonarModel = ALLOWED_MODELS.includes(body.model as SonarModel)
      ? (body.model as SonarModel)
      : "sonar";

    const audience = body.audience?.trim() || "General readers";
    const tone = body.tone?.trim() || "Crisp editorial";
    const targetWords = body.length === "short" ? 500 : body.length === "long" ? 1600 : 1000;

    const prompt = `Write a high-quality draft news article grounded in the latest real-world information you can find. Output strict JSON with keys: title, excerpt, category, tags, read_time, body, fact_checks.

Constraints:
- Target audience: ${audience}.
- Tone: ${tone}.
- Target length: about ${targetWords} words.
- Topic: ${topic}.
- Use headings and short paragraphs.
- Cite specific facts, dates, and sources where possible — these will appear as citations.
- fact_checks should be an array of specific claims an editor should independently verify before publishing.`;

    const { text, citations } = await generateWebDraft(
      [
        {
          role: "system",
          content:
            "You are an investigative news journalist with access to current web information. Return valid JSON only. Do not include markdown code fences.",
        },
        { role: "user", content: prompt },
      ],
      model,
    );

    const jsonText = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
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
      throw new Error("AI returned invalid JSON — try again");
    }

    const factChecks = [
      ...(Array.isArray(parsed.fact_checks) ? parsed.fact_checks : []),
      ...citations.map((url) => `Verify source: ${url}`),
    ];

    return NextResponse.json({
      article: {
        title: parsed.title ?? topic,
        excerpt: parsed.excerpt ?? "",
        category: parsed.category ?? "Analysis",
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        read_time: parsed.read_time ?? "6 min",
        body: parsed.body ?? "",
      },
      factChecks,
      citations,
      model,
      generationSource: "web_search",
      requiresHumanApproval: true,
    });
  } catch (err) {
    const message = extractErrorMessage(err, "Web draft generation failed");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

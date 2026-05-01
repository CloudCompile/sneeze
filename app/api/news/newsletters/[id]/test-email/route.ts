import { NextRequest, NextResponse } from "next/server";
import { extractErrorMessage, getNewsServiceClient, isValidNewsAdminPassword } from "@/lib/news/server";
import { validateEmail, validateUUID } from "@/lib/validation";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!validateUUID(id)) {
      return NextResponse.json({ error: "Invalid newsletter ID" }, { status: 400 });
    }
    const body = (await request.json()) as { adminPassword?: string; to?: string };

    if (!isValidNewsAdminPassword(body.adminPassword)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const to = body.to?.trim();
    if (!to || !validateEmail(to)) {
      return NextResponse.json({ error: "A valid recipient email address is required" }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const from = process.env.NEWSLETTER_FROM_EMAIL;
    if (!resendApiKey || !from) {
      return NextResponse.json(
        { error: "RESEND_API_KEY and NEWSLETTER_FROM_EMAIL must be configured" },
        { status: 500 },
      );
    }

    const supabase = getNewsServiceClient();
    const { data: issue, error: issueError } = await supabase
      .from("newsletter_issues")
      .select("subject, html, text")
      .eq("id", id)
      .single();
    if (issueError) throw issueError;
    if (!issue) return NextResponse.json({ error: "Issue not found" }, { status: 404 });

    const testSubject = `[TEST] ${issue.subject}`;
    const testHtml = `<p style="background:#fffbe6;border:1px solid #f0c000;padding:8px 12px;font-family:sans-serif;font-size:13px;margin-bottom:16px"><strong>⚠ This is a test send — not delivered to subscribers.</strong></p>${issue.html}`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject: testSubject, html: testHtml }),
    });

    if (!response.ok) {
      const payload = await response.text();
      throw new Error(`Resend error: ${payload}`);
    }

    return NextResponse.json({ ok: true, to, subject: testSubject });
  } catch (err) {
    const message = extractErrorMessage(err, "Failed to send test email");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

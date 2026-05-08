import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const PROMPT = `You are an expert CAIE A-Level Mathematics tutor.
Analyse the question shown in the image and provide a clear, step-by-step worked solution.

Guidelines:
- Use clear numbered steps
- Show all working, including key intermediate calculations
- Explain the mathematical reasoning at each step
- Use standard A-Level notation
- Keep explanations concise but complete
- If the question has multiple parts, address each part separately
- End with a clear final answer

Format your response as plain text with clear step labels like "Step 1:", "Step 2:", etc.`;

export async function POST(request: NextRequest) {
  // Verify user is authenticated
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse request body
  let body: { question_id?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { question_id } = body;
  if (!question_id || typeof question_id !== "number") {
    return NextResponse.json({ error: "question_id is required" }, { status: 400 });
  }

  // Use service role key for DB operations (server-side only)
  const serviceSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );

  // Fetch the question
  const { data: question, error: fetchError } = await serviceSupabase
    .from("alevel_math_questions")
    .select("id, question_img, ai_explanation, component, topic, difficulty")
    .eq("id", question_id)
    .single();

  if (fetchError || !question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  // Return cached explanation if it exists
  if (question.ai_explanation) {
    return NextResponse.json({ explanation: question.ai_explanation });
  }

  // Parse question image URL
  let imgUrl: string | null = null;
  try {
    const arr = JSON.parse(question.question_img as string);
    imgUrl = Array.isArray(arr) && arr.length > 0 ? (arr[0] as string) : null;
  } catch {
    imgUrl = null;
  }

  if (!imgUrl) {
    return NextResponse.json(
      { error: "No question image available for this question." },
      { status: 422 }
    );
  }

  // Fetch image as base64
  let imageBase64: string;
  let mimeType: string;
  try {
    const imgRes = await fetch(imgUrl, {
      headers: { "User-Agent": "Uncooked-App/1.0" },
    });
    if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status}`);
    const contentType = imgRes.headers.get("content-type") ?? "image/png";
    mimeType = contentType.split(";")[0].trim();
    const buffer = await imgRes.arrayBuffer();
    imageBase64 = Buffer.from(buffer).toString("base64");
  } catch (err: unknown) {
    console.error("Failed to fetch question image:", err);
    return NextResponse.json(
      { error: "Failed to load question image for analysis." },
      { status: 500 }
    );
  }

  // Call Gemini
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      PROMPT,
      {
        inlineData: {
          mimeType: mimeType as "image/png" | "image/jpeg" | "image/webp",
          data: imageBase64,
        },
      },
    ]);

    const explanation = result.response.text();

    if (!explanation) {
      return NextResponse.json({ error: "No explanation generated." }, { status: 500 });
    }

    // Store in DB (non-blocking — don't fail the request if this fails)
    serviceSupabase
      .from("alevel_math_questions")
      .update({ ai_explanation: explanation })
      .eq("id", question_id)
      .then(({ error }) => {
        if (error) console.error("Failed to cache explanation:", error);
      });

    return NextResponse.json({ explanation });
  } catch (err: unknown) {
    console.error("Gemini API error:", err);
    return NextResponse.json(
      { error: "Failed to generate explanation. Please try again." },
      { status: 500 }
    );
  }
}

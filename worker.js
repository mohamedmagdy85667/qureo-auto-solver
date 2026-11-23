const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {...corsHeaders, "Content-Type": "application/json; charset=utf-8"}
  });
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, {headers: corsHeaders});
    if (url.pathname !== "/api/solve" || request.method !== "POST") {
      return json({error: "المسار غير موجود."}, 404);
    }

    let body;
    try { body = await request.json(); }
    catch { return json({error: "صيغة الطلب غير صحيحة."}, 400); }

    const language = body.language;
    const question = String(body.question || "").trim();
    if (!["Python", "JavaScript"].includes(language) || question.length < 3 || question.length > 12000) {
      return json({error: "اختر لغة صحيحة وأدخل سؤالًا بين 3 و12000 حرف."}, 400);
    }
    if (!env.ANSWERS || !env.GEMINI_API_KEY) {
      return json({error: "إعدادات الخادم غير مكتملة. راجع ملف README."}, 500);
    }

    const key = await sha256(language + "\n" + question);
    const cached = await env.ANSWERS.prepare(
      "SELECT answer FROM answers WHERE question_hash = ?"
    ).bind(key).first();

    if (cached) return json({answer: cached.answer, cached: true});

    const prompt = `أنت مساعد تعليمي متخصص في ${language}. حلّل السؤال التالي وأعطِ الإجابة المقترحة بدقة. إذا كان اختيارًا من متعدد فاذكر الاختيار الصحيح بوضوح. إذا كان سؤال كتابة كود فأعطِ الكود الصحيح. لا تخترع معلومات إذا كان السؤال ناقصًا؛ اطلب توضيحًا عند الضرورة. أجب بالعربية، واجعل الإجابة مباشرة ومختصرة.\n\nالسؤال:\n${question}`;

    const model = env.GEMINI_MODEL || "gemini-2.0-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    let aiResponse;
    try {
      aiResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{parts: [{text: prompt}]}],
          generationConfig: {temperature: 0.1, maxOutputTokens: 1200}
        })
      });
    } catch {
      return json({error: "تعذر الاتصال بخدمة الإجابة."}, 502);
    }

    const result = await aiResponse.json().catch(() => ({}));
    if (!aiResponse.ok) {
      return json({error: result.error?.message || "خدمة الذكاء الاصطناعي رفضت الطلب."}, 502);
    }
    const answer = result.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("\n").trim();
    if (!answer) return json({error: "لم تصل إجابة صالحة. جرّب صياغة السؤال مرة أخرى."}, 502);

    await env.ANSWERS.prepare(
      "INSERT OR IGNORE INTO answers (question_hash, language, question, answer, created_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(key, language, question, answer, new Date().toISOString()).run();

    return json({answer, cached: false});
  }
};

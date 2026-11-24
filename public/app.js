const $ = (id) => document.getElementById(id);
$("year").textContent = new Date().getFullYear();

$("solveBtn").addEventListener("click", async () => {
  const language = $("language").value;
  const question = $("question").value.trim();
  if (!question) {
    $("question").focus();
    return;
  }

  $("solveBtn").disabled = true;
  $("btnText").textContent = "جارٍ تحليل السؤال...";
  $("spinner").hidden = false;
  $("resultPanel").hidden = true;

  try {
    const response = await fetch("/api/solve", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({language, question})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "تعذر إكمال الطلب.");
    $("answer").textContent = data.answer;
    $("cacheNote").textContent = data.cached
      ? "تم استخدام إجابة محفوظة لهذا السؤال."
      : "تم إنشاء إجابة جديدة.";
    $("resultPanel").hidden = false;
  } catch (error) {
    $("answer").textContent = error.message || "حدث خطأ غير متوقع.";
    $("cacheNote").textContent = "تأكد من إعداد Worker ومفتاح Gemini وقاعدة البيانات.";
    $("resultPanel").hidden = false;
  } finally {
    $("solveBtn").disabled = false;
    $("btnText").textContent = "حل السؤال";
    $("spinner").hidden = true;
  }
});

$("copyBtn").addEventListener("click", async () => {
  await navigator.clipboard.writeText($("answer").textContent);
  $("copyBtn").textContent = "تم النسخ";
  setTimeout(() => $("copyBtn").textContent = "نسخ", 1400);
});

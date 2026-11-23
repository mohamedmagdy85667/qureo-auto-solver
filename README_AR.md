# QUREO AUTO SOLVER — Mohamed Magdy

هذا مشروع بداية قابل للنشر على Cloudflare Workers مع واجهة عربية، ومساعد أسئلة Python وJavaScript، وتخزين مشترك للإجابات المتطابقة في Cloudflare D1.

## مهم قبل الاستخدام
- هذا الإصدار **لا يسجّل الدخول إلى QUREO** ولا يطلب كلمات مرور المستخدمين ولا يتصفح المنصة أو يرسل إجابات إليها.
- المستخدم يلصق نص السؤال بنفسه؛ الأداة تعرض إجابة مقترحة للمساعدة في التعلم.
- لا يحتوي هذا الإصدار بعد على نظام حسابات موثّق، أو حد 10 أسئلة لكل حساب، أو 1000 كود تفعيل. هذه الميزات تحتاج مصادقة خادم موثوقة وإدارة أكواد قبل إطلاقها؛ عدّاد المتصفح وحده يمكن التحايل عليه.
- Gemini API لديه حدود مجانية متغيرة وقد تتطلب بعض الاستخدامات تفعيل الفوترة. راجع شروط Google الحالية.

## المتطلبات
حساب Cloudflare، وNode.js، وWrangler، ومفتاح Gemini API من Google AI Studio.

## النشر (من كمبيوتر)
1. فك ضغط الملف.
2. افتح مجلد المشروع في الطرفية.
3. ثبّت Wrangler: `npm install -g wrangler`
4. سجّل الدخول: `wrangler login`
5. أنشئ قاعدة D1: `wrangler d1 create qureo-answers`
6. انسخ `database_id` الذي يظهر لك وضعه مكان `REPLACE_WITH_YOUR_D1_DATABASE_ID` في `wrangler.toml`.
7. أنشئ الجدول: `wrangler d1 execute qureo-answers --remote --file=./schema.sql`
8. أضف مفتاح Gemini كسرّ على الخادم: `wrangler secret put GEMINI_API_KEY`
9. انشر: `wrangler deploy`

## فتح الموقع
بعد النشر سيظهر لك رابط Worker من Cloudflare. افتحه لاختبار الموقع.

## تعديل الاسم
اسم `Mohamed Magdy` موجود في الواجهة ويمكن تغييره من `public/index.html`.

## ملاحظة عن رفع ZIP
هذا المشروع ليس ملف HTML ساكنًا فقط؛ لأنه يحتاج Worker وD1 لحفظ الإجابات وإخفاء مفتاح API. لذلك لا يكفي رفع ZIP إلى Pages Direct Upload وحده. اتبع خطوات Wrangler أعلاه.

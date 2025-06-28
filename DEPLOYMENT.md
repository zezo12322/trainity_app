# دليل النشر للنسخة التجريبية الأونلاين 🚀

## 🌐 خيارات النشر المتاحة:

### 1. **Vercel (الأسرع والأسهل)**

#### التحضير:
```bash
# تثبيت Vercel CLI
npm install -g vercel

# تسجيل الدخول
vercel login
```

#### النشر:
```bash
# بناء التطبيق للويب
npm run build:web-static

# النشر
npm run deploy:vercel
```

#### الرابط النهائي:
```
https://life-makers-pirates-demo.vercel.app
```

---

### 2. **Netlify**

#### التحضير:
```bash
# تثبيت Netlify CLI
npm install -g netlify-cli

# تسجيل الدخول
netlify login
```

#### النشر:
```bash
# بناء التطبيق
npm run build:web-static

# النشر
netlify deploy --prod --dir=web-build
```

---

### 3. **Expo Snack (للتجربة السريعة)**

#### الخطوات:
1. اذهب إلى [snack.expo.dev](https://snack.expo.dev)
2. أنشئ مشروع جديد
3. انسخ الكود من `App.tsx`
4. أضف التبعيات من `package.json`
5. شارك الرابط

---

### 4. **GitHub Pages**

#### إعداد GitHub Actions:
```yaml
# الملف موجود في .github/workflows/deploy.yml
# يتم النشر تلقائياً عند push للـ main branch
```

#### الرابط النهائي:
```
https://username.github.io/life-makers-pirates
```

---

## 🔧 **إعدادات البيئة:**

### متغيرات البيئة المطلوبة:
```env
EXPO_PUBLIC_SUPABASE_URL=https://dkijutqfdhaviyymulvs.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### إعداد Vercel:
```bash
# إضافة متغيرات البيئة
vercel env add EXPO_PUBLIC_SUPABASE_URL
vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY
```

---

## 📱 **اختبار النسخة المحلية:**

### تشغيل النسخة المحلية:
```bash
# تشغيل للويب
npm run web

# أو
npx expo start --web
```

### بناء واختبار النسخة النهائية:
```bash
# بناء للويب
npm run build:web-static

# اختبار النسخة المبنية
npm run preview:web
```

---

## 🎯 **نصائح للنشر الناجح:**

### 1. **تحسين الأداء:**
- ✅ ضغط الصور والأصول
- ✅ تقليل حجم الحزم
- ✅ استخدام lazy loading

### 2. **الأمان:**
- ✅ استخدام متغيرات البيئة
- ✅ عدم تضمين مفاتيح سرية في الكود
- ✅ تفعيل HTTPS

### 3. **SEO والوصولية:**
- ✅ إضافة meta tags
- ✅ دعم screen readers
- ✅ تحسين سرعة التحميل

---

## 🔍 **استكشاف الأخطاء:**

### مشاكل شائعة وحلولها:

#### خطأ في البناء:
```bash
# تنظيف cache
npx expo install --fix
rm -rf node_modules
npm install
```

#### مشاكل في الشبكة:
```bash
# التحقق من اتصال Supabase
curl -I https://dkijutqfdhaviyymulvs.supabase.co
```

#### مشاكل في الأذونات:
```bash
# التحقق من صحة المفاتيح
echo $EXPO_PUBLIC_SUPABASE_ANON_KEY
```

---

## 📊 **مراقبة الأداء:**

### أدوات المراقبة:
- **Vercel Analytics:** مدمج تلقائياً
- **Google Analytics:** يمكن إضافته
- **Sentry:** لتتبع الأخطاء

### مؤشرات الأداء المهمة:
- ⚡ سرعة التحميل الأولي
- 📱 استجابة التطبيق
- 🔄 معدل الأخطاء
- 👥 عدد المستخدمين النشطين

---

## 🎉 **النشر الناجح!**

بعد النشر الناجح، ستحصل على:
- 🌐 رابط مباشر للتطبيق
- 📱 QR Code للوصول السريع
- 📊 لوحة تحكم للمراقبة
- 🔄 تحديثات تلقائية

---

## 📞 **الدعم الفني:**

إذا واجهت أي مشاكل في النشر:
- 📧 البريد الإلكتروني: support@lifemakers.org
- 💬 Discord: [رابط الخادم]
- 📱 WhatsApp: +20 123 456 7890

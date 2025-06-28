# دليل البدء السريع - Life Makers Pirates

## 🚀 التشغيل السريع

### 1. المتطلبات الأساسية
```bash
# تأكد من تثبيت Node.js 18+
node --version

# تثبيت Expo CLI
npm install -g @expo/cli
```

### 2. إعداد المشروع
```bash
# تثبيت التبعيات
npm install

# نسخ ملف البيئة
cp .env.example .env

# تحديث متغيرات البيئة في .env
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_supabase_key
```

### 3. إعداد قاعدة البيانات
1. إنشاء مشروع جديد في [Supabase](https://supabase.com)
2. تنفيذ SQL commands من ملف `supabase-setup.md`
3. تحديث `src/services/supabase.ts` بالمعلومات الصحيحة

### 4. تشغيل التطبيق
```bash
# تشغيل في وضع التطوير
npm start

# تشغيل على الأندرويد
npm run android

# تشغيل على iOS
npm run ios
```

## 📱 اختبار التطبيق

### استخدام Expo Go
1. تثبيت تطبيق Expo Go على هاتفك
2. مسح QR code الذي يظهر في Terminal
3. التطبيق سيفتح تلقائياً

### بيانات تجريبية
```sql
-- مستخدمين تجريبيين
INSERT INTO users (id, email, full_name, role, province) VALUES
('test-manager', 'manager@test.com', 'أحمد المدير', 'TRAINER_PREPARATION_PROJECT_MANAGER', 'الرياض'),
('test-supervisor', 'supervisor@test.com', 'فاطمة المشرفة', 'PROGRAM_SUPERVISOR', 'مكة المكرمة');

-- طلبات تجريبية
INSERT INTO training_requests (title, requester_id, province, center, requested_date) VALUES
('تدريب تجريبي', 'test-supervisor', 'الرياض', 'المركز الرئيسي', '2025-07-01');
```

## 🔧 الميزات الرئيسية

### ✅ تم التنفيذ
- [x] نظام المصادقة مع Supabase
- [x] إدارة طلبات التدريب
- [x] نظام التنقل متعدد الشاشات
- [x] دعم اللغتين العربية والإنجليزية
- [x] دعم RTL كامل
- [x] نظام العمل دون اتصال
- [x] التخزين المؤقت الذكي
- [x] واجهات مستخدم حديثة

### 🚧 قيد التطوير
- [ ] نظام المحادثات الفوري
- [ ] الإشعارات Push
- [ ] تحميل الملفات
- [ ] التقارير المتقدمة
- [ ] نظام التقييمات

## 📋 الشاشات المتاحة

1. **تسجيل الدخول** - مصادقة المستخدمين
2. **لوحة التحكم** - نظرة عامة وإحصائيات
3. **طلبات التدريب** - إدارة الطلبات
4. **التقويم** - جدولة الأحداث
5. **المحادثات** - التواصل بين الفرق
6. **الملف الشخصي** - إدارة المعلومات الشخصية
7. **التحليلات** - تقارير ومؤشرات الأداء

## 🎨 التخصيص

### الألوان
```typescript
// src/constants/index.ts
export const COLORS = {
  primary: '#1E40AF',    // الأزرق الأساسي
  secondary: '#7C3AED',  // البنفسجي
  success: '#10B981',    // الأخضر
  warning: '#F59E0B',    // الأصفر
  error: '#EF4444',      // الأحمر
};
```

### الخطوط والأحجام
```typescript
export const SIZES = {
  h1: 32, h2: 24, h3: 20, h4: 18, h5: 16, h6: 14,
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};
```

## 🔐 الأمان

### Row Level Security (RLS)
- تم تفعيل RLS على جميع الجداول
- سياسات أمان متقدمة
- تشفير البيانات الحساسة

### المصادقة
- JWT tokens آمنة
- تجديد تلقائي للجلسات
- حماية من CSRF

## 📊 المراقبة

### الأداء
```bash
# فحص الأداء
npm run test:performance

# تحليل Bundle
npx expo export --dump-assetmap
```

### الأخطاء
- تتبع الأخطاء تلقائياً
- تقارير مفصلة
- إشعارات فورية

## 🚀 النشر

### Development Build
```bash
# إنشاء development build
eas build --profile development --platform android
```

### Production Build
```bash
# إنشاء production build
eas build --profile production --platform all
```

### النشر على المتاجر
```bash
# نشر على Google Play
eas submit --platform android

# نشر على App Store
eas submit --platform ios
```

## 🆘 استكشاف الأخطاء

### مشاكل شائعة

**خطأ في Metro Bundler:**
```bash
npx expo start --clear
```

**مشاكل في التبعيات:**
```bash
rm -rf node_modules
npm install
```

**خطأ في Supabase:**
- تحقق من URL و API Key
- تأكد من تفعيل RLS
- راجع سياسات الأمان

### الحصول على المساعدة
- 📧 البريد الإلكتروني: support@lifemakerspirates.com
- 💬 Discord: [رابط الخادم]
- 📱 WhatsApp: [رقم الدعم]
- 🐛 GitHub Issues: [رابط المشروع]

## 📚 موارد إضافية

- [وثائق Expo](https://docs.expo.dev/)
- [وثائق Supabase](https://supabase.com/docs)
- [وثائق React Native](https://reactnative.dev/docs/getting-started)
- [دليل TypeScript](https://www.typescriptlang.org/docs/)

---

**ملاحظة:** هذا المشروع في مرحلة التطوير النشط. يرجى مراجعة التحديثات بانتظام.

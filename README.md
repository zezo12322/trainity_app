# Life Makers Pirates Training Management App

تطبيق إدارة التدريب لبرنامج "Life Makers Pirates" - منصة شاملة لإدارة طلبات التدريب والجدولة والمحادثات والتحليلات.

## المميزات الرئيسية

### 🎯 إدارة طلبات التدريب
- إنشاء وإدارة طلبات التدريب
- نظام موافقات متعدد المراحل
- تتبع حالة الطلبات
- تعيين المدربين

### 📅 نظام التقويم
- عرض الأحداث والتدريبات
- جدولة الفعاليات
- تذكيرات وإشعارات

### 💬 نظام المحادثات
- محادثات فردية وجماعية
- إرسال الرسائل والملفات
- إشعارات فورية

### 📊 التحليلات والتقارير
- إحصائيات شاملة
- تقارير الأداء
- مؤشرات الجودة

### 🌐 دعم متعدد اللغات
- العربية والإنجليزية
- دعم كامل للـ RTL
- واجهات متكيفة

### 📱 العمل دون اتصال
- تخزين الإجراءات محلياً
- مزامنة تلقائية عند عودة الاتصال
- تخزين مؤقت ذكي

## التقنيات المستخدمة

- **React Native** - إطار العمل الأساسي
- **Expo** - منصة التطوير والنشر
- **TypeScript** - لغة البرمجة
- **Supabase** - قاعدة البيانات والمصادقة
- **Zustand** - إدارة الحالة
- **React Navigation** - التنقل
- **React Native Calendars** - التقويم
- **i18next** - الترجمة
- **AsyncStorage** - التخزين المحلي

## متطلبات النظام

- Node.js 18+ 
- npm أو yarn
- Expo CLI
- Android Studio (للأندرويد)
- Xcode (للـ iOS)

## التثبيت والإعداد

### 1. استنساخ المشروع
```bash
git clone <repository-url>
cd life-makers-pirates
```

### 2. تثبيت التبعيات
```bash
npm install
```

### 3. إعداد Supabase
1. إنشاء مشروع جديد في [Supabase](https://supabase.com)
2. تنفيذ SQL commands من ملف `supabase-setup.md`
3. تحديث متغيرات البيئة في `src/services/supabase.ts`

### 4. تشغيل التطبيق
```bash
# تشغيل في وضع التطوير
npm start

# تشغيل على الأندرويد
npm run android

# تشغيل على iOS
npm run ios

# تشغيل على الويب
npm run web
```

## هيكل المشروع

```
src/
├── components/          # المكونات القابلة لإعادة الاستخدام
├── screens/            # شاشات التطبيق
├── navigation/         # إعدادات التنقل
├── services/           # الخدمات والـ APIs
├── stores/             # إدارة الحالة (Zustand)
├── types/              # تعريفات TypeScript
├── constants/          # الثوابت والإعدادات
├── hooks/              # Custom Hooks
├── utils/              # الوظائف المساعدة
└── locales/            # ملفات الترجمة
```

## الشاشات الرئيسية

### 🏠 لوحة التحكم
- نظرة عامة على الإحصائيات
- الإجراءات السريعة
- الطلبات الحديثة

### 📋 طلبات التدريب
- قائمة الطلبات
- تصفية وبحث
- إدارة الحالات

### 📅 التقويم
- عرض شهري/أسبوعي/يومي
- إدارة الأحداث
- جدولة التدريبات

### 💬 المحادثات
- قائمة المحادثات
- إرسال الرسائل
- إشعارات فورية

### 👤 الملف الشخصي
- المعلومات الشخصية
- الإعدادات
- تغيير اللغة

### 📊 التحليلات
- إحصائيات شاملة
- مؤشرات الأداء
- تقارير مرئية

## الأدوار والصلاحيات

### مدير مشروع إعداد المدربين
- إدارة جميع طلبات التدريب
- الموافقة النهائية
- عرض جميع التقارير

### مشرف البرنامج
- مراجعة الطلبات
- تعيين المدربين
- متابعة التنفيذ

### مسؤول إدارة التنمية
- إنشاء طلبات التدريب
- متابعة الحالة
- التواصل مع الفريق

### مسؤول تنمية المحافظة
- إدارة طلبات المحافظة
- التنسيق المحلي
- التقارير الإقليمية

## النشر

### بناء التطبيق للإنتاج
```bash
# بناء للأندرويد
expo build:android

# بناء للـ iOS
expo build:ios

# استخدام EAS Build (الطريقة الحديثة)
npm install -g eas-cli
eas build:configure
eas build --platform all
```

### النشر على المتاجر
```bash
# نشر على Google Play
eas submit --platform android

# نشر على App Store
eas submit --platform ios
```

## المساهمة

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى البranch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## الاختبار

```bash
# تشغيل الاختبارات
npm test

# تشغيل الاختبارات مع التغطية
npm run test:coverage

# اختبار الأداء
npm run test:performance
```

## استكشاف الأخطاء

### مشاكل شائعة

1. **خطأ في الاتصال بـ Supabase**
   - تأكد من صحة URL و API Key
   - تحقق من إعدادات الشبكة

2. **مشاكل في التنقل**
   - تأكد من تثبيت react-navigation
   - تحقق من إعدادات الـ linking

3. **مشاكل في الترجمة**
   - تأكد من وجود ملفات الترجمة
   - تحقق من إعدادات i18next

## الدعم

للحصول على المساعدة:
- فتح issue في GitHub
- مراجعة الوثائق
- التواصل مع فريق التطوير

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## الشكر والتقدير

- فريق Life Makers Pirates
- مجتمع React Native
- مطوري Supabase
- جميع المساهمين في المشروع
#   t r a i n i t y _ a p p  
 
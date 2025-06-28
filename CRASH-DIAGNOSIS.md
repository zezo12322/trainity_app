# 🔧 تشخيص مشاكل تعطل التطبيق

## 🚨 **المشكلة: التطبيق يخرج عند الفتح**

---

## 🔍 **الأسباب المحتملة والحلول:**

### **1. مشاكل في قاعدة البيانات:**

#### **السبب:**
- خطأ في الاتصال بـ Supabase
- مشاكل في جلب بيانات المستخدم
- جداول غير موجودة

#### **الحل:**
```bash
# تحقق من متغيرات البيئة
echo $EXPO_PUBLIC_SUPABASE_URL
echo $EXPO_PUBLIC_SUPABASE_ANON_KEY

# أو في Windows
echo %EXPO_PUBLIC_SUPABASE_URL%
echo %EXPO_PUBLIC_SUPABASE_ANON_KEY%
```

#### **التحقق من Supabase:**
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. تأكد من أن المشروع نشط
3. تحقق من وجود جدول `profiles`
4. تأكد من صحة API Keys

---

### **2. مشاكل في RTL/اللغة:**

#### **السبب:**
- `I18nManager.forceRTL()` يسبب إعادة تشغيل على أندرويد
- مشاكل في تحميل ملفات الترجمة

#### **الحل المطبق:**
- ✅ تم إزالة `forceRTL()` من الكود
- ✅ تم إضافة معالجة أخطاء للـ RTL
- ✅ تم تبسيط عملية تحميل اللغة

---

### **3. مشاكل في AsyncStorage:**

#### **السبب:**
- مشاكل في قراءة/كتابة البيانات المحفوظة
- تضارب في البيانات المخزنة

#### **الحل:**
```javascript
// مسح البيانات المخزنة
import AsyncStorage from '@react-native-async-storage/async-storage';

const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('Storage cleared');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};
```

---

### **4. مشاكل في التبعيات:**

#### **السبب:**
- تبعيات غير متوافقة
- مشاكل في Metro bundler

#### **الحل:**
```bash
# تنظيف شامل
rm -rf node_modules
rm package-lock.json
npm install

# تنظيف Metro cache
npx expo start --clear

# أو
npx react-native start --reset-cache
```

---

## 🛠️ **خطوات التشخيص:**

### **الخطوة 1: تشغيل في وضع التطوير**
```bash
# تشغيل مع Expo Go للحصول على تفاصيل الأخطاء
npx expo start

# امسح QR Code وشاهد الأخطاء في Expo Go
```

### **الخطوة 2: فحص Logs**
```bash
# Android
adb logcat | grep -i expo

# أو استخدم Flipper
npx react-native log-android
```

### **الخطوة 3: اختبار مكونات منفصلة**
```javascript
// في App.tsx - اختبار تدريجي
export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Test App</Text>
    </View>
  );
}
```

---

## 🔧 **الإصلاحات المطبقة:**

### **✅ تم إصلاحها:**

#### **1. مشاكل Supabase:**
- استخدام `.maybeSingle()` بدلاً من `.single()`
- إضافة معالجة أخطاء شاملة
- تبسيط اختبار الاتصال

#### **2. مشاكل RTL:**
- إزالة `I18nManager.forceRTL()`
- إضافة try-catch للـ RTL operations
- تقييد RTL updates للويب فقط

#### **3. مشاكل Auth Store:**
- إضافة معالجة أخطاء في `initialize()`
- استخدام `maybeSingle()` في جميع الاستعلامات
- إضافة fallback للمستخدمين بدون profile

#### **4. مشاكل App.tsx:**
- تبسيط عملية التهيئة
- إضافة try-catch شامل
- جعل العمليات non-blocking

---

## 🚀 **اختبار الإصلاحات:**

### **الطريقة 1: Expo Go (الأسرع)**
```bash
npx expo start
# امسح QR Code وجرب التطبيق
```

### **الطريقة 2: بناء جديد**
```bash
eas build --platform android --profile demo --clear-cache
```

### **الطريقة 3: اختبار محلي**
```bash
npx expo run:android
```

---

## 📱 **نصائح لتجنب التعطل:**

### **1. اختبار تدريجي:**
- ابدأ بـ Expo Go
- ثم انتقل لـ Development Build
- أخيراً Production Build

### **2. مراقبة الأخطاء:**
- استخدم console.log بكثرة
- راقب Network requests
- تحقق من Memory usage

### **3. اختبار على أجهزة مختلفة:**
- أجهزة قديمة وجديدة
- إصدارات أندرويد مختلفة
- ذاكرة منخفضة وعالية

---

## 📞 **إذا استمر التعطل:**

### **معلومات مطلوبة للدعم:**
- 📱 **نوع الجهاز:** (مثل: Samsung Galaxy S21)
- 🤖 **إصدار Android:** (مثل: Android 12)
- 📋 **خطوات إعادة الإنتاج:** وصف مفصل
- 📊 **Crash logs:** من adb logcat
- 🕐 **وقت التعطل:** عند الفتح/بعد فترة

### **طرق الحصول على المساعدة:**
- 📧 **البريد:** support@lifemakers.org
- 💬 **تليجرام:** @LifeMakersPirates
- 🐛 **GitHub Issues:** [رابط المستودع]

---

## 🎯 **الحل السريع:**

### **إذا كنت تريد نسخة تعمل فوراً:**
```bash
# استخدم Expo Go للتجربة السريعة
npx expo start

# أو جرب النسخة الأونلاين
# [رابط النسخة الأونلاين]
```

---

## 🏴‍☠️ **نحن هنا للمساعدة!**

فريق صناع الحياة القراصنة مستعد لحل أي مشكلة تواجهك.
لا تتردد في التواصل معنا! ⚓

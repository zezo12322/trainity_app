# 🆕 إنشاء مشروع جديد للنسخة التجريبية

## 🎯 **الحل للمشكلة: "You must have access to the lifemakers-team account"**

---

## 🔧 **الطريقة الأولى: إنشاء مشروع جديد**

### **1. تسجيل الدخول بحسابك:**
```bash
eas login
```

### **2. إنشاء مشروع جديد:**
```bash
eas project:init
```
*اختر اسم مشروع جديد مثل: `life-makers-pirates-demo-[yourname]`*

### **3. بناء النسخة التجريبية:**
```bash
eas build --platform android --profile demo
```

---

## 🔧 **الطريقة الثانية: تغيير slug المشروع**

### **1. تحديث app.json:**
```json
{
  "expo": {
    "name": "Life Makers Pirates - Demo",
    "slug": "life-makers-pirates-demo-[yourname]",
    "version": "1.0.0-demo"
  }
}
```

### **2. حذف التكوين السابق:**
```bash
rm eas.json
```

### **3. إعادة التكوين:**
```bash
eas build:configure
```

### **4. البناء:**
```bash
eas build --platform android --profile demo
```

---

## 🔧 **الطريقة الثالثة: استخدام Expo Development Build**

### **1. تثبيت Expo CLI:**
```bash
npm install -g @expo/cli
```

### **2. بناء محلي:**
```bash
npx expo run:android
```
*يتطلب Android Studio و SDK*

---

## 🔧 **الطريقة الرابعة: استخدام Expo Snack (الأسرع)**

### **1. اذهب إلى:**
```
https://snack.expo.dev
```

### **2. أنشئ مشروع جديد**

### **3. انسخ الكود من:**
- `App.tsx`
- `src/` folder
- `package.json` dependencies

### **4. شغل على الهاتف:**
- امسح QR Code بتطبيق Expo Go
- أو شارك الرابط

---

## 📱 **الطريقة الخامسة: Expo Go (للتجربة السريعة)**

### **1. تشغيل التطبيق:**
```bash
npx expo start
```

### **2. تحميل Expo Go:**
- **Android:** [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS:** [App Store](https://apps.apple.com/app/expo-go/id982107779)

### **3. مسح QR Code:**
- افتح Expo Go
- امسح الكود الظاهر في Terminal

---

## 🎯 **الطريقة الموصى بها (الأسهل):**

### **للتجربة السريعة:**
```bash
# 1. تشغيل محلي
npx expo start

# 2. مسح QR Code بـ Expo Go
# 3. تجربة التطبيق مباشرة
```

### **لإنتاج APK:**
```bash
# 1. إنشاء مشروع جديد
eas project:init

# 2. بناء APK
eas build --platform android --profile demo
```

---

## 🔑 **بيانات التجربة:**

### **للاختبار:**
```
📧 البريد: demo@lifemakers.com
🔑 كلمة المرور: Demo123!
```

---

## 📞 **إذا احتجت مساعدة:**

### **خيارات الدعم:**
1. **Expo Go** - تجربة فورية بدون بناء
2. **Expo Snack** - تجربة أونلاين
3. **مشروع جديد** - APK مخصص
4. **بناء محلي** - للمطورين المتقدمين

---

## 🎉 **النتيجة:**

أي من هذه الطرق ستعطيك نسخة تجريبية قابلة للاختبار:

- 📱 **Expo Go:** تجربة فورية (5 دقائق)
- 🌐 **Expo Snack:** تجربة أونلاين (10 دقائق)  
- 📦 **APK جديد:** ملف قابل للتوزيع (20 دقيقة)

---

## 🚀 **البدء السريع:**

```bash
# الطريقة الأسرع - تجربة فورية
npx expo start

# ثم امسح QR Code بتطبيق Expo Go
```

🏴‍☠️ **صناع الحياة القراصنة - جاهزون للإبحار بأي طريقة!**

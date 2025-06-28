# 🔧 حل مشكلة eas.json config

## 🚨 **المشكلة:**
```
"build.standalone.ios.config" must be a string
```

## ✅ **تم الإصلاح:**

### **المشكلة كانت:**
```json
"ios": {
  "config": {
    "usesNonExemptEncryption": false
  }
}
```

### **الحل المطبق:**
```json
"ios": {
  "resourceClass": "m-medium"
}
```

### **الإعداد الصحيح في app.json:**
```json
"ios": {
  "infoPlist": {
    "ITSAppUsesNonExemptEncryption": false
  }
}
```

---

## 🎯 **الأوامر الصحيحة الآن:**

### **Development Build:**
```bash
eas build -p android --profile development
```

### **Standalone Build:**
```bash
eas build -p android --profile standalone
```

### **Preview Build:**
```bash
eas build -p android --profile preview
```

### **جميع المنصات:**
```bash
eas build --platform all --profile standalone
```

---

## 📋 **ملف eas.json الصحيح:**

```json
{
  "cli": {
    "version": ">= 5.2.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      },
      "env": {
        "NODE_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "NODE_ENV": "production"
      }
    },
    "standalone": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

---

## 🔍 **التحقق من صحة الملف:**

### **في PowerShell:**
```powershell
# التحقق من صحة JSON
Get-Content eas.json | ConvertFrom-Json

# إذا لم تظهر أخطاء، الملف صحيح
```

### **في Command Line:**
```bash
# التحقق من صحة JSON
node -e "JSON.parse(require('fs').readFileSync('eas.json', 'utf8'))"
```

---

## 🚀 **الاختبار:**

### **اختبار التكوين:**
```bash
eas build:configure
```

### **بناء تجريبي:**
```bash
eas build -p android --profile standalone --dry-run
```

---

## 📱 **البدائل إذا استمرت المشكلة:**

### **البديل 1: استخدام app.json فقط**
```bash
# حذف eas.json مؤقتاً
mv eas.json eas.json.backup

# إعادة التكوين
eas build:configure
```

### **البديل 2: إعادة إنشاء eas.json**
```bash
# حذف الملف
rm eas.json

# إعادة التكوين
eas build:configure

# اختيار الإعدادات المناسبة
```

---

## 🎯 **التوصيات:**

### **للبناء السريع:**
```bash
# استخدم standalone profile
eas build -p android --profile standalone
```

### **للتطوير:**
```bash
# استخدم Expo Go
npx expo start
```

### **للاختبار:**
```bash
# استخدم preview profile
eas build -p android --profile preview
```

---

## 🏴‍☠️ **الخلاصة:**

### **تم الإصلاح:**
- ✅ **إزالة config object خاطئ**
- ✅ **الاعتماد على app.json للإعدادات**
- ✅ **ملف eas.json صحيح الآن**

### **الأوامر جاهزة:**
```bash
eas build -p android --profile development
eas build -p android --profile standalone
eas build -p android --profile preview
```

**صناع الحياة القراصنة - التكوين صحيح والبناء جاهز!** ⚓

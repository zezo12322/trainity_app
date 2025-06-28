# 🧪 اختبار النسخة المبسطة

## 🎯 **لحل مشكلة تعطل التطبيق**

---

## 🔄 **الخطوة 1: اختبار النسخة المبسطة**

### **تغيير App.tsx مؤقتاً:**
```bash
# نسخ احتياطي من الملف الأصلي
cp App.tsx App.original.tsx

# استخدام النسخة المبسطة
cp App.simple.tsx App.tsx
```

### **أو في Windows:**
```cmd
copy App.tsx App.original.tsx
copy App.simple.tsx App.tsx
```

---

## 🚀 **الخطوة 2: بناء واختبار**

### **بناء جديد:**
```bash
eas build --platform android --profile demo --clear-cache
```

### **أو اختبار مع Expo Go:**
```bash
npx expo start --clear
```

---

## ✅ **إذا عملت النسخة المبسطة:**

### **المشكلة في:**
- تبعيات معقدة (Supabase, i18n, etc.)
- مشاكل في التهيئة
- أخطاء في الكود

### **الحل التدريجي:**
1. **ابدأ بالنسخة المبسطة**
2. **أضف المكونات تدريجياً:**
   - ThemeProvider
   - I18nextProvider  
   - AppNavigator
   - AuthStore

---

## 🔧 **الخطوة 3: إضافة المكونات تدريجياً**

### **المرحلة 1: إضافة Theme**
```tsx
import { ThemeProvider } from './src/contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      {/* النسخة المبسطة */}
    </ThemeProvider>
  );
}
```

### **المرحلة 2: إضافة i18n**
```tsx
import { I18nextProvider } from 'react-i18next';
import i18n from './src/services/i18n';

export default function App() {
  return (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        {/* النسخة المبسطة */}
      </I18nextProvider>
    </ThemeProvider>
  );
}
```

### **المرحلة 3: إضافة Navigation**
```tsx
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        <AppNavigator />
      </I18nextProvider>
    </ThemeProvider>
  );
}
```

### **المرحلة 4: إضافة Auth**
```tsx
import { useAuthStore } from './src/stores/authStore';

export default function App() {
  const { initialize } = useAuthStore();
  
  useEffect(() => {
    initialize();
  }, []);

  return (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        <AppNavigator />
      </I18nextProvider>
    </ThemeProvider>
  );
}
```

---

## 🔍 **تشخيص المشكلة:**

### **في كل مرحلة:**
1. **اختبر التطبيق**
2. **إذا تعطل** - المشكلة في المكون الأخير
3. **إذا عمل** - انتقل للمرحلة التالية

---

## 🛠️ **حلول للمشاكل الشائعة:**

### **مشكلة في Theme:**
```tsx
// استخدم theme بسيط
const SimpleTheme = ({ children }) => children;
```

### **مشكلة في i18n:**
```tsx
// تعطيل i18n مؤقتاً
const Simplei18n = ({ children }) => children;
```

### **مشكلة في Navigation:**
```tsx
// استخدم navigation بسيط
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const SimpleNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
```

### **مشكلة في Auth:**
```tsx
// تعطيل Auth مؤقتاً
const { initialize } = useAuthStore();
// initialize(); // تعليق هذا السطر
```

---

## 📱 **اختبار سريع:**

### **للتأكد من أن المشكلة حُلت:**
```bash
# 1. استخدم النسخة المبسطة
cp App.simple.tsx App.tsx

# 2. اختبر مع Expo Go
npx expo start

# 3. إذا عملت، ابني APK جديد
eas build --platform android --profile demo
```

---

## 🔄 **العودة للنسخة الأصلية:**

### **بعد حل المشكلة:**
```bash
# استرجاع النسخة الأصلية
cp App.original.tsx App.tsx

# أو تطبيق الإصلاحات على النسخة الأصلية
```

---

## 🎯 **النتيجة المتوقعة:**

### **النسخة المبسطة ستعمل لأنها:**
- ✅ **بدون تبعيات معقدة**
- ✅ **بدون اتصال قاعدة بيانات**
- ✅ **بدون RTL operations**
- ✅ **بدون AsyncStorage**
- ✅ **كود بسيط ومباشر**

---

## 🏴‍☠️ **الهدف:**

تحديد السبب الدقيق لتعطل التطبيق وإصلاحه خطوة بخطوة.
بهذه الطريقة سنحصل على نسخة تجريبية مستقرة وقابلة للاستخدام! ⚓

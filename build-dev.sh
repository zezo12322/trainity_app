#!/bin/bash

# Life Makers Pirates - بناء Development Build
echo "🏴‍☠️ بدء بناء Development Build..."

# التحقق من وجود EAS CLI
if ! command -v eas &> /dev/null; then
    echo "📦 تثبيت EAS CLI..."
    npm install -g eas-cli
fi

# تنظيف المشروع
echo "🧹 تنظيف المشروع..."
rm -rf node_modules/.cache
rm -rf .expo
npx expo install --fix

# تسجيل الدخول إلى Expo
echo "🔐 تسجيل الدخول إلى Expo..."
eas login

# بناء Development Build
echo "🏗️ بناء Development Build..."
echo "هذا قد يستغرق 15-20 دقيقة..."

# استخدام standalone profile بدلاً من development
eas build --platform android --profile standalone --non-interactive

echo ""
echo "✅ تم بناء Development Build!"
echo ""
echo "📱 لتحميل التطبيق:"
echo "1. افتح الرابط الذي ظهر أعلاه"
echo "2. امسح QR Code بكاميرا الهاتف"
echo "3. أو حمل ملف APK مباشرة"
echo ""
echo "🔧 هذا Build مستقل ولا يحتاج Expo Go"
echo "🎉 استمتع بتجربة تطبيق صناع الحياة القراصنة!"

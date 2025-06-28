#!/bin/bash

# Life Makers Pirates - بناء النسخة التجريبية لأندرويد
echo "🏴‍☠️ بدء بناء النسخة التجريبية لأندرويد..."

# التحقق من وجود EAS CLI
if ! command -v eas &> /dev/null; then
    echo "📦 تثبيت EAS CLI..."
    npm install -g @expo/eas-cli
fi

# تسجيل الدخول إلى Expo
echo "🔐 تسجيل الدخول إلى Expo..."
echo "يرجى تسجيل الدخول باستخدام حساب Expo الخاص بك:"
eas login

# تكوين المشروع
echo "⚙️ تكوين المشروع..."
eas build:configure

# بناء النسخة التجريبية
echo "🏗️ بناء النسخة التجريبية لأندرويد..."
echo "هذا قد يستغرق 10-15 دقيقة..."

eas build --platform android --profile demo --non-interactive

echo ""
echo "✅ تم بناء النسخة التجريبية!"
echo ""
echo "📱 لتحميل التطبيق:"
echo "1. افتح الرابط الذي ظهر أعلاه"
echo "2. امسح QR Code بكاميرا الهاتف"
echo "3. أو حمل ملف APK مباشرة"
echo ""
echo "🎉 استمتع بتجربة تطبيق صناع الحياة القراصنة!"

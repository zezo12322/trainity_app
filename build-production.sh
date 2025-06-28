#!/bin/bash

# Life Makers Pirates - بناء الإنتاج مع Fingerprints متوافقة
echo "🏴‍☠️ بدء بناء الإنتاج مع إصلاح Fingerprints..."

# التحقق من وجود EAS CLI
if ! command -v eas &> /dev/null; then
    echo "📦 تثبيت EAS CLI..."
    npm install -g eas-cli
fi

# تنظيف المشروع
echo "🧹 تنظيف المشروع..."
rm -rf node_modules/.cache
rm -rf .expo
rm -rf dist

# تثبيت التبعيات
echo "📦 تثبيت التبعيات..."
npm install
npx expo install --fix

# تسجيل الدخول إلى Expo
echo "� تسجيل الدخول إلى Expo..."
eas login

# بناء للأندرويد مع fingerprint جديد
echo "🤖 بناء نسخة أندرويد متوافقة..."
echo "Fingerprint المطلوب: 911cefefac328aa87fac3075468af23811756c19"
eas build --platform android --profile standalone --clear-cache --non-interactive

echo ""
echo "✅ تم بناء نسخة أندرويد متوافقة!"
echo ""
echo "📱 الآن التحديثات ستعمل مع هذا البناء الجديد"
echo "� رابط التحديث: https://expo.dev/accounts/zezo123/projects/life-makers-pirates/updates"
echo ""
echo "🎉 استمتع بتجربة تطبيق صناع الحياة القراصنة!"
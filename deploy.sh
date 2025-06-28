#!/bin/bash

# Life Makers Pirates - سكريبت النشر السريع
echo "🏴‍☠️ بدء نشر تطبيق صناع الحياة القراصنة..."

# التحقق من وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيته أولاً."
    exit 1
fi

# التحقق من وجود npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm غير مثبت. يرجى تثبيته أولاً."
    exit 1
fi

echo "📦 تثبيت التبعيات..."
npm install

echo "🔧 إصلاح التبعيات..."
npx expo install --fix

echo "🏗️ بناء التطبيق للويب..."
npx expo export --platform web --output-dir web-build

echo "✅ تم بناء التطبيق بنجاح!"
echo "📁 الملفات موجودة في: web-build/"

# التحقق من وجود Vercel CLI
if command -v vercel &> /dev/null; then
    echo "🚀 هل تريد النشر على Vercel؟ (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "🌐 نشر على Vercel..."
        vercel --prod
        echo "✅ تم النشر بنجاح على Vercel!"
    fi
else
    echo "💡 لنشر التطبيق على Vercel:"
    echo "   1. ثبت Vercel CLI: npm install -g vercel"
    echo "   2. سجل دخول: vercel login"
    echo "   3. انشر: vercel --prod"
fi

echo ""
echo "🎉 النشر مكتمل!"
echo "📱 يمكنك الآن اختبار التطبيق محلياً بتشغيل:"
echo "   npx serve web-build"
echo ""
echo "🌐 أو رفع مجلد web-build إلى أي خدمة استضافة ويب"

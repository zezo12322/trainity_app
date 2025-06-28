# Life Makers Pirates - سكريبت النشر السريع لـ Windows
Write-Host "🏴‍☠️ بدء نشر تطبيق صناع الحياة القراصنة..." -ForegroundColor Cyan

# التحقق من وجود Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js مثبت: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js غير مثبت. يرجى تثبيته من: https://nodejs.org" -ForegroundColor Red
    exit 1
}

# التحقق من وجود npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm مثبت: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm غير مثبت." -ForegroundColor Red
    exit 1
}

Write-Host "📦 تثبيت التبعيات..." -ForegroundColor Yellow
npm install

Write-Host "🔧 إصلاح التبعيات..." -ForegroundColor Yellow
npx expo install --fix

Write-Host "🏗️ بناء التطبيق للويب..." -ForegroundColor Yellow
npx expo export --platform web --output-dir web-build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ تم بناء التطبيق بنجاح!" -ForegroundColor Green
    Write-Host "📁 الملفات موجودة في: web-build/" -ForegroundColor Green
} else {
    Write-Host "❌ فشل في بناء التطبيق" -ForegroundColor Red
    exit 1
}

# التحقق من وجود Vercel CLI
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI مثبت: $vercelVersion" -ForegroundColor Green
    
    $response = Read-Host "🚀 هل تريد النشر على Vercel؟ (y/n)"
    if ($response -match "^[yY]") {
        Write-Host "🌐 نشر على Vercel..." -ForegroundColor Yellow
        vercel --prod
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ تم النشر بنجاح على Vercel!" -ForegroundColor Green
        } else {
            Write-Host "❌ فشل النشر على Vercel" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "💡 لنشر التطبيق على Vercel:" -ForegroundColor Yellow
    Write-Host "   1. ثبت Vercel CLI: npm install -g vercel" -ForegroundColor White
    Write-Host "   2. سجل دخول: vercel login" -ForegroundColor White
    Write-Host "   3. انشر: vercel --prod" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 النشر مكتمل!" -ForegroundColor Green
Write-Host "📱 يمكنك الآن اختبار التطبيق محلياً بتشغيل:" -ForegroundColor Cyan
Write-Host "   npx serve web-build" -ForegroundColor White
Write-Host ""
Write-Host "🌐 أو رفع مجلد web-build إلى أي خدمة استضافة ويب" -ForegroundColor Cyan

# اختبار محلي
$testResponse = Read-Host "🧪 هل تريد اختبار التطبيق محلياً الآن؟ (y/n)"
if ($testResponse -match "^[yY]") {
    Write-Host "🚀 بدء الخادم المحلي..." -ForegroundColor Yellow
    npx serve web-build
}

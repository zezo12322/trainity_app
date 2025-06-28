# Life Makers Pirates - بناء النسخة التجريبية لأندرويد
Write-Host "🏴‍☠️ بدء بناء النسخة التجريبية لأندرويد..." -ForegroundColor Cyan

# التحقق من وجود Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js مثبت: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js غير مثبت. يرجى تثبيته من: https://nodejs.org" -ForegroundColor Red
    exit 1
}

# التحقق من وجود EAS CLI
try {
    $easVersion = eas --version
    Write-Host "✅ EAS CLI مثبت: $easVersion" -ForegroundColor Green
} catch {
    Write-Host "📦 تثبيت EAS CLI..." -ForegroundColor Yellow
    npm install -g @expo/eas-cli
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ فشل في تثبيت EAS CLI" -ForegroundColor Red
        exit 1
    }
}

# تسجيل الدخول إلى Expo
Write-Host "🔐 تسجيل الدخول إلى Expo..." -ForegroundColor Yellow
Write-Host "يرجى تسجيل الدخول باستخدام حساب Expo الخاص بك:" -ForegroundColor White
eas login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ فشل في تسجيل الدخول" -ForegroundColor Red
    exit 1
}

# تكوين المشروع
Write-Host "⚙️ تكوين المشروع..." -ForegroundColor Yellow
eas build:configure

# بناء النسخة التجريبية
Write-Host "🏗️ بناء النسخة التجريبية لأندرويد..." -ForegroundColor Yellow
Write-Host "هذا قد يستغرق 10-15 دقيقة..." -ForegroundColor White

eas build --platform android --profile demo --non-interactive

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ تم بناء النسخة التجريبية!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 لتحميل التطبيق:" -ForegroundColor Cyan
    Write-Host "1. افتح الرابط الذي ظهر أعلاه" -ForegroundColor White
    Write-Host "2. امسح QR Code بكاميرا الهاتف" -ForegroundColor White
    Write-Host "3. أو حمل ملف APK مباشرة" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 استمتع بتجربة تطبيق صناع الحياة القراصنة!" -ForegroundColor Green
} else {
    Write-Host "❌ فشل في بناء التطبيق" -ForegroundColor Red
    Write-Host "يرجى التحقق من الأخطاء أعلاه" -ForegroundColor Yellow
}

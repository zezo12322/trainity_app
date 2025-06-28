# Life Makers Pirates - بناء Development Build
Write-Host "🏴‍☠️ بدء بناء Development Build..." -ForegroundColor Cyan

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
    npm install -g eas-cli
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ فشل في تثبيت EAS CLI" -ForegroundColor Red
        exit 1
    }
}

# تنظيف المشروع
Write-Host "🧹 تنظيف المشروع..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".expo" -ErrorAction SilentlyContinue
npx expo install --fix

# تسجيل الدخول إلى Expo
Write-Host "🔐 تسجيل الدخول إلى Expo..." -ForegroundColor Yellow
Write-Host "يرجى تسجيل الدخول باستخدام حساب Expo الخاص بك:" -ForegroundColor White
eas login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ فشل في تسجيل الدخول" -ForegroundColor Red
    exit 1
}

# بناء Development Build
Write-Host "🏗️ بناء Development Build..." -ForegroundColor Yellow
Write-Host "هذا قد يستغرق 15-20 دقيقة..." -ForegroundColor White

# استخدام standalone profile بدلاً من development
eas build --platform android --profile standalone --non-interactive

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ تم بناء Development Build!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 لتحميل التطبيق:" -ForegroundColor Cyan
    Write-Host "1. افتح الرابط الذي ظهر أعلاه" -ForegroundColor White
    Write-Host "2. امسح QR Code بكاميرا الهاتف" -ForegroundColor White
    Write-Host "3. أو حمل ملف APK مباشرة" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 هذا Build مستقل ولا يحتاج Expo Go" -ForegroundColor Yellow
    Write-Host "🎉 استمتع بتجربة تطبيق صناع الحياة القراصنة!" -ForegroundColor Green
} else {
    Write-Host "❌ فشل في بناء التطبيق" -ForegroundColor Red
    Write-Host "يرجى التحقق من الأخطاء أعلاه" -ForegroundColor Yellow
}

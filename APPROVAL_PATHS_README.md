# نظام مسارات الموافقة المتوازية - Parallel Approval Paths System

## نظرة عامة

تم تنفيذ نظام مسارات الموافقة المتوازية لدعم الحالة التي يكون فيها مسؤول المشروع (PM) هو نفسه مقدم طلب التدريب. هذا النظام يوفر مسارين للموافقة:

### 1. المسار العادي (Standard Path)
للمستخدمين العاديين (غير مسؤولي المشروع):
```
under_review → cc_approved → sv_approved → pm_approved → tr_assigned → completed
```

### 2. المسار البديل (PM Alternative Path)
عندما يكون مسؤول المشروع هو مقدم الطلب:
```
sv_approved → pm_approved → tr_assigned → completed
```

## التغييرات المنفذة

### 1. قاعدة البيانات
- إضافة حقل `approval_path` لجدول `training_requests`
- قيم مسموحة: `'standard'` أو `'pm_alternative'`
- القيمة الافتراضية: `'standard'`

### 2. أنواع البيانات (Types)
- تحديث `TrainingRequest` interface لتتضمن `approval_path`
- تحديث أنواع قاعدة البيانات في `database.ts`

### 3. خدمة طلبات التدريب
- تحديد مسار الموافقة تلقائياً عند إنشاء الطلب
- إرسال إشعارات للمستخدمين المناسبين حسب المسار
- تحديث منطق تغيير الحالات

### 4. خدمة الإشعارات
- إنشاء `WorkflowNotificationService` جديدة
- دعم إرسال الإشعارات حسب مسار الموافقة
- رسائل مخصصة لكل مسار

### 5. واجهة المستخدم
- تحديث شاشة تفاصيل الطلب لدعم المسارين
- عرض نصوص الحالة المناسبة حسب المسار
- تحديث منطق الموافقات في الواجهة

## كيفية العمل

### عند إنشاء طلب جديد:
1. النظام يتحقق من دور المستخدم
2. إذا كان `TRAINER_PREPARATION_PROJECT_MANAGER`:
   - يتم تعيين `approval_path = 'pm_alternative'`
   - الحالة الأولية: `'sv_approved'`
   - إرسال إشعارات للمشرفين مباشرة
3. إذا كان دور آخر:
   - يتم تعيين `approval_path = 'standard'`
   - الحالة الأولية: `'under_review'`
   - إرسال إشعارات لمسؤولي إدارة التنمية

### عند تحديث الحالة:
1. النظام يتحقق من مسار الموافقة
2. يطبق منطق الانتقال المناسب للمسار
3. يرسل إشعارات للمستخدمين المناسبين

## الملفات المعدلة

### الملفات الأساسية:
- `src/types/database.ts` - أنواع قاعدة البيانات
- `src/types/index.ts` - أنواع التطبيق
- `src/services/trainingRequestService.ts` - خدمة طلبات التدريب
- `src/stores/trainingRequestStore.ts` - متجر طلبات التدريب
- `src/screens/TrainingRequestDetailScreen.tsx` - شاشة تفاصيل الطلب
- `src/screens/TrainingRequestsScreen.tsx` - شاشة قائمة الطلبات

### الملفات الجديدة:
- `src/services/workflowNotificationService.ts` - خدمة إشعارات سير العمل
- `src/locales/ar.json` - ترجمات عربية
- `src/locales/en.json` - ترجمات إنجليزية
- `database-migration-approval-paths.sql` - سكريبت تحديث قاعدة البيانات

## التثبيت والتشغيل

### 1. تحديث قاعدة البيانات:
```sql
-- تشغيل السكريبت في Supabase SQL Editor
\i database-migration-approval-paths.sql
```

### 2. إعادة تشغيل التطبيق:
```bash
npm start
```

## الاختبار

### اختبار المسار العادي:
1. تسجيل الدخول كمستخدم عادي (غير PM)
2. إنشاء طلب تدريب جديد
3. التحقق من أن الحالة الأولية `under_review`
4. التحقق من إرسال الإشعارات لمسؤولي إدارة التنمية

### اختبار المسار البديل:
1. تسجيل الدخول كمسؤول مشروع (PM)
2. إنشاء طلب تدريب جديد
3. التحقق من أن الحالة الأولية `sv_approved`
4. التحقق من إرسال الإشعارات للمشرفين مباشرة

## الأدوار والصلاحيات

### المسار العادي:
- `DEVELOPMENT_MANAGEMENT_OFFICER`: موافقة `under_review → cc_approved`
- `PROGRAM_SUPERVISOR`: موافقة `cc_approved → sv_approved`
- `TRAINER_PREPARATION_PROJECT_MANAGER`: موافقة `sv_approved → pm_approved`

### المسار البديل:
- `PROGRAM_SUPERVISOR`: موافقة `sv_approved → pm_approved`

## ملاحظات مهمة

1. **الأمان**: تم الحفاظ على جميع سياسات الأمان الموجودة
2. **التوافق**: النظام متوافق مع الطلبات الموجودة
3. **الإشعارات**: فشل الإشعارات لا يؤثر على إنشاء/تحديث الطلبات
4. **الأداء**: تم إضافة فهارس لتحسين الأداء

## استكشاف الأخطاء

### مشاكل شائعة:
1. **عدم ظهور الحالة الصحيحة**: تحقق من `approval_path` في قاعدة البيانات
2. **عدم وصول الإشعارات**: تحقق من أدوار المستخدمين في جدول `users`
3. **خطأ في الموافقات**: تحقق من صلاحيات المستخدم الحالي

### طرق التشخيص:
```sql
-- التحقق من مسار الموافقة للطلب
SELECT id, title, status, approval_path FROM training_requests WHERE id = 'REQUEST_ID';

-- التحقق من دور المستخدم
SELECT id, email, role FROM users WHERE id = 'USER_ID';
```

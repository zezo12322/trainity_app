export interface Specialization {
  id: string;
  name_ar: string;
  name_en: string;
  category: string;
}

export const SPECIALIZATIONS: Specialization[] = [
  // تطوير الذات والمهارات الشخصية
  {
    id: 'leadership',
    name_ar: 'القيادة والإدارة',
    name_en: 'Leadership & Management',
    category: 'personal_development'
  },
  {
    id: 'communication',
    name_ar: 'مهارات التواصل',
    name_en: 'Communication Skills',
    category: 'personal_development'
  },
  {
    id: 'time_management',
    name_ar: 'إدارة الوقت',
    name_en: 'Time Management',
    category: 'personal_development'
  },
  {
    id: 'problem_solving',
    name_ar: 'حل المشكلات',
    name_en: 'Problem Solving',
    category: 'personal_development'
  },
  {
    id: 'teamwork',
    name_ar: 'العمل الجماعي',
    name_en: 'Teamwork',
    category: 'personal_development'
  },
  
  // التكنولوجيا والحاسوب
  {
    id: 'computer_basics',
    name_ar: 'أساسيات الحاسوب',
    name_en: 'Computer Basics',
    category: 'technology'
  },
  {
    id: 'microsoft_office',
    name_ar: 'مايكروسوفت أوفيس',
    name_en: 'Microsoft Office',
    category: 'technology'
  },
  {
    id: 'internet_skills',
    name_ar: 'مهارات الإنترنت',
    name_en: 'Internet Skills',
    category: 'technology'
  },
  {
    id: 'social_media',
    name_ar: 'وسائل التواصل الاجتماعي',
    name_en: 'Social Media',
    category: 'technology'
  },
  {
    id: 'digital_marketing',
    name_ar: 'التسويق الرقمي',
    name_en: 'Digital Marketing',
    category: 'technology'
  },
  
  // المهارات المهنية
  {
    id: 'project_management',
    name_ar: 'إدارة المشاريع',
    name_en: 'Project Management',
    category: 'professional'
  },
  {
    id: 'customer_service',
    name_ar: 'خدمة العملاء',
    name_en: 'Customer Service',
    category: 'professional'
  },
  {
    id: 'sales_skills',
    name_ar: 'مهارات البيع',
    name_en: 'Sales Skills',
    category: 'professional'
  },
  {
    id: 'presentation_skills',
    name_ar: 'مهارات العرض والتقديم',
    name_en: 'Presentation Skills',
    category: 'professional'
  },
  {
    id: 'negotiation',
    name_ar: 'مهارات التفاوض',
    name_en: 'Negotiation Skills',
    category: 'professional'
  },
  
  // اللغات
  {
    id: 'english_language',
    name_ar: 'اللغة الإنجليزية',
    name_en: 'English Language',
    category: 'languages'
  },
  {
    id: 'arabic_language',
    name_ar: 'اللغة العربية',
    name_en: 'Arabic Language',
    category: 'languages'
  },
  {
    id: 'french_language',
    name_ar: 'اللغة الفرنسية',
    name_en: 'French Language',
    category: 'languages'
  },
  
  // المهارات الحرفية والتقنية
  {
    id: 'handicrafts',
    name_ar: 'الحرف اليدوية',
    name_en: 'Handicrafts',
    category: 'technical'
  },
  {
    id: 'cooking',
    name_ar: 'الطبخ والطهي',
    name_en: 'Cooking',
    category: 'technical'
  },
  {
    id: 'sewing',
    name_ar: 'الخياطة والتفصيل',
    name_en: 'Sewing & Tailoring',
    category: 'technical'
  },
  {
    id: 'electrical_work',
    name_ar: 'الأعمال الكهربائية',
    name_en: 'Electrical Work',
    category: 'technical'
  },
  {
    id: 'plumbing',
    name_ar: 'السباكة',
    name_en: 'Plumbing',
    category: 'technical'
  },
  
  // الصحة والسلامة
  {
    id: 'first_aid',
    name_ar: 'الإسعافات الأولية',
    name_en: 'First Aid',
    category: 'health_safety'
  },
  {
    id: 'workplace_safety',
    name_ar: 'السلامة المهنية',
    name_en: 'Workplace Safety',
    category: 'health_safety'
  },
  {
    id: 'health_awareness',
    name_ar: 'التوعية الصحية',
    name_en: 'Health Awareness',
    category: 'health_safety'
  },
  
  // ريادة الأعمال والمالية
  {
    id: 'entrepreneurship',
    name_ar: 'ريادة الأعمال',
    name_en: 'Entrepreneurship',
    category: 'business'
  },
  {
    id: 'financial_literacy',
    name_ar: 'الثقافة المالية',
    name_en: 'Financial Literacy',
    category: 'business'
  },
  {
    id: 'business_planning',
    name_ar: 'التخطيط للأعمال',
    name_en: 'Business Planning',
    category: 'business'
  },
  {
    id: 'accounting_basics',
    name_ar: 'أساسيات المحاسبة',
    name_en: 'Accounting Basics',
    category: 'business'
  }
];

export const SPECIALIZATION_CATEGORIES = {
  personal_development: {
    name_ar: 'تطوير الذات والمهارات الشخصية',
    name_en: 'Personal Development'
  },
  technology: {
    name_ar: 'التكنولوجيا والحاسوب',
    name_en: 'Technology & Computing'
  },
  professional: {
    name_ar: 'المهارات المهنية',
    name_en: 'Professional Skills'
  },
  languages: {
    name_ar: 'اللغات',
    name_en: 'Languages'
  },
  technical: {
    name_ar: 'المهارات الحرفية والتقنية',
    name_en: 'Technical & Craft Skills'
  },
  health_safety: {
    name_ar: 'الصحة والسلامة',
    name_en: 'Health & Safety'
  },
  business: {
    name_ar: 'ريادة الأعمال والمالية',
    name_en: 'Business & Finance'
  }
};

export const getSpecializationsByCategory = (category: string) => {
  return SPECIALIZATIONS.filter(spec => spec.category === category);
};

export const getSpecializationById = (id: string) => {
  return SPECIALIZATIONS.find(spec => spec.id === id);
};

export const getSpecializationName = (id: string, language: 'ar' | 'en' = 'ar') => {
  const spec = getSpecializationById(id);
  if (!spec) return id;
  return language === 'ar' ? spec.name_ar : spec.name_en;
};

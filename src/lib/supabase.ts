import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// السطرين دول عشان نراقب المشكلة في الـ F12
// console.log("Supabase URL:", supabaseUrl);
// console.log("Supabase Key:", supabaseAnonKey ? "موجود" : "غير موجود");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 ملف المفاتيح مش مقروء! تأكد من وجود ملف .env في المجلد الرئيسي.');
}

// ضفنا || "" عشان الكود ميعملش انهيار كامل لو المفاتيح ناقصة
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
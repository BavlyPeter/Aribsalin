/*


# 1. اعمل استنساخ للمشروع الأصلي بتاعك في فولدر جديد باسم الكنيسة
git clone https://github.com/your-username/Aribsalin.git st-george-system

# 2. ادخل جوه الفولدر الجديد
cd st-george-system

# 3. غيّر اسم الرابط الأصلي من origin إلى upstream (عشان يبقى ده المصدر اللي هنسحب منه التحديثات بعدين)
git remote rename origin upstream

# 4. اربط الفولدر ده بالمستودع الجديد اللي لسه عامله للكنيسة التانية كـ origin
git remote add origin https://github.com/your-username/st-george-system.git

# 5. ارفع الملفات للمستودع الجديد
git push -u origin main




*/
// to take updates to onother copies
// # 1. اسحب التحديثات من المشروع الأساسي (Aribsalin)
// git fetch upstream

// # 2. ادمج التحديثات مع كود الكنيسة الحالي
// git merge upstream/main

// # (إذا حدث أي Conflict في ملف tenant.ts، اختار الإبقاء على ملف الكنيسة الحالي)

// # 3. ارفع التحديثات لنسخة الكنيسة على جيت هاب
// git push origin main

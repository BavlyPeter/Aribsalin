import churchLogo from '../assets/images/church logo.png';
import serviceLogo from '../assets/images/service logo.png';

export type EducationStageKey =
  | 'kg'
  | 'primary'
  | 'preparatory'
  | 'secondary'
  | 'university'
  | 'graduate';

export type ServingStageKey =
  | 'supervisors'
  | 'kg'
  | 'primary_12'
  | 'primary_34'
  | 'primary_56'
  | 'preparatory'
  | 'secondary'
  | 'university_graduate'
  | 'other';

export interface SmartIdMapping {
  stages: Record<string, string>;
  years: Record<string, Record<string, string>>;
}

export interface TenantConfig {
  churchName: string;
  serviceName: string;
  emailDomain: string;
  churchLogo: string;
  serviceLogo: string;
  smartIdMapping: SmartIdMapping;
  educationStages: Record<string, string>;
  servantEducationStages: Record<string, string>;
  educationYears: Record<string, string[]>;
  servingStages: Record<string, string>;
  CLASS_LABELS: Record<string, string>;
  classLabels: Record<string, string>;
  servingClasses: Record<string, string>;
}

const CLASS_LABELS: Record<string, string> = {
  supervisors: 'أمناء الخدمة والمسؤولين',
  kg: 'حضانة',
  primary_12: 'ابتدائي (الأول والثاني)',
  primary_34: 'ابتدائي (الثالث والرابع)',
  primary_56: 'ابتدائي (الخامس والسادس)',
  primary: 'ابتدائي (عام)',
  preparatory: 'إعدادي',
  secondary: 'ثانوي',
  university_graduate: 'جامعين وخريجين',
  other: 'أخرى'
};

const smartIdMapping: SmartIdMapping = {
  stages: {
    kg: 'K',
    primary: 'P',
    primary_12: 'P',
    primary_34: 'P',
    primary_56: 'P',
    preparatory: 'Y',
    secondary: 'S',
    university: 'G',
    graduate: 'G',
    university_graduate: 'G',
    other: 'X'
  },
  years: {
    kg: {
      'baby class': '0',
      'baby': '0',
      'بيبي': '0',
      '0': '0',
      'kg1': '1',
      '1': '1',
      'kg2': '2',
      '2': '2',
      '': '0'
    },
    primary_12: {
      '': '1',
      default: '1'
    },
    primary_34: {
      '': '3',
      default: '3'
    },
    primary_56: {
      '': '5',
      default: '5'
    },
    preparatory: {
      '': '0',
      default: '0'
    },
    secondary: {
      '': '0',
      default: '0'
    },
    university_graduate: {
      '': '0',
      default: '0'
    },
    graduate: {
      default: '0',
      '0': '0',
      '': '0'
    },
    other: {
      '': '0',
      default: '0'
    }
  }
};

export const tenantConfig: TenantConfig = {
  churchName: 'كنيسة السيدة العذراء والقديس الابا بيشوى بالصداقه الجديده',
  serviceName: 'خدمة التربية الكنسية',
  emailDomain: 'avabishoy.com',
  churchLogo,
  serviceLogo,
  smartIdMapping,
  educationStages: {
    kg: 'حضانة',
    primary: 'ابتدائي',
    preparatory: 'إعدادي',
    secondary: 'ثانوي',
    university: 'جامعين',
    graduate: 'خريجين'
  },
  servantEducationStages: {
    secondary: 'ثانوي',
    university: 'جامعي',
    graduate: 'خريجين'
  },
  educationYears: {
    kg: [
      'Baby Class',
      'KG1',
      'KG2'
    ],
    primary: [
      'الصف الأول الابتدائي',
      'الصف الثاني الابتدائي',
      'الصف الثالث الابتدائي',
      'الصف الرابع الابتدائي',
      'الصف الخامس الابتدائي',
      'الصف السادس الابتدائي'
    ],
    preparatory: [
      'الصف الأول الإعدادي',
      'الصف الثاني الإعدادي',
      'الصف الثالث الإعدادي'
    ],
    secondary: [
      'الصف الأول الثانوي',
      'الصف الثاني الثانوي',
      'الصف الثالث الثانوي'
    ],
    university: [
      'الفرقة الأولى',
      'الفرقة الثانية',
      'الفرقة الثالثة',
      'الفرقة الرابعة',
      'الفرقة الخامسة',
      'الفرقة السادسة',
      'الفرقة السابعة'
    ]
  },
  servingStages: {
    kg: 'حضانة',
    primary_12: 'ابتدائي (الأول والثاني)',
    primary_34: 'ابتدائي (الثالث والرابع)',
    primary_56: 'ابتدائي (الخامس والسادس)',
    preparatory: 'إعدادي',
    secondary: 'ثانوي',
    university_graduate: 'جامعين وخريجين'
  },
  CLASS_LABELS,
  classLabels: CLASS_LABELS,
  servingClasses: CLASS_LABELS
};

/**
 * Resolves any raw stage or year representation to a canonical key in CLASS_LABELS / servingClasses.
 */
export function resolveStageKey(stageStr: string, yearStr: string = ''): string {
  const s = String(stageStr || '').toLowerCase().trim();
  const y = String(yearStr || '').toLowerCase().trim();

  if (!s || s === 'empty') return 'other';

  if (s === 'supervisors' || s.includes('أمين') || s.includes('امين')) {
    return 'supervisors';
  }

  // Exact match with known keys
  const knownKeys = Object.keys(tenantConfig.servingClasses || tenantConfig.CLASS_LABELS).filter(k => k !== 'other');
  if (knownKeys.includes(s)) {
    if (s === 'primary') {
      if (y.includes('1') || y.includes('2') || y.includes('اول') || y.includes('أول') || y.includes('ثاني') || y.includes('ثانى')) return 'primary_12';
      if (y.includes('3') || y.includes('4') || y.includes('ثالث') || y.includes('رابع')) return 'primary_34';
      if (y.includes('5') || y.includes('6') || y.includes('خامس') || y.includes('سادس')) return 'primary_56';
    }
    return s;
  }

  // Keyword-based matching
  if (s.includes('حضانة') || s.includes('kg')) return 'kg';
  if (s.includes('إعدادي') || s.includes('اعدادي') || s.includes('preparatory')) return 'preparatory';
  if (s.includes('ثانوي') || s.includes('secondary')) return 'secondary';
  if (s.includes('جامع') || s.includes('university') || s.includes('خريج') || s.includes('graduate')) return 'university_graduate';

  if (s.includes('ابتدائي') || s.includes('primary')) {
    if (y.includes('1') || y.includes('2') || y.includes('اول') || y.includes('أول') || y.includes('ثاني') || y.includes('ثانى') || s.includes('1') || s.includes('2') || s.includes('اول') || s.includes('أول') || s.includes('ثاني') || s.includes('ثانى')) {
      return 'primary_12';
    }
    if (y.includes('3') || y.includes('4') || y.includes('ثالث') || y.includes('رابع') || s.includes('3') || s.includes('4') || s.includes('ثالث') || s.includes('رابع')) {
      return 'primary_34';
    }
    if (y.includes('5') || y.includes('6') || y.includes('خامس') || y.includes('سادس') || s.includes('5') || s.includes('6') || s.includes('خامس') || s.includes('سادس')) {
      return 'primary_56';
    }
    return tenantConfig.CLASS_LABELS['primary'] ? 'primary' : 'primary_12';
  }

  return 'other';
}

/**
 * Generates the 2-character Smart ID prefix (e.g., 'P1', 'K0', 'S3') using smartIdMapping and educationYears.
 */
export function generateSmartIdPrefix(stage: string, year: string = ''): string {
  const s = String(stage || '').toLowerCase().trim();
  const y = String(year || '').trim();
  const normY = y.toLowerCase();

  // 1. Resolve Stage character
  let stageChar = smartIdMapping.stages[s];
  if (!stageChar) {
    if (s.includes('حضانة') || s.includes('kg')) stageChar = 'K';
    else if (s.includes('ابتدائي') || s.includes('primary')) stageChar = 'P';
    else if (s.includes('إعدادي') || s.includes('اعدادي') || s.includes('preparatory')) stageChar = 'Y';
    else if (s.includes('ثانوي') || s.includes('secondary')) stageChar = 'S';
    else if (s.includes('جامع') || s.includes('university') || s.includes('خريج') || s.includes('graduate')) stageChar = 'G';
    else stageChar = 'X';
  }

  // If no academic year is provided (e.g. for servant registration by classStage)
  if (!y) {
    if (smartIdMapping.years[s]?.[normY] !== undefined) return `${stageChar}${smartIdMapping.years[s][normY]}`;
    if (smartIdMapping.years[s]?.default !== undefined) return `${stageChar}${smartIdMapping.years[s].default}`;
    if (s.includes('34') || s.includes('3')) return `${stageChar}3`;
    if (s.includes('56') || s.includes('5')) return `${stageChar}5`;
    if (s.includes('12') || s.includes('1')) return `${stageChar}1`;
    return `${stageChar}0`;
  }

  // 2. Resolve Year character
  let yearChar = '1';

  if (s === 'graduate' || stageChar === 'G' && (s.includes('graduate') || normY.includes('graduate') || normY === '0' || normY.includes('خريج'))) {
    yearChar = '0';
  } else if (smartIdMapping.years[s]?.[normY]) {
    yearChar = smartIdMapping.years[s][normY];
  } else if (stageChar === 'K') {
    if (normY.includes('baby') || normY.includes('بيبي') || normY.includes('0')) yearChar = '0';
    else if (normY.includes('1') || normY.includes('kg1') || normY.includes('أول') || normY.includes('اول')) yearChar = '1';
    else if (normY.includes('2') || normY.includes('kg2') || normY.includes('ثاني') || normY.includes('ثانى')) yearChar = '2';
    else yearChar = '0';
  } else {
    // Check against tenantConfig.educationYears array index for the canonical stage
    const canonicalStageKey = Object.keys(smartIdMapping.stages).find(k => smartIdMapping.stages[k] === stageChar) || s;
    const stageYears = tenantConfig.educationYears[canonicalStageKey] || tenantConfig.educationYears[s] || [];
    const indexInArray = stageYears.findIndex(item => item.toLowerCase() === normY);

    if (indexInArray !== -1) {
      yearChar = String(indexInArray + 1);
    } else {
      // Fallback matching
      const digitMatch = y.match(/[0-9]/);
      if (digitMatch) {
        yearChar = digitMatch[0];
      } else if (normY.includes('اول') || normY.includes('أول')) yearChar = '1';
      else if (normY.includes('ثاني') || normY.includes('ثانى')) yearChar = '2';
      else if (normY.includes('ثالث')) yearChar = '3';
      else if (normY.includes('رابع')) yearChar = '4';
      else if (normY.includes('خامس')) yearChar = '5';
      else if (normY.includes('سادس')) yearChar = '6';
      else if (normY.includes('سابع')) yearChar = '7';
      else if (normY.includes('خريج')) yearChar = '0';
      else yearChar = '1';
    }
  }

  return `${stageChar}${yearChar}`;
}

export const {
  churchName,
  serviceName,
  emailDomain,
  educationStages,
  servantEducationStages,
  educationYears,
  servingStages,
  classLabels,
  servingClasses
} = tenantConfig;

export { CLASS_LABELS, smartIdMapping };

export default tenantConfig;




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

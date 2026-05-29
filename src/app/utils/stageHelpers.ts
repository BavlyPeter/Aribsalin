export const stageLabels: Record<string, string> = {
  'kg': 'حضانة',
  'primary_12': 'ابتدائي (الصف الأول والثاني)',
  'primary_34': 'ابتدائي (الصف الثالث والرابع)',
  'primary_56': 'ابتدائي (الصف الخامس والسادس)',
  'preparatory': 'إعدادي',
  'secondary': 'ثانوي',
  'university': 'جامعي',
  'graduate': 'خريجين'
};

export const getParticipantClassStage = (stage: string, year: string | null) => {
  if (!stage) return stage;
  if (stage === 'primary' || stage === 'ابتدائي') {
    if (!year) return 'primary_12';
    if (year === 'الصف الأول الابتدائي' || year === 'الصف الثاني الابتدائي') return 'primary_12';
    if (year === 'الصف الثالث الابتدائي' || year === 'الصف الرابع الابتدائي') return 'primary_34';
    if (year === 'الصف الخامس الابتدائي' || year === 'الصف السادس الابتدائي') return 'primary_56';
    // fallback: if year contains digits 1-2, 3-4, 5-6
    if (/الصف\s*(اول|1|الأول|2|الثاني)/i.test(year)) return 'primary_12';
    if (/الصف\s*(ثالث|3|الثالث|4|الرابع)/i.test(year)) return 'primary_34';
    if (/الصف\s*(خامس|5|الخامس|6|السادس)/i.test(year)) return 'primary_56';
  }
  // if already one of the new keys, return as-is
  if ((stageLabels as any)[stage]) return stage;
  return stage;
};

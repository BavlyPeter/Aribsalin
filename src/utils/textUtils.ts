export const normalizeArabicText = (text: string): string => {
  if (!text) return '';

  return text
    // 1. Remove diacritics (التشكيل)
    .replace(/[\u064B-\u065F]/g, '')
    // 2. Normalize Alef with Hamzas to bare Alef (أ, إ, آ -> ا)
    .replace(/[أإآ]/g, 'ا')
    // 3. Normalize Taa Marbouta to Haa (ة -> ه)
    .replace(/ة/g, 'ه')
    // 4. Normalize Alef Maksoura to Yaa (ى -> ي)
    .replace(/[ىي]/g, 'ي')
    // 5. Normalize Waw/Yeh with Hamza (ؤ -> و, ئ -> ي)
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    // 6. Lowercase and trim for English fallbacks
    .trim()
    .toLowerCase();
};

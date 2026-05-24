import { X } from 'lucide-react';

interface WelcomeScreenProps {
  onClose: () => void;
}

export function WelcomeScreen({ onClose }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-card rounded-2xl p-6 max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-2 hover:bg-muted rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pt-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-primary rounded-full mx-auto flex items-center justify-center shadow-lg mb-4">
              <span className="text-5xl text-primary-foreground">†</span>
            </div>
            <h2 className="text-2xl mb-2" style={{ color: 'var(--primary)' }}>الريبساليين</h2>
            <p className="text-muted-foreground">نظام إدارة مهرجان الصيف</p>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-xl p-4">
              <h3 className="mb-2 text-primary">مرحباً بك!</h3>
              <p className="text-sm text-foreground leading-relaxed">
                هذا النظام مصمم لإدارة حضور ونقاط المشاركين في مهرجان الصيف للكنيسة القبطية الأرثوذكسية.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground">1</span>
                </div>
                <div>
                  <h4 className="mb-1">تسجيل الحضور</h4>
                  <p className="text-sm text-muted-foreground">
                    امسح كود QR للمشارك لتسجيل الحضور وإضافة 10 نقاط تلقائياً
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                     style={{ backgroundColor: 'var(--secondary)' }}>
                  <span style={{ color: 'var(--secondary-foreground)' }}>2</span>
                </div>
                <div>
                  <h4 className="mb-1">مسح السوق</h4>
                  <p className="text-sm text-muted-foreground">
                    امسح الكود لخصم النقاط من رصيد المشارك عند الشراء من السوق
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-foreground">3</span>
                </div>
                <div>
                  <h4 className="mb-1">تسجيل مشاركين جدد</h4>
                  <p className="text-sm text-muted-foreground">
                    أضف بيانات المشاركين الجدد من خلال نموذج التسجيل المخصص
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-secondary/10 rounded-xl p-4 border-2 border-secondary/30">
              <h4 className="mb-2" style={{ color: 'var(--secondary)' }}>للتجربة:</h4>
              <p className="text-sm text-foreground">
                ستجد أكواد QR تجريبية أسفل الشاشة الرئيسية. اضغط على اسم المشارك لعرض الكود، ثم استخدم خاصية "تسجيل الحضور" أو "مسح السوق" لمسحه.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 bg-primary text-primary-foreground rounded-xl py-4 shadow-lg active:scale-[0.98] transition-transform"
          >
            ابدأ الآن
          </button>
        </div>
      </div>
    </div>
  );
}

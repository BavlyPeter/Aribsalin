import { useState, useEffect } from 'react';
import { ArrowRight, Check, X, User, Phone, Book } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface RegistrationRequestsPageProps {
  onBack: () => void;
}

export function RegistrationRequestsPage({ onBack }: RegistrationRequestsPageProps) {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('servants')
        .select('*')
        .eq('status', 'pending');
      
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error(error);
      toast.error('فشل في جلب طلبات التسجيل');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('servants')
        .update({ status: 'approved' })
        .eq('id', id);
      
      if (error) throw error;
      toast.success('تم الموافقة على الخادم بنجاح');
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      toast.error('حدث خطأ أثناء الموافقة');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('هل أنت متأكد من رفض وحذف هذا الطلب؟')) return;
    try {
      const { error } = await supabase
        .from('servants')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('تم رفض الطلب');
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      toast.error('حدث خطأ أثناء الرفض');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg active:scale-95 transition-transform">
            <ArrowRight className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold">طلبات التسجيل</h2>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">جاري التحميل...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-card rounded-2xl border border-border shadow-sm">
            لا توجد طلبات تسجيل معلقة حالياً
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {requests.map(request => (
              <div key={request.id} className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{request.full_name || request.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Phone className="w-4 h-4" />
                      <span dir="ltr" className="font-medium">{request.mobile_personal || request.mobile}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Book className="w-4 h-4" />
                      <span>{request.educational_stage || request.educationStage || 'غير محدد'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2 border-t border-border mt-auto">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                    موافقة
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <X className="w-5 h-5" />
                    رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

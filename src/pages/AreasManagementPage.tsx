import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  MapPin, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Building2, 
  Layers, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useFestivalStore } from '../store/useFestivalStore';
import { Area } from '../types';

function ToggleSwitch({
  checked,
  onChange,
  disabled,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-primary' : 'bg-muted-foreground/30'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? '-translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function AreasManagementPage() {
  const navigate = useNavigate();
  const { currentServant, isInitialized } = useFestivalStore();

  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [name, setName] = useState('');
  const [hasNeighborhoods, setHasNeighborhoods] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [newNeighborhoodInput, setNewNeighborhoodInput] = useState('');
  const [askBuildingDetails, setAskBuildingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check RBAC
  const userRole = currentServant?.role || 'normal';
  const isAuthorized = userRole === 'admin' || userRole === 'developer';

  useEffect(() => {
    if (isInitialized && !isAuthorized) {
      toast.error('غير مصرح لك بالدخول لهذه الصفحة');
      navigate('/dashboard', { replace: true });
    }
  }, [isInitialized, isAuthorized, navigate]);

  const fetchAreas = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('name');

      if (error) throw error;
      setAreas((data || []) as Area[]);
    } catch (err: any) {
      console.error('Error fetching areas:', err);
      toast.error('فشل في جلب قائمة المناطق');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const openCreateModal = () => {
    setEditingArea(null);
    setName('');
    setHasNeighborhoods(false);
    setNeighborhoods([]);
    setNewNeighborhoodInput('');
    setAskBuildingDetails(false);
    setIsModalOpen(true);
  };

  const openEditModal = (area: Area) => {
    setEditingArea(area);
    setName(area.name || '');
    setHasNeighborhoods(Boolean(area.has_neighborhoods));
    setNeighborhoods(Array.isArray(area.neighborhoods) ? [...area.neighborhoods] : []);
    setNewNeighborhoodInput('');
    setAskBuildingDetails(Boolean(area.ask_building_details));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingArea(null);
  };

  const handleAddNeighborhood = () => {
    const trimmed = newNeighborhoodInput.trim();
    if (!trimmed) return;

    if (neighborhoods.some((n) => n.trim().toLowerCase() === trimmed.toLowerCase())) {
      toast.error('هذا الحي مضاف بالفعل');
      return;
    }

    setNeighborhoods((prev) => [...prev, trimmed]);
    setNewNeighborhoodInput('');
  };

  const handleRemoveNeighborhood = (indexToRemove: number) => {
    setNeighborhoods((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('يرجى إدخال اسم المنطقة');
      return;
    }

    // Check duplicate
    const isDuplicate = areas.some(
      (a) => a.name.trim().toLowerCase() === trimmedName.toLowerCase() && a.id !== editingArea?.id
    );
    if (isDuplicate) {
      toast.error('توجد منطقة أخرى بنفس هذا الاسم');
      return;
    }

    const cleanedNeighborhoods = hasNeighborhoods
      ? neighborhoods.map((n) => n.trim()).filter(Boolean)
      : [];

    setIsSaving(true);
    try {
      if (editingArea) {
        // Update existing area
        const { error } = await supabase
          .from('areas')
          .update({
            name: trimmedName,
            has_neighborhoods: hasNeighborhoods,
            neighborhoods: cleanedNeighborhoods,
            ask_building_details: askBuildingDetails,
          })
          .eq('id', editingArea.id);

        if (error) throw error;
        toast.success('تم تحديث المنطقة بنجاح');
      } else {
        // Create new area
        const { error } = await supabase.from('areas').insert([
          {
            name: trimmedName,
            has_neighborhoods: hasNeighborhoods,
            neighborhoods: cleanedNeighborhoods,
            ask_building_details: askBuildingDetails,
          },
        ]);

        if (error) throw error;
        toast.success('تمت إضافة المنطقة بنجاح');
      }

      closeModal();
      await fetchAreas();
    } catch (err: any) {
      console.error('Error saving area:', err);
      toast.error(err.message || 'حدث خطأ أثناء حفظ المنطقة');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (area: Area) => {
    if (!window.confirm(`هل أنت متأكد من حذف منطقة "${area.name}"؟ قد يؤثر ذلك على العناوين المسجلة.`)) {
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.from('areas').delete().eq('id', area.id);

      if (error) throw error;
      toast.success(`تم حذف منطقة "${area.name}" بنجاح`);
      await fetchAreas();
    } catch (err: any) {
      console.error('Error deleting area:', err);
      toast.error(err.message || 'فشل في حذف المنطقة');
      setIsLoading(false);
    }
  };

  const filteredAreas = useMemo(() => {
    if (!searchQuery.trim()) return areas;
    const q = searchQuery.toLowerCase().trim();
    return areas.filter((a) => {
      const matchName = a.name.toLowerCase().includes(q);
      const matchNeighborhood = Array.isArray(a.neighborhoods) && a.neighborhoods.some((n) => n.toLowerCase().includes(q));
      return matchName || matchNeighborhood;
    });
  }, [areas, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-white/10 rounded-xl active:scale-95 transition-transform"
              title="العودة للوحة التحكم"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                <span>إدارة المناطق</span>
              </h1>
              <p className="text-xs text-primary-foreground/80 mt-0.5">
                تكوين المناطق السكنية، الأحياء وتفاصيل العناوين الذكية
              </p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 sm:gap-2 bg-card text-foreground px-3.5 sm:px-4 py-2 rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4 text-primary" />
            <span>إضافة منطقة</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Search Bar & Stats */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث باسم المنطقة أو الحي..."
              className="w-full pl-4 pr-11 py-2.5 bg-card rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground px-2">
            <span>العدد الإجمالي:</span>
            <span className="font-bold text-foreground bg-card border border-border px-2.5 py-1 rounded-lg">
              {areas.length} منطقة
            </span>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground text-sm font-medium">جاري تحميل المناطق...</p>
            </div>
          </div>
        ) : filteredAreas.length === 0 ? (
          <div className="min-h-[260px] bg-card rounded-2xl border border-border p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3 text-muted-foreground">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">
              {searchQuery ? 'لم يتم العثور على نتائج' : 'لا توجد مناطق مسجلة بعد'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              {searchQuery
                ? 'جرب البحث بكلمة أخرى أو قم بمسح نص البحث.'
                : 'ابدأ بإضافة أول منطقة سكنية لتظهر في نماذج تسجيل المخدومين والخدام.'}
            </p>
            {!searchQuery && (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منطقة الآن</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAreas.map((area) => (
              <div
                key={area.id}
                className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Title & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-foreground leading-snug">{area.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {area.has_neighborhoods
                            ? `${area.neighborhoods?.length || 0} أحياء مسجلة`
                            : 'منطقة عامة (بدون أحياء)'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(area)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="تعديل المنطقة"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(area)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="حذف المنطقة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Attributes Badges */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {area.has_neighborhoods ? (
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 px-2.5 py-1 rounded-lg font-medium border border-blue-200/50 dark:border-blue-900/50">
                        <Layers className="w-3.5 h-3.5" />
                        <span>تحتوي على أحياء</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground px-2.5 py-1 rounded-lg">
                        <span>بدون أحياء</span>
                      </span>
                    )}

                    {area.ask_building_details ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-1 rounded-lg font-medium border border-emerald-200/50 dark:border-emerald-900/50">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>طلب عمارة وشقة</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground px-2.5 py-1 rounded-lg">
                        <span>بدون تفاصيل عمارة</span>
                      </span>
                    )}
                  </div>

                  {/* Neighborhoods Chips */}
                  {area.has_neighborhoods && Array.isArray(area.neighborhoods) && area.neighborhoods.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-2">الأحياء المتاحة:</p>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {area.neighborhoods.map((nb, i) => (
                          <span
                            key={i}
                            className="text-xs bg-muted/70 text-foreground px-2 py-0.5 rounded-md border border-border/60"
                          >
                            {nb}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Add / Edit Area */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground rounded-2xl shadow-2xl border border-border w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold">
                  {editingArea ? 'تعديل بيانات المنطقة' : 'إضافة منطقة جديدة'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Area Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  اسم المنطقة <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: مدينة نصر، المعادي، مصر الجديدة..."
                  className="w-full px-4 py-2.5 bg-input-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>

              {/* Toggle: has_neighborhoods */}
              <div className="rounded-xl border border-border p-4 bg-muted/10 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      هل تحتوي على أحياء أو مجاورات؟
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      تفعيل هذا الخيار سيعرض قائمة منسدلة بالأحياء عند اختيار هذه المنطقة
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={hasNeighborhoods}
                    onChange={(checked) => setHasNeighborhoods(checked)}
                  />
                </div>

                {/* Dynamic Neighborhoods List */}
                {hasNeighborhoods && (
                  <div className="pt-3 border-t border-border space-y-3">
                    <label className="block text-xs font-semibold text-foreground">
                      قائمة الأحياء والمجاورات
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newNeighborhoodInput}
                        onChange={(e) => setNewNeighborhoodInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNeighborhood();
                          }
                        }}
                        placeholder="اكتب اسم الحي واضغط إضافة (مثال: الحي السابع)..."
                        className="flex-1 px-3.5 py-2 bg-card rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddNeighborhood}
                        className="bg-primary text-primary-foreground px-3.5 py-2 rounded-lg text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shrink-0"
                      >
                        إضافة
                      </button>
                    </div>

                    {/* Chips Display */}
                    {neighborhoods.length === 0 ? (
                      <div className="p-3 bg-muted/40 rounded-lg text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>لم تتم إضافة أي أحياء بعد. أضف الأحياء التابعة للمنطقة.</span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-card rounded-lg border border-border">
                        {neighborhoods.map((neighborhood, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-md border border-primary/20"
                          >
                            <span>{neighborhood}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveNeighborhood(index)}
                              className="text-primary/70 hover:text-destructive p-0.5 rounded transition-colors"
                              title="إزالة الحي"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Toggle: ask_building_details */}
              <div className="rounded-xl border border-border p-4 bg-muted/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      طلب رقم العمارة والشقة؟
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      إظهار حقلي "رقم العمارة" و "رقم الشقة" تلقائيًا عند اختيار هذه المنطقة
                    </p>
                  </div>
                  <ToggleSwitch
                    checked={askBuildingDetails}
                    onChange={(checked) => setAskBuildingDetails(checked)}
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-border">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingArea ? 'حفظ التعديلات' : 'إضافة المنطقة'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AreasManagementPage;

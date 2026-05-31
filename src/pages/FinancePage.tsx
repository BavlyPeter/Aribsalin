import { useState, useEffect } from 'react';
import { ArrowRight, Plus, TrendingUp, TrendingDown, DollarSign, Calendar, User, FileText } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { stageLabels } from '../app/utils/stageHelpers';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'expense' | 'revenue';
  title: string;
  amount: number;
  date: string;
  educationStage: string; // 'all' or specific stage
  personName: string;
  description?: string;
}

interface FinancePageProps {
  onBack: () => void;
}

const educationStages = [
  { value: 'all', label: 'جميع المراحل' },
  // expand stageLabels (includes primary_12 / primary_34 / primary_56)
  ...Object.entries(stageLabels).map(([value, label]) => ({ value, label }))
];

export function FinancePage({ onBack }: FinancePageProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lifted form state so we can reset it from parent after successful save
  const [formData, setFormData] = useState({
    type: 'revenue' as 'expense' | 'revenue',
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    educationStage: 'all',
    personName: '',
    description: ''
  });

  // Fetch real data on mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: Transaction[] = data.map((t: any) => ({
          id: t.id,
          type: t.type as 'expense' | 'revenue',
          title: t.title,
          amount: t.amount,
          date: t.transaction_date,
          educationStage: t.education_stage,
          personName: t.person_name,
          description: t.description
        }));
        setTransactions(mapped);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('فشل في تحميل البيانات المالية');
    } finally {
      setIsLoading(false);
    }
  };

  const [filterType, setFilterType] = useState<'all' | 'expense' | 'revenue'>('all');
  const [filterStage, setFilterStage] = useState<string>('all');

  // Calculate totals
  const totalRevenue = transactions
    .filter(t => t.type === 'revenue')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalRevenue - totalExpense;

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const typeMatch = filterType === 'all' || t.type === filterType;
    const stageMatch = filterStage === 'all' || t.educationStage === filterStage || t.educationStage === 'all' || (t.educationStage === 'primary' && filterStage.startsWith('primary_'));
    return typeMatch && stageMatch;
  });

  // Prepare chart data
  const pieData = [
    { id: 'revenue', name: 'الإيرادات', value: totalRevenue, color: '#10B981' },
    { id: 'expense', name: 'المصروفات', value: totalExpense, color: '#EF4444' }
  ];

  // Group by education stage
  const stageData = educationStages
    .filter(s => s.value !== 'all')
    .map(stage => {
      const stageExpense = transactions
        .filter(t => t.type === 'expense' && (t.educationStage === stage.value || t.educationStage === 'all' || (t.educationStage === 'primary' && stage.value.startsWith('primary_'))))
        .reduce((sum, t) => sum + t.amount, 0);
      const stageRevenue = transactions
        .filter(t => t.type === 'revenue' && (t.educationStage === stage.value || t.educationStage === 'all' || (t.educationStage === 'primary' && stage.value.startsWith('primary_'))))
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        id: stage.value,
        name: stage.label,
        مصروفات: stageExpense,
        إيرادات: stageRevenue
      };
    });

  const handleAddTransaction = async (data: Omit<Transaction, 'id'>) => {
    try {
      const { data: inserted, error } = await supabase
        .from('financial_transactions')
        .insert([
          {
            type: data.type,
            title: data.title,
            amount: Number(data.amount),
            transaction_date: data.date,
            education_stage: data.educationStage,
            person_name: data.personName,
            description: data.description
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newTransaction: Transaction = {
        id: inserted.id,
        type: inserted.type as 'expense' | 'revenue',
        title: inserted.title,
        amount: inserted.amount,
        date: inserted.transaction_date,
        educationStage: inserted.education_stage,
        personName: inserted.person_name,
        description: inserted.description
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setShowAddForm(false);

      // Reset form state for the next entry
      setFormData({
        type: 'revenue',
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        educationStage: 'all',
        personName: '',
        description: ''
      });

      toast.success('تم تسجيل المعاملة بنجاح');
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('فشل في حفظ المعاملة');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        جاري تحميل البيانات المالية...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-lg active:scale-95 transition-transform"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
            <h2 className="text-xl">الإدارة المالية</h2>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg text-green-600">{totalRevenue}</div>
              <div className="text-xs text-muted-foreground">إيرادات</div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg text-red-600">{totalExpense}</div>
              <div className="text-xs text-muted-foreground">مصروفات</div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-center">
              <div className={`text-lg ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalBalance}
              </div>
              <div className="text-xs text-muted-foreground">الرصيد</div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-4">
          {/* Pie Chart */}
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <h3 className="text-primary mb-4 text-center">نسبة الإيرادات والمصروفات</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-card rounded-xl p-5 shadow-sm border border-border">
            <h3 className="text-primary mb-4 text-center">المصروفات والإيرادات حسب المرحلة</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" key="grid" />
                <XAxis dataKey="name" style={{ fontSize: '12px' }} key="xaxis" />
                <YAxis style={{ fontSize: '12px' }} key="yaxis" />
                <Tooltip key="tooltip" />
                <Legend key="legend" />
                <Bar dataKey="إيرادات" fill="#10B981" key="revenue-bar" />
                <Bar dataKey="مصروفات" fill="#EF4444" key="expense-bar" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <h3 className="text-primary mb-3">تصفية المعاملات</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-2 text-xs text-foreground">النوع</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 bg-input-background rounded-lg border border-border text-sm"
              >
                <option value="all">الكل</option>
                <option value="revenue">إيرادات</option>
                <option value="expense">مصروفات</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-xs text-foreground">المرحلة</label>
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="w-full px-3 py-2 bg-input-background rounded-lg border border-border text-sm"
              >
                {educationStages.map(stage => (
                  <option key={stage.value} value={stage.value}>{stage.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          <h3 className="text-primary">المعاملات المالية ({filteredTransactions.length})</h3>
          {filteredTransactions.map(transaction => (
            <div
              key={transaction.id}
              className="bg-card rounded-xl p-4 shadow-sm border border-border"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.type === 'revenue' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <h4 className="font-medium">{transaction.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{transaction.description}</p>
                </div>
                <div className={`text-lg font-bold ${
                  transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'revenue' ? '+' : '-'}{transaction.amount}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(transaction.date).toLocaleDateString('ar-EG')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{transaction.personName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>{educationStages.find(s => s.value === transaction.educationStage)?.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddForm && (
        <AddTransactionModal
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddTransaction}
          formData={formData}
          setFormData={setFormData}
        />
      )}
    </div>
  );
}

interface AddTransactionModalProps {
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id'>) => void;
  formData: {
    type: 'expense' | 'revenue';
    title: string;
    amount: string;
    date: string;
    educationStage: string;
    personName: string;
    description: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    type: 'expense' | 'revenue';
    title: string;
    amount: string;
    date: string;
    educationStage: string;
    personName: string;
    description: string;
  }>>;
}

function AddTransactionModal({ onClose, onSubmit, formData, setFormData }: AddTransactionModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseInt(formData.amount)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card rounded-t-3xl sm:rounded-2xl w-full max-w-md mx-auto shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 z-10">
          <h3 className="text-xl text-primary text-center">إضافة معاملة مالية</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block mb-2 text-sm text-foreground">نوع المعاملة *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'revenue' }))}
                className={`py-3 rounded-lg border-2 transition-all ${
                  formData.type === 'revenue'
                    ? 'border-green-500 bg-green-500/10 text-green-700'
                    : 'border-border bg-input-background'
                }`}
              >
                إيراد
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                className={`py-3 rounded-lg border-2 transition-all ${
                  formData.type === 'expense'
                    ? 'border-red-500 bg-red-500/10 text-red-700'
                    : 'border-border bg-input-background'
                }`}
              >
                مصروف
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm text-foreground">العنوان *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="مثال: اشتراكات المشاركين"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-foreground">المبلغ *</label>
            <input
              type="number"
              required
              min="1"
              step="1"
              value={formData.amount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (parseInt(value) > 0 && !value.includes('-') && !value.includes('.'))) {
                  setFormData(prev => ({ ...prev, amount: value }));
                }
              }}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === '+' || e.key === '.' || e.key === 'e' || e.key === 'E') {
                  e.preventDefault();
                }
              }}
              className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-foreground">التاريخ *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-foreground">المرحلة الدراسية *</label>
            <select
              required
              value={formData.educationStage}
              onChange={(e) => setFormData(prev => ({ ...prev, educationStage: e.target.value }))}
              className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {educationStages.map(stage => (
                <option key={stage.value} value={stage.value}>{stage.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm text-foreground">
              {formData.type === 'revenue' ? 'المصدر' : 'الشخص الذي استلم'} *
            </label>
            <input
              type="text"
              required
              value={formData.personName}
              onChange={(e) => setFormData(prev => ({ ...prev, personName: e.target.value }))}
              className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="اسم الشخص"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-foreground">وصف إضافي</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
              placeholder="تفاصيل إضافية عن المعاملة"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 active:scale-[0.98] transition-transform"
            >
              حفظ
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-muted text-foreground rounded-xl py-3 active:scale-[0.98] transition-transform"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

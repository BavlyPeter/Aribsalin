import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { RoleSelectionPage } from '../../pages/RoleSelectionPage';
import { LoginPage } from '../../pages/LoginPage';
import { SignupPage } from '../../pages/SignupPage';
import { Dashboard } from '../../pages/Dashboard';
import { RegistrationForm } from '../forms/RegistrationForm';
import { QRScanner } from '../shared/QRScanner';
import { MarketModal } from '../modals/MarketModal';
import { AddPointsModal } from '../modals/AddPointsModal';
import { ManualPointsModal } from '../modals/ManualPointsModal';
import { StudentProfile } from '../../pages/StudentProfile';
import { WelcomeScreen } from '../shared/WelcomeScreen';
import { FinancePage } from '../../pages/FinancePage';
import { StatisticsPage } from '../../pages/StatisticsPage';
import { TeachersPage } from '../../pages/TeachersPage';
import { ServantProfile } from '../../pages/ServantProfile';
import { StudentPortalLogin } from '../../pages/StudentPortalLogin';
import { Participant, StudentData, TeacherData } from '../../types';
import { toast, Toaster } from 'sonner';

type View       =  'roleSelection' | 'login' | 'signup' | 'studentPortal' | 'studentScanner' | 'dashboard' | 'registration' | 'scanner' | 'market' | 'addPoints' | 'manualPoints' | 'profile' | 'finance' | 'statistics' | 'teachers' | 'servantProfile';
type ScanMode   =  'attendance' | 'market' | 'addPoints' | 'viewDetails';
type ViewerRole =  'servant' | 'student';

export default function AppMain() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentView, setCurrentView] = useState<View>('roleSelection');
  const [scanMode, setScanMode] = useState<ScanMode>('attendance');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [viewerRole, setViewerRole] = useState<ViewerRole>('servant');
  const [currentServant, setCurrentServant] = useState<any>(null);
  const [selectedParticipantForPoints, setSelectedParticipantForPoints] = useState<any | null>(null);

  const [selectedServantProfileId, setSelectedServantProfileId] = useState<string | null>(null);

  const [participants, setParticipants] = useState<any[]>([]);

  const [todayAttendance, setTodayAttendance] = useState(25);

  useEffect(() => {
    if (isAuthenticated) {
      const hasVisited = localStorage.getItem('arribsalin-visited');
      if (!hasVisited) {
        setShowWelcome(true);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: servantData, error } = await supabase
          .from('servants')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!error && servantData) {
          setCurrentServant(servantData);
          setIsAuthenticated(true);
          setViewerRole('servant');
          setCurrentView('dashboard');
        }
      }
    };

    checkExistingSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setCurrentServant(null);
        setViewerRole('servant');
        setCurrentView('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchFestivalData = async () => {
    try {
      // Step 1: Fetch all participants (Safe query)
      const { data: pData, error: pError } = await supabase
        .from('participants')
        .select('*');

      if (pError) throw pError;

      if (pData && pData.length > 0) {
        // Step 2: Fetch attendance logs for these participants independently
        const pIds = pData.map(p => p.id);
        const { data: logsData, error: logsError } = await supabase
          .from('attendance_logs')
          .select('participant_id, scanned_at, attendance_date')
          .in('participant_id', pIds);

        if (logsError) {
          console.warn('Could not fetch attendance logs, continuing without them:', logsError);
        }

        const today = new Date().toISOString().split('T')[0];

        // Step 3: Merge them in memory
        const mapped = pData.map(p => {
          // Find all logs for this specific participant
          const pLogs = (logsData || []).filter(log => log.participant_id === p.id);

          // Extract dates
          const dates = pLogs.map((log: any) => {
            const dateStr = log.attendance_date || log.scanned_at;
            return dateStr ? String(dateStr).split('T')[0] : '';
          }).filter(Boolean);

          const uniqueAttendanceDays = Array.from(new Set(dates)) as string[];

          return {
            id: p.id,
            participant_id: p.participant_id,
            name: p.full_name,
            points: p.points_balance || 0,
            attended: uniqueAttendanceDays.includes(today),
            attendanceDays: uniqueAttendanceDays,
            data: {
              fullName: p.full_name,
              gender: p.gender,
              educationStage: p.educational_stage,
              educationYear: p.academic_year,
              studyOrWorkPlace: p.class_or_job,
              confessionFather: p.father_of_confession,
              personalMobile: p.mobile_personal,
              fatherMobile: p.mobile_father,
              motherMobile: p.mobile_mother,
              area: p.address_area,
              address: p.address_details,
              dateOfBirth: p.birth_date
            }
          };
        });

        setParticipants(mapped);
      } else {
        setParticipants([]);
      }
    } catch (error) {
      console.error('Error fetching participants data:', error);
    }
  };

  useEffect(() => {
    fetchFestivalData();
  }, []);

  const handleLogin = (servantData: any) => {
    setIsAuthenticated(true);
    setViewerRole('servant');
    setCurrentServant(servantData);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentServant(null);
    setViewerRole('servant');
    setCurrentView('login');
    toast.success('تم تسجيل الخروج بنجاح');
  };

  const handleSignup = (data: TeacherData) => {
    // In real app, save to database
    toast.success('تم إنشاء الحساب بنجاح');
    setIsAuthenticated(true);
    setViewerRole('servant');
    setCurrentServant(data);
    setCurrentView('dashboard');
  };

  const handleRoleSelect = (role: ViewerRole) => {
    setViewerRole(role);

    if (role === 'servant') {
      setIsAuthenticated(false);
      setCurrentView('login');
    } else {
      setCurrentView('studentPortal');
    }
  };

  const findParticipantByIdentifier = (identifier: string) => {
    const normalized = String(identifier || '').trim().toUpperCase();
    return participants.find(participant =>
      String(participant.id || '').trim().toUpperCase() === normalized ||
      String(participant.participant_id || '').trim().toUpperCase() === normalized
    );
  };

  const getStudentClassKey = (participant: Participant | any) => {
    const data = participant?.data || {};
    const stage = String(data.educationStage || data.educational_stage || '').toLowerCase();
    const year = String(data.educationYear || data.academic_year || '').toLowerCase();

    if (stage === 'kg' || stage === 'حضانة') return 'kg';
    if (stage === 'preparatory' || stage === 'إعدادي') return 'preparatory';
    if (stage === 'secondary' || stage === 'ثانوي') return 'secondary';
    if (stage === 'university' || stage === 'جامعي') return 'university';
    if (stage === 'graduate' || stage === 'خريجين') return 'graduate';

    if (stage === 'primary' || stage === 'ابتدائي') {
      if (year.includes('الأول') || year.includes('الثاني') || year.includes('1') || year.includes('2')) return 'primary_12';
      if (year.includes('الثالث') || year.includes('الرابع') || year.includes('3') || year.includes('4')) return 'primary_34';
      if (year.includes('الخامس') || year.includes('السادس') || year.includes('5') || year.includes('6')) return 'primary_56';
      return 'primary_12';
    }

    return stage || '';
  };

  // Calculate total unique days attendance was taken for a specific class
  const getActiveDaysForClass = (classKey: string) => {
    if (!participants || participants.length === 0) return 1; // Fallback to avoid division by zero

    const classParticipants = participants.filter(p => getStudentClassKey(p) === classKey);
    const uniqueDates = new Set<string>();

    classParticipants.forEach(p => {
      if (p.attendanceDays && Array.isArray(p.attendanceDays)) {
        p.attendanceDays.forEach((date: string) => uniqueDates.add(date));
      }
    });

    // Return the number of unique days, minimum 1 to prevent 0 division
    return Math.max(1, uniqueDates.size);
  };

  // Calculate overall unique days across the entire festival (for general statistics)
  const getOverallActiveDays = () => {
    if (!participants || participants.length === 0) return 1;

    const uniqueDates = new Set<string>();
    participants.forEach(p => {
      if (p.attendanceDays && Array.isArray(p.attendanceDays)) {
        p.attendanceDays.forEach((date: string) => uniqueDates.add(date));
      }
    });

    return Math.max(1, uniqueDates.size);
  };

  const handleStudentLoginById = (id: string) => {
    const participant = findParticipantByIdentifier(id);

    if (!participant) {
      toast.error('لم يتم العثور على المشارك', {
        description: `الرقم ${id} غير موجود`
      });
      return;
    }

    setViewerRole('student');
    setSelectedParticipantId(participant.id);
    setCurrentView('profile');
  };

  const handleOpenStudentScanner = () => {
    setViewerRole('student');
    setScanMode('viewDetails');
    setCurrentView('studentScanner');
  };

  const handleNavigate = (view: 'scanner' | 'registration' | 'market' | 'addPoints' | 'profile' | 'viewDetails' | 'finance' | 'statistics' | 'teachers') => {
    if (view === 'scanner') {
      setScanMode('attendance');
      setCurrentView('scanner');
    } else if (view === 'market') {
      setScanMode('market');
      setCurrentView('scanner');
    } else if (view === 'addPoints') {
      setScanMode('addPoints');
      setCurrentView('scanner');
    } else if (view === 'viewDetails') {
      setScanMode('viewDetails');
      setCurrentView('scanner');
    } else if (view === 'finance') {
      setCurrentView('finance');
    } else if (view === 'statistics') {
      setCurrentView('statistics');
    } else if (view === 'teachers') {
      setCurrentView('teachers');
    } else {
      setCurrentView(view);
    }
  };

  const handleRegistrationSubmit = async (data: StudentData, participantId?: string) => {
    try {
      const normalizedFullName = String(data.fullName || '').trim();

      // 1) Enforce unique participant full name (exact match), excluding the current record in edit mode.
      let duplicateQuery = supabase
        .from('participants')
        .select('id, participant_id')
        .eq('full_name', normalizedFullName)
        .limit(1);

      if (participantId) {
        const isUuid = String(participantId).includes('-');
        duplicateQuery = isUuid
          ? duplicateQuery.neq('id', participantId)
          : duplicateQuery.neq('participant_id', participantId);
      }

      const { data: duplicateParticipant, error: duplicateError } = await duplicateQuery.maybeSingle();
      if (duplicateError) throw duplicateError;

      if (duplicateParticipant) {
        toast.error('هذا المخدوم مسجل بالفعل في النظام!');
        return; // STRICT HALT: Prevents further execution and insert
      }

      const payload = {
        full_name: normalizedFullName,
        gender: data.gender,
        photo_url: data.photo_url || null,
        educational_stage: data.educationStage,
        academic_year: data.educationYear,
        class_or_job: data.studyOrWorkPlace,
        father_of_confession: data.confessionFather,
        mobile_personal: data.personalMobile,
        mobile_father: data.fatherMobile,
        mobile_mother: data.motherMobile,
        address_area: data.area,
        address_details: data.address,
        birth_date: data.dateOfBirth || null
      };

      if (participantId) {
        // Edit Mode: Update existing participant
        const isUuid = String(participantId).includes('-');

        let updateQuery = supabase
          .from('participants')
          .update(payload);

        updateQuery = isUuid
          ? updateQuery.eq('id', participantId)
          : updateQuery.eq('participant_id', participantId);

        const { error } = await updateQuery;

        if (error) throw error;
        toast.success('تم تحديث بيانات المشارك بنجاح');
      } else {
        // Determine Stage Letter (L)
        const s = String(data.educationStage || '').toLowerCase();
        const y = String(data.educationYear || '').toLowerCase();
        
        let L = 'X';
        if (s.includes('حضانة') || s === 'kg') L = 'K';
        else if (s.includes('ابتدائي') || s.includes('primary')) L = 'P';
        else if (s.includes('إعدادي') || s.includes('preparatory')) L = 'Y';
        else if (s.includes('ثانوي') || s.includes('secondary')) L = 'S';
        else if (s.includes('جامعي') || s.includes('university') || s.includes('خريج') || s.includes('graduate')) L = 'G';

        // Determine Year Number (X)
        let X = '1'; // Default fallback
        if (L === 'K') {
          if (y.includes('baby') || y.includes('بيبي') || y.includes('0')) X = '0';
          else if (y.includes('1') || y.includes('kg1') || y.includes('أول')) X = '1';
          else if (y.includes('2') || y.includes('kg2') || y.includes('ثاني')) X = '2';
        } else if (L === 'G' && (s.includes('خريج') || y.includes('خريج'))) {
          X = '0'; // Graduates
        } else {
          // Check for Arabic/English numerals or words
          if (y.includes('أول') || y.includes('1')) X = '1';
          else if (y.includes('ثاني') || y.includes('2')) X = '2';
          else if (y.includes('ثالث') || y.includes('3')) X = '3';
          else if (y.includes('رابع') || y.includes('4')) X = '4';
          else if (y.includes('خامس') || y.includes('5')) X = '5';
          else if (y.includes('سادس') || y.includes('6')) X = '6';
          else if (y.includes('خريج') || y.includes('0')) X = '0';
        }

        const prefix = `${L}${X}`;

        // Gap-Filling Algorithm specific to the Prefix (LXYY)
        const { data: existingIds, error: fetchError } = await supabase
          .from('participants')
          .select('participant_id')
          .like('participant_id', `${prefix}%`);

        if (fetchError) throw fetchError;

        let nextNum = 1;
        if (existingIds && existingIds.length > 0) {
          const numbers = existingIds
            .map(row => parseInt(String(row.participant_id).replace(prefix, ''), 10))
            .filter(n => !isNaN(n))
            .sort((a, b) => a - b);

          for (const num of numbers) {
            if (num === nextNum) nextNum++;
            else if (num > nextNum) break; // Found the missing gap!
          }
        }
        
        // Final Smart ID format: LXYY (e.g., P301)
        const smartId = `${prefix}${String(nextNum).padStart(2, '0')}`;

        // Insert new participant with calculated Smart ID
        const { error } = await supabase
          .from('participants')
          .insert([{ ...payload, participant_id: smartId, points_balance: 0 }]);

        if (error) throw error;
        toast.success('تم تسجيل المشارك بنجاح');
      }

      await fetchFestivalData();
      setCurrentView('dashboard');
    } catch (err: any) {
      console.error('Error saving participant:', err);
      toast.error(err?.message || 'حدث خطأ أثناء حفظ البيانات');
    }
  };

  const handleDeleteParticipant = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المشارك؟')) return;

    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('تم حذف المشارك بنجاح');

      // Update local state immediately
      setParticipants(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error('Error deleting participant:', err);
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    (async () => {
      const scanned = String(decodedText).trim();

      if (scanMode === 'attendance') {
        if (!currentServant || !currentServant.id) {
          toast.error('يجب تسجيل الدخول كخادم قبل تسجيل الحضور');
          return;
        }

        try {
          // 1. Verify participant by Smart ID (participant_id) or DB UUID (id)
          const { data: participant, error: fetchError } = await supabase
            .from('participants')
            .select('*')
            .or(`participant_id.eq.${scanned},id.eq.${scanned}`)
            .single();

          if (fetchError || !participant) {
            toast.error('هذا الكود غير مسجل في النظام');
            return;
          }

          const participantUuid = participant.id as string;

          // 2. Log attendance (will fail on unique_daily_attendance constraint if already attended today)
          const { error: attendError } = await supabase
            .from('attendance_logs')
            .insert([
              {
                participant_id: participantUuid,
                servant_id: currentServant.id,
                attendance_date: new Date().toISOString().split('T')[0]
              }
            ]);

          if (attendError) {
            // Unique violation or other DB error
            console.warn('attendance insert error', attendError);
            toast.info('تم تسجيل حضور هذا المشارك مسبقاً اليوم');
            return;
          }

          // 3. Add points (+10)
          const currentPoints = Number(participant.points_balance || 0);
          const newPoints = currentPoints + 10;

          const { error: updateError } = await supabase
            .from('participants')
            .update({ points_balance: newPoints })
            .eq('id', participantUuid);

          if (updateError) {
            console.error('Failed to update points:', updateError);
            toast.error('حدث خطأ عند تحديث النقاط');
            return;
          }

          // 4. Record transaction
          const { error: txError } = await supabase.from('points_transactions').insert([
            {
              participant_id: participantUuid,
              servant_id: currentServant.id,
              transaction_type: 'attendance_bonus',
              points_amount: 10,
              description: 'مكافأة حضور اليوم'
            }
          ]);

          if (txError) {
            console.error('Failed to insert points transaction:', txError);
            // Not fatal to user flow
          }

          // Update local state for immediate UI feedback
          setParticipants(prev =>
            prev.map(p =>
              (String(p.id) === String(participant.participant_id) || String(p.id) === String(participantUuid))
                ? { ...p, points: newPoints, attended: true, attendanceDays: [...p.attendanceDays, new Date().toISOString().split('T')[0]] }
                : p
            )
          );

          toast.success('تم تسجيل الحضور بنجاح وإضافة 10 نقاط');
          setCurrentView('dashboard');
        } catch (err) {
          console.error('Attendance handling error', err);
          toast.error('حدث خطأ أثناء تسجيل الحضور');
        }

      } else {
        // non-attendance flows: keep existing demo behavior
        const participant = participants.find(p =>
          String(p.id || '').trim().toUpperCase() === String(scanned).trim().toUpperCase() ||
          String(p.participant_id || '').trim().toUpperCase() === String(scanned).trim().toUpperCase() ||
          String(p.name || '').includes(scanned)
        );
        const targetParticipant = participant || participants[0]; // Use first for demo

        if (scanMode === 'market') {
          setSelectedParticipantId(targetParticipant.id);
          setCurrentView('market');
        } else if (scanMode === 'addPoints') {
          setSelectedParticipantId(targetParticipant.id);
          setCurrentView('addPoints');
        } else if (scanMode === 'viewDetails') {
          setSelectedParticipantId(targetParticipant.id);
          setCurrentView('profile');
        }
      }
    })();
  };

  const handleAttendanceScan = (participant: Participant) => {
    const today = new Date().toISOString().split('T')[0];

    if (participant.attendanceDays.includes(today)) {
      toast.info('تم تسجيل حضور هذا المشارك مسبقاً اليوم', {
        description: participant.name
      });
    } else {
      setParticipants(prev =>
        prev.map(p =>
          p.id === participant.id
            ? {
                ...p,
                attended: true,
                points: p.points + 10,
                attendanceDays: [...p.attendanceDays, today]
              }
            : p
        )
      );
      setTodayAttendance(prev => prev + 1);
      toast.success('تم تسجيل الحضور بنجاح!', {
        description: `${participant.name} - تم إضافة 10 نقاط`
      });
    }
    setCurrentView('dashboard');
  };
  const [isProcessingMarket, setIsProcessingMarket] = useState(false);
  const [isProcessingAddPoints, setIsProcessingAddPoints] = useState(false);
  // Edit / modal state
  const [editData, setEditData] = useState<any | null>(null);

  const resolveParticipantUuid = async (identifier: string) => {
    // Try to resolve whether identifier is UUID (has hyphens) or Smart ID
    if (!identifier) return null;

    // If it looks like a UUID, try to fetch by id
    const maybeUuid = identifier.includes('-');

    if (maybeUuid) {
      const { data, error } = await supabase.from('participants').select('id, participant_id, points_balance').eq('id', identifier).single();
      if (!error && data) return data;
    }

    // Otherwise or fallback, try by participant_id (Smart ID)
    const { data, error } = await supabase.from('participants').select('id, participant_id, points_balance').eq('participant_id', identifier).single();
    if (!error && data) return data;

    return null;
  };

  const handleMarketConfirm = async (pointsToDeduct: number) => {
    if (!selectedParticipantId) return;
    if (!currentServant || !currentServant.id) {
      toast.error('يجب تسجيل الدخول كخادم قبل تنفيذ العملية');
      return;
    }

    setIsProcessingMarket(true);

    try {
      const participantRow: any = await resolveParticipantUuid(selectedParticipantId);
      if (!participantRow) {
        toast.error('المشارك غير موجود في النظام');
        return;
      }

      const participantUuid = participantRow.id;
      const currentPoints = Number(participantRow.points_balance || 0);
      const deduct = Math.abs(Math.floor(pointsToDeduct));
      const newPoints = Math.max(0, currentPoints - deduct);

      const { error: updateError } = await supabase.from('participants').update({ points_balance: newPoints }).eq('id', participantUuid);
      if (updateError) {
        console.error('Failed updating participant points', updateError);
        toast.error('حدث خطأ أثناء تحديث النقاط');
        return;
      }

      const { error: txError } = await supabase.from('points_transactions').insert([
        {
          participant_id: participantUuid,
          servant_id: currentServant.id,
          transaction_type: 'market_deduct',
          points_amount: -Math.abs(deduct),
          description: 'خصم من السوق'
        }
      ]);
      if (txError) {
        console.error('Failed inserting transaction', txError);
        // Not fatal
      }

      // Update UI
      setParticipants(prev => prev.map(p => p.id === selectedParticipantId || p.id === participantUuid ? { ...p, points: newPoints } : p));

      toast.success('تم خصم النقاط بنجاح');
      setSelectedParticipantId(null);
      setCurrentView('dashboard');
    } catch (err) {
      console.error('Market confirm error', err);
      toast.error('حدث خطأ أثناء خصم النقاط');
    } finally {
      setIsProcessingMarket(false);
    }
  };

  const handleAddPointsConfirm = async (pointsToAdd: number) => {
    if (!selectedParticipantId) return;
    if (!currentServant || !currentServant.id) {
      toast.error('يجب تسجيل الدخول كخادم قبل تنفيذ العملية');
      return;
    }

    setIsProcessingAddPoints(true);

    try {
      const participantRow: any = await resolveParticipantUuid(selectedParticipantId);
      if (!participantRow) {
        toast.error('المشارك غير موجود في النظام');
        return;
      }

      const participantUuid = participantRow.id;
      const currentPoints = Number(participantRow.points_balance || 0);
      const add = Math.abs(Math.floor(pointsToAdd));
      const newPoints = currentPoints + add;

      const { error: updateError } = await supabase.from('participants').update({ points_balance: newPoints }).eq('id', participantUuid);
      if (updateError) {
        console.error('Failed updating participant points', updateError);
        toast.error('حدث خطأ أثناء تحديث النقاط');
        return;
      }

      const { error: txError } = await supabase.from('points_transactions').insert([
        {
          participant_id: participantUuid,
          servant_id: currentServant.id,
          transaction_type: 'bonus_add',
          points_amount: Math.abs(add),
          description: 'إضافة نقاط إضافية'
        }
      ]);
      if (txError) {
        console.error('Failed inserting transaction', txError);
      }

      // Update UI
      setParticipants(prev => prev.map(p => p.id === selectedParticipantId || p.id === participantUuid ? { ...p, points: newPoints } : p));

      toast.success('تم إضافة النقاط بنجاح');
      setSelectedParticipantId(null);
      setCurrentView('dashboard');
    } catch (err) {
      console.error('Add points error', err);
      toast.error('حدث خطأ أثناء إضافة النقاط');
    } finally {
      setIsProcessingAddPoints(false);
    }
  };

  const handleManualPointsConfirm = async (participantId: string, points: number, action: 'add' | 'subtract') => {
    try {
      const amount = action === 'add' ? points : -points;

      // 1. Get current points to calculate new balance
      const { data: pData } = await supabase
        .from('participants')
        .select('points_balance')
        .eq('id', participantId)
        .single();

      if (!pData) throw new Error('المشارك غير موجود');

      const newBalance = (pData.points_balance || 0) + amount;

      // 2. Update Participant Balance
      const { error: updateError } = await supabase
        .from('participants')
        .update({ points_balance: newBalance })
        .eq('id', participantId);

      if (updateError) throw updateError;

      // 3. Insert into Transaction History
      const { error: logError } = await supabase
        .from('points_transactions')
        .insert([{
          participant_id: participantId,
          points_amount: amount,
          transaction_type: 'manual',
          description: `تعديل يدوي: ${action === 'add' ? 'إضافة' : 'خصم'} ${points} نقطة`
        }]);

      if (logError) throw logError;

      toast.success('تم تعديل النقاط بنجاح');

      // Update local state to reflect change
      setParticipants(prev => prev.map(p => 
        p.id === participantId ? { ...p, points: newBalance } : p
      ));

      setCurrentView('dashboard'); // Close modal
    } catch (err: any) {
      console.error('Error updating points:', err);
      toast.error('فشل في تعديل النقاط: ' + err.message);
    }
  };

  // --- Edit / Manage points handlers ---
  const handleEditRequest = (record: any, type: 'participant' | 'servant') => {
    setEditData(record);
    setCurrentView(type === 'participant' ? 'registration' : 'signup');
  };

  const handleManagePointsRequest = (participant: any) => {
    const participantId = participant?.participant_id ?? participant?.id ?? participant;
    const participantRecord = participant && typeof participant === 'object'
      ? participant
      : findParticipantByIdentifier(participantId) || null;

    setSelectedParticipantId(participantId);
    setSelectedParticipantForPoints(participantRecord);
    setCurrentView('manualPoints');
  };

  const handleClearEdit = () => setEditData(null);

  const handleViewProfile = (participantId: string) => {
    setViewerRole('servant');
    setSelectedParticipantId(participantId);
    setCurrentView('profile');
  };

  const handleCloseWelcome = () => {
    localStorage.setItem('arribsalin-visited', 'true');
    setShowWelcome(false);
  };

  const selectedParticipant = selectedParticipantId
    ? findParticipantByIdentifier(selectedParticipantId)
    : null;

  const handleProfileBack = () => {
    if (viewerRole === 'student') {
      setSelectedParticipantId(null);
      setCurrentView('studentPortal');
      return;
    }

    setCurrentView('dashboard');
  };

  if (currentView === 'roleSelection') {
    return (
      <>
        <Toaster position="top-center" dir="rtl" />
        <RoleSelectionPage onSelectRole={handleRoleSelect} />
      </>
    );
  }

  if (currentView === 'studentPortal') {
    return (
      <>
        <Toaster position="top-center" dir="rtl" />
        <StudentPortalLogin
          onBack={() => setCurrentView('roleSelection')}
          onLoginById={handleStudentLoginById}
          onOpenScanner={handleOpenStudentScanner}
        />
      </>
    );
  }

  if (currentView === 'studentScanner') {
    return (
      <>
        <Toaster position="top-center" dir="rtl" />
        <QRScanner
          onBack={() => setCurrentView('studentPortal')}
          onScanSuccess={handleScanSuccess}
          mode="viewDetails"
        />
      </>
    );
  }

  if (!isAuthenticated && viewerRole !== 'student') {
    return (
      <>
        <Toaster position="top-center" dir="rtl" />
        {currentView === 'login' && (
          <LoginPage
            onLogin={handleLogin}
            onNavigateToSignup={() => setCurrentView('signup')}
          />
        )}
        {currentView === 'signup' && (
          <SignupPage
            onSignup={handleSignup}
            onBack={() => setCurrentView('login')}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        dir="rtl"
        toastOptions={{
          style: {
            fontFamily: 'Tajawal, Cairo, sans-serif'
          }
        }}
      />

      {showWelcome && <WelcomeScreen onClose={handleCloseWelcome} />}

      <div className="size-full">
        {currentView === 'dashboard' && (
          <Dashboard
            onNavigate={handleNavigate}
            onViewProfile={handleViewProfile}
            onLogout={handleLogout}
            currentServant={currentServant}
            participants={participants.map(p => ({
              id: p.participant_id || p.id,
              participant_id: p.participant_id,
              dbId: p.id,
              name: p.name,
              points: p.points,
              attended: p.attended,
              data: p.data
            }))}
            onEditRequest={(rec) => handleEditRequest(rec, 'participant')}
            onManagePoints={(rec) => handleManagePointsRequest(rec)}
            onDeleteParticipant={handleDeleteParticipant}
          />
        )}

        {currentView === 'registration' && (
          <RegistrationForm
            onBack={() => { setCurrentView('dashboard'); handleClearEdit(); }}
            onSubmit={async (data, participantId) => {
              await handleRegistrationSubmit(data, participantId);
              handleClearEdit();
            }}
            editData={editData}
          />
        )}

        {currentView === 'signup' && (
          <SignupPage
            onSignup={(data) => {
              setCurrentView('teachers');
              handleClearEdit();
            }}
            onBack={() => {
              setCurrentView('teachers');
              handleClearEdit();
            }}
            editData={editData}
            clearEdit={handleClearEdit}
          />
        )}

        {currentView === 'scanner' && (
          <QRScanner
            onBack={() => setCurrentView('dashboard')}
            onScanSuccess={handleScanSuccess}
            mode={scanMode}
          />
        )}

        {currentView === 'market' && selectedParticipant && (
          <MarketModal
            participantName={selectedParticipant.name}
            currentPoints={selectedParticipant.points}
            onConfirm={handleMarketConfirm}
            onCancel={() => {
              setSelectedParticipantId(null);
              setCurrentView('dashboard');
            }}
          />
        )}

        {currentView === 'addPoints' && selectedParticipant && (
          <AddPointsModal
            participantName={selectedParticipant.name}
            currentPoints={selectedParticipant.points}
            onConfirm={handleAddPointsConfirm}
            onCancel={() => {
              setSelectedParticipantId(null);
              setCurrentView('dashboard');
            }}
          />
        )}

        {currentView === 'manualPoints' && (
          <ManualPointsModal
            participants={participants.map(p => ({
              id: p.participant_id || p.id,
              participant_id: p.participant_id,
              dbId: p.id,
              name: p.name,
              points: p.points
            }))}
            onConfirm={handleManualPointsConfirm}
            initialParticipant={selectedParticipantForPoints ? {
              id: selectedParticipantForPoints.participant_id || selectedParticipantForPoints.id,
              dbId: selectedParticipantForPoints.id,
              name: selectedParticipantForPoints.name,
              points: selectedParticipantForPoints.points
            } : null}
            onCancel={() => {
              setSelectedParticipantForPoints(null);
              setSelectedParticipantId(null);
              setCurrentView('dashboard');
            }}
          />
        )}

        {currentView === 'profile' && (
          selectedParticipant ? (
            <StudentProfile
              student={selectedParticipant}
              totalDays={getActiveDaysForClass(getStudentClassKey(selectedParticipant))}
              onBack={handleProfileBack}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-lg font-semibold mb-4">حدث خطأ: لم يتم العثور على بيانات المشارك</h2>
              <p className="mb-6">الرجاء المحاولة مرة أخرى أو العودة إلى بوابة الطلاب.</p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => {
                  setSelectedParticipantId(null);
                  setCurrentView('studentPortal');
                }}
              >
                العودة
              </button>
            </div>
          )
        )}

        {currentView === 'finance' && (
          <FinancePage
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'statistics' && (
          <StatisticsPage
            onBack={() => setCurrentView('dashboard')}
            participants={participants}
            totalDays={getOverallActiveDays()}
          />
        )}

        {currentView === 'teachers' && (
          <TeachersPage
            onBack={() => setCurrentView('dashboard')}
            onEdit={(rec: any) => handleEditRequest(rec, 'servant')}
            onViewProfile={(id: string) => { setSelectedServantProfileId(id); setCurrentView('servantProfile'); }}
          />
        )}

        {currentView === 'servantProfile' && selectedServantProfileId && (
          <ServantProfile
            servantId={selectedServantProfileId}
            onBack={() => { setSelectedServantProfileId(null); setCurrentView('teachers'); }}
          />
        )}
      </div>
    </>
  );
}
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export type ViewerRole = 'servant' | 'student';

export interface FestivalState {
  isAuthenticated: boolean;
  currentServant: any | null;
  viewerRole: ViewerRole;
  participants: any[];
  todayAttendance: number;
  isInitialized: boolean;

  setAuth: (isAuthenticated: boolean) => void;
  setCurrentServant: (servant: any) => void;
  setViewerRole: (role: ViewerRole) => void;
  setParticipants: (participants: any[] | ((prev: any[]) => any[])) => void;
  setTodayAttendance: (val: number | ((prev: number) => number)) => void;
  setInitialized: (initialized: boolean) => void;
  logout: () => Promise<void>;
  fetchData: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useFestivalStore = create<FestivalState>((set, get) => ({
  isAuthenticated: false,
  currentServant: null,
  viewerRole: 'servant',
  participants: [],
  todayAttendance: 25,
  isInitialized: false,

  setAuth: (isAuthenticated: boolean) => set({ isAuthenticated }),
  
  setCurrentServant: (servant: any) => set({ currentServant: servant }),
  
  setViewerRole: (role: ViewerRole) => set({ viewerRole: role }),
  
  setParticipants: (participants: any[] | ((prev: any[]) => any[])) => {
    if (typeof participants === 'function') {
      set((state) => ({ participants: participants(state.participants) }));
    } else {
      set({ participants });
    }
  },

  setTodayAttendance: (val: number | ((prev: number) => number)) => {
    if (typeof val === 'function') {
      set((state) => ({ todayAttendance: val(state.todayAttendance) }));
    } else {
      set({ todayAttendance: val });
    }
  },

  setInitialized: (initialized: boolean) => set({ isInitialized: initialized }),

  logout: async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    set({
      isAuthenticated: false,
      currentServant: null,
      viewerRole: 'servant',
    });
    toast.success('تم تسجيل الخروج بنجاح');
  },

  fetchData: async () => {
    try {
      // Step 1: Fetch all participants (Safe query)
      const { data: pData, error: pError } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false });

      if (pError) throw pError;

      if (pData && pData.length > 0) {
        // Step 2: Fetch attendance logs for these participants independently
        const { data: logsData, error: logsError } = await supabase
          .from('attendance_logs')
          .select('participant_id, scanned_at, attendance_date')
          .limit(50000);

        if (logsError) {
          console.warn('Could not fetch attendance logs, continuing without them:', logsError);
        }

        const today = new Date().toISOString().split('T')[0];

        // Step 3: Merge them in memory
        const mapped = pData.map((p: any) => {
          // Find all logs for this specific participant
          const pLogs = (logsData || []).filter((log: any) => log.participant_id === p.id);

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
            photo_url: p.photo_url,
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

        set({ participants: mapped });
      } else {
        set({ participants: [] });
      }
    } catch (error) {
      console.error('Error fetching participants data:', error);
    }
  },

  initializeAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: servantData, error } = await supabase
          .from('servants')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!error && servantData) {
          set({
            currentServant: servantData,
            isAuthenticated: true,
            viewerRole: 'servant',
          });
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ isInitialized: true });
    }
  }
}));

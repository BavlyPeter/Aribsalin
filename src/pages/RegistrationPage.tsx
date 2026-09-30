import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RegistrationForm } from '../components/forms/RegistrationForm';
import { StudentData } from '../types';
import { supabase } from '../lib/supabase';
import { useFestivalStore } from '../store/useFestivalStore';
import { toast } from 'sonner';
import { generateSmartIdPrefix } from '../config/tenant';

export function RegistrationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const { fetchData, currentServant, isInitialized } = useFestivalStore();
  const [editData, setEditData] = useState<any | null>(editId ? { id: editId } : null);

  useEffect(() => {
    if (isInitialized && (!currentServant || !['admin', 'supervisor', 'developer'].includes(currentServant.role))) {
      navigate('/login');
    }
  }, [isInitialized, currentServant, navigate]);

  useEffect(() => {
    if (editId) {
      setEditData({ id: editId });
    } else {
      setEditData(null);
    }
  }, [editId]);

  const handleSubmit = async (data: StudentData, participantId?: string) => {
    try {
      const normalizedFullName = String(data.fullName || '').trim();

      // Enforce unique participant full name
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
        return;
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
        const prefix = generateSmartIdPrefix(data.educationStage || '', data.educationYear || '');

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
            else if (num > nextNum) break;
          }
        }
        
        const smartId = `${prefix}${String(nextNum).padStart(2, '0')}`;

        const { error } = await supabase
          .from('participants')
          .insert([{ ...payload, participant_id: smartId, points_balance: 0 }]);

        if (error) throw error;
        toast.success('تم تسجيل المشارك بنجاح');
      }

      await fetchData();
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Error saving participant:', err);
      toast.error(err?.message || 'حدث خطأ أثناء حفظ البيانات');
    }
  };

  return (
    <RegistrationForm
      onBack={() => navigate('/dashboard')}
      onSubmit={handleSubmit}
      editData={editData}
      clearEdit={() => setEditData(null)}
    />
  );
}

export default RegistrationPage;

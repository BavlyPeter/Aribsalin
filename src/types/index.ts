export interface StudentData {
  fullName: string;
  gender: 'male' | 'female' | '';
  photo_url?: string | null;
  educationStage: string;
  educational_stage?: string;
  educationYear: string;
  academic_year?: string;
  studyOrWorkPlace: string;
  universityName?: string;
  collegeName?: string;
  jobTitle?: string;
  confessionFather: string;
  personalMobile: string;
  fatherMobile: string;
  motherMobile: string;
  area: string;
  address_area?: string;
  address: string;
  dateOfBirth: string;
}

export interface ParticipantData {
  fullName: string;
  gender: 'male' | 'female' | '';
  educationStage: string;
  confessionFather: string;
  personalMobile: string;
  fatherMobile: string;
  motherMobile: string;
  area: string;
  address: string;
}

export interface Participant {
  id: string;
  participant_id?: string | number;
  name: string;
  points: number;
  attended: boolean;
  data: StudentData;
  attendanceDays: string[];
}

export interface TeacherData {
  fullName: string;
  gender: 'male' | 'female' | '';
  photo_url?: string | null;
  educationStage: string;
  educationYear: string;
  studyOrWorkPlace: string;
  universityName?: string;
  collegeName?: string;
  jobTitle?: string;
  confessionFather: string;
  // Authentication & RBAC
  teacherId: string;
  password: string;
  role: 'normal' | 'supervisor' | 'admin' | '';
  classStage: string;
  mobile: string;
  area: string;
  address: string;
  dateOfBirth: string;
}

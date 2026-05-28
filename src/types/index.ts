export interface StudentData {
  fullName: string;
  gender: 'male' | 'female' | '';
  educationStage: string;
  educationYear: string;
  studyOrWorkPlace: string;
  universityName?: string;
  collegeName?: string;
  jobTitle?: string;
  confessionFather: string;
  personalMobile: string;
  fatherMobile: string;
  motherMobile: string;
  area: string;
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

export interface TeacherData {
  fullName: string;
  gender: 'male' | 'female' | '';
  educationStage: string;
  educationYear: string;
  studyOrWorkPlace: string;
  universityName?: string;
  collegeName?: string;
  jobTitle?: string;
  confessionFather: string;
  mobile: string;
  area: string;
  address: string;
  dateOfBirth: string;
}

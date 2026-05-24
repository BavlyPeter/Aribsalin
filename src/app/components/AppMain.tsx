import { useState, useEffect } from 'react';
import { LoginPage } from './LoginPage';
import { SignupPage, TeacherData } from './SignupPage';
import { EnhancedDashboard } from './EnhancedDashboard';
import { EnhancedRegistrationForm, StudentData } from './EnhancedRegistrationForm';
import { QRScanner } from './QRScanner';
import { MarketModal } from './MarketModal';
import { AddPointsModal } from './AddPointsModal';
import { ManualPointsModal } from './ManualPointsModal';
import { StudentProfile } from './StudentProfile';
import { WelcomeScreen } from './WelcomeScreen';
import { FinancePage } from './FinancePage';
import { StatisticsPage } from './StatisticsPage';
import { TeachersPage } from './TeachersPage';
import { toast, Toaster } from 'sonner';

type View = 'login' | 'signup' | 'dashboard' | 'registration' | 'scanner' | 'market' | 'addPoints' | 'manualPoints' | 'profile' | 'finance' | 'statistics' | 'teachers';
type ScanMode = 'attendance' | 'market' | 'addPoints' | 'viewDetails';

interface Participant {
  id: string;
  name: string;
  points: number;
  attended: boolean;
  data: StudentData;
  attendanceDays: string[];
}

export default function AppMain() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentView, setCurrentView] = useState<View>('login');
  const [scanMode, setScanMode] = useState<ScanMode>('attendance');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [totalDays] = useState(20); // Total festival days

  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'P001',
      name: 'مارك جرجس عبد المسيح',
      points: 150,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-05', '2025-07-06', '2025-07-08', '2025-07-09', '2025-07-10'],
      data: {
        fullName: 'مارك جرجس عبد المسيح',
        gender: 'male',
        educationStage: 'secondary',
        educationYear: 'الصف الثالث الثانوي',
        studyOrWorkPlace: 'مدرسة الأقباط الثانوية',
        confessionFather: 'أبونا يوسف',
        personalMobile: '01012345678',
        fatherMobile: '01098765432',
        motherMobile: '01123456789',
        address: 'القاهرة - مصر الجديدة - شارع النزهة',
        dateOfBirth: '2007-05-15'
      }
    },
    {
      id: 'P002',
      name: 'مريم بطرس فهمي',
      points: 200,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04', '2025-07-05', '2025-07-06', '2025-07-07', '2025-07-08', '2025-07-09', '2025-07-10', '2025-07-11'],
      data: {
        fullName: 'مريم بطرس فهمي',
        gender: 'female',
        educationStage: 'university',
        educationYear: 'الفرقة الثانية',
        studyOrWorkPlace: '',
        universityName: 'جامعة القاهرة',
        collegeName: 'كلية الهندسة',
        confessionFather: 'أبونا أنطونيوس',
        personalMobile: '01087654321',
        fatherMobile: '01156789012',
        motherMobile: '01234567890',
        address: 'الجيزة - المهندسين - شارع جامعة الدول',
        dateOfBirth: '2004-12-20'
      }
    },
    {
      id: 'P003',
      name: 'بولس ميلاد سمير',
      points: 75,
      attended: true,
      attendanceDays: ['2025-07-02', '2025-07-03', '2025-07-05', '2025-07-08'],
      data: {
        fullName: 'بولس ميلاد سمير',
        gender: 'male',
        educationStage: 'graduate',
        educationYear: '',
        studyOrWorkPlace: 'شركة البركة للتطوير',
        jobTitle: 'مهندس برمجيات',
        confessionFather: 'أبونا مكاريوس',
        personalMobile: '01145678901',
        fatherMobile: '01298765432',
        motherMobile: '01187654321',
        address: 'الإسكندرية - سيدي جابر - شارع فؤاد',
        dateOfBirth: '1998-08-10'
      }
    },
    {
      id: 'P004',
      name: 'كيرلس عادل رمزي',
      points: 180,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04', '2025-07-06', '2025-07-07', '2025-07-09', '2025-07-10', '2025-07-11'],
      data: {
        fullName: 'كيرلس عادل رمزي',
        gender: 'male',
        educationStage: 'preparatory',
        educationYear: 'الصف الثاني الإعدادي',
        studyOrWorkPlace: 'مدرسة مارمرقس الإعدادية',
        confessionFather: 'أبونا يوسف',
        personalMobile: '01023456789',
        fatherMobile: '01134567890',
        motherMobile: '01245678901',
        address: 'القاهرة - المعادي - شارع 9',
        dateOfBirth: '2011-03-22'
      }
    },
    {
      id: 'P005',
      name: 'فيرونيا سمير نصيف',
      points: 165,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-03', '2025-07-04', '2025-07-06', '2025-07-07', '2025-07-08', '2025-07-10', '2025-07-11'],
      data: {
        fullName: 'فيرونيا سمير نصيف',
        gender: 'female',
        educationStage: 'primary',
        educationYear: 'الصف الخامس الابتدائي',
        studyOrWorkPlace: 'مدرسة الراعي الصالح',
        confessionFather: 'أبونا بولس',
        personalMobile: '',
        fatherMobile: '01056789012',
        motherMobile: '01167890123',
        address: 'الجيزة - الدقي - شارع التحرير',
        dateOfBirth: '2014-09-10'
      }
    },
    {
      id: 'P006',
      name: 'أندرو مجدي فايق',
      points: 95,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-04', '2025-07-07', '2025-07-09'],
      data: {
        fullName: 'أندرو مجدي فايق',
        gender: 'male',
        educationStage: 'university',
        educationYear: 'الفرقة الرابعة',
        studyOrWorkPlace: '',
        universityName: 'جامعة عين شمس',
        collegeName: 'كلية الطب',
        confessionFather: 'أبونا أنطونيوس',
        personalMobile: '01078901234',
        fatherMobile: '01189012345',
        motherMobile: '01290123456',
        address: 'القاهرة - مصر الجديدة - النزهة الجديدة',
        dateOfBirth: '2002-11-05'
      }
    },
    {
      id: 'P007',
      name: 'مارينا عماد وليم',
      points: 220,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04', '2025-07-05', '2025-07-06', '2025-07-07', '2025-07-08', '2025-07-09', '2025-07-10', '2025-07-11', '2025-07-12'],
      data: {
        fullName: 'مارينا عماد وليم',
        gender: 'female',
        educationStage: 'secondary',
        educationYear: 'الصف الأول الثانوي',
        studyOrWorkPlace: 'مدرسة النصر الثانوية',
        confessionFather: 'أبونا مكاريوس',
        personalMobile: '01001234567',
        fatherMobile: '01112345678',
        motherMobile: '01223456789',
        address: 'القاهرة - النزهة - شارع يوسف عباس',
        dateOfBirth: '2009-01-18'
      }
    },
    {
      id: 'P008',
      name: 'يوستينا نبيل سعد',
      points: 130,
      attended: true,
      attendanceDays: ['2025-07-02', '2025-07-03', '2025-07-05', '2025-07-07', '2025-07-09', '2025-07-11'],
      data: {
        fullName: 'يوستينا نبيل سعد',
        gender: 'female',
        educationStage: 'preparatory',
        educationYear: 'الصف الثالث الإعدادي',
        studyOrWorkPlace: 'مدرسة السيدة العذراء الإعدادية',
        confessionFather: 'أبونا يوسف',
        personalMobile: '01034567890',
        fatherMobile: '01145678901',
        motherMobile: '01256789012',
        address: 'الجيزة - فيصل - شارع العشرين',
        dateOfBirth: '2010-06-30'
      }
    },
    {
      id: 'P009',
      name: 'جورج رأفت إبراهيم',
      points: 45,
      attended: false,
      attendanceDays: ['2025-07-01', '2025-07-05', '2025-07-10'],
      data: {
        fullName: 'جورج رأفت إبراهيم',
        gender: 'male',
        educationStage: 'primary',
        educationYear: 'الصف الثالث الابتدائي',
        studyOrWorkPlace: 'مدرسة الأنبا أنطونيوس',
        confessionFather: 'أبونا بولس',
        personalMobile: '',
        fatherMobile: '01067890123',
        motherMobile: '01178901234',
        address: 'القاهرة - حلوان - شارع المدارس',
        dateOfBirth: '2016-04-12'
      }
    },
    {
      id: 'P010',
      name: 'كريستينا ماجد ميخائيل',
      points: 190,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04', '2025-07-05', '2025-07-06', '2025-07-08', '2025-07-09', '2025-07-10', '2025-07-11'],
      data: {
        fullName: 'كريستينا ماجد ميخائيل',
        gender: 'female',
        educationStage: 'university',
        educationYear: 'الفرقة الثالثة',
        studyOrWorkPlace: '',
        universityName: 'الجامعة الأمريكية',
        collegeName: 'كلية الإدارة',
        confessionFather: 'أبونا أنطونيوس',
        personalMobile: '01089012345',
        fatherMobile: '01190123456',
        motherMobile: '01201234567',
        address: 'القاهرة - التجمع الخامس - الرحاب',
        dateOfBirth: '2003-07-25'
      }
    },
    {
      id: 'P011',
      name: 'مينا صموئيل فوزي',
      points: 110,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-03', '2025-07-06', '2025-07-08', '2025-07-10'],
      data: {
        fullName: 'مينا صموئيل فوزي',
        gender: 'male',
        educationStage: 'kg',
        educationYear: 'KG2',
        studyOrWorkPlace: 'حضانة النور',
        confessionFather: 'أبونا مكاريوس',
        personalMobile: '',
        fatherMobile: '01012345098',
        motherMobile: '01123450987',
        address: 'الجيزة - الهرم - شارع الهرم الرئيسي',
        dateOfBirth: '2020-02-14'
      }
    },
    {
      id: 'P012',
      name: 'آية نشأت رزق',
      points: 85,
      attended: true,
      attendanceDays: ['2025-07-02', '2025-07-04', '2025-07-07', '2025-07-09'],
      data: {
        fullName: 'آية نشأت رزق',
        gender: 'female',
        educationStage: 'graduate',
        educationYear: '',
        studyOrWorkPlace: 'مستشفى دار الشفاء',
        jobTitle: 'صيدلانية',
        confessionFather: 'أبونا يوسف',
        personalMobile: '01098765432',
        fatherMobile: '01187654321',
        motherMobile: '01276543210',
        address: 'القاهرة - مدينة نصر - شارع مصطفى النحاس',
        dateOfBirth: '1999-10-08'
      }
    },
    {
      id: 'P013',
      name: 'بيشوي مجدي حنا',
      points: 155,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-02', '2025-07-04', '2025-07-05', '2025-07-07', '2025-07-08', '2025-07-10'],
      data: {
        fullName: 'بيشوي مجدي حنا',
        gender: 'male',
        educationStage: 'secondary',
        educationYear: 'الصف الثاني الثانوي',
        studyOrWorkPlace: 'مدرسة الليسيه الفرنسية',
        confessionFather: 'أبونا بولس',
        personalMobile: '01045678123',
        fatherMobile: '01156781234',
        motherMobile: '01267812345',
        address: 'الجيزة - المهندسين - شارع البطل',
        dateOfBirth: '2008-12-03'
      }
    },
    {
      id: 'P014',
      name: 'ساندرا سامح توفيق',
      points: 175,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-05', '2025-07-06', '2025-07-07', '2025-07-08', '2025-07-09', '2025-07-11'],
      data: {
        fullName: 'ساندرا سامح توفيق',
        gender: 'female',
        educationStage: 'primary',
        educationYear: 'الصف السادس الابتدائي',
        studyOrWorkPlace: 'مدرسة القديس يوسف',
        confessionFather: 'أبونا مكاريوس',
        personalMobile: '',
        fatherMobile: '01067812456',
        motherMobile: '01178123456',
        address: 'القاهرة - الزمالك - شارع البرازيل',
        dateOfBirth: '2013-05-20'
      }
    },
    {
      id: 'P015',
      name: 'أنطونيوس عزت صليب',
      points: 60,
      attended: false,
      attendanceDays: ['2025-07-03', '2025-07-06', '2025-07-11'],
      data: {
        fullName: 'أنطونيوس عزت صليب',
        gender: 'male',
        educationStage: 'university',
        educationYear: 'الفرقة الأولى',
        studyOrWorkPlace: '',
        universityName: 'جامعة القاهرة',
        collegeName: 'كلية الآداب',
        confessionFather: 'أبونا أنطونيوس',
        personalMobile: '01078123567',
        fatherMobile: '01189234567',
        motherMobile: '01290345678',
        address: 'الجيزة - الدقي - شارع المساحة',
        dateOfBirth: '2005-08-15'
      }
    },
    {
      id: 'P016',
      name: 'نانسي نبيل عزيز',
      points: 140,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-02', '2025-07-04', '2025-07-06', '2025-07-08', '2025-07-10'],
      data: {
        fullName: 'نانسي نبيل عزيز',
        gender: 'female',
        educationStage: 'preparatory',
        educationYear: 'الصف الأول الإعدادي',
        studyOrWorkPlace: 'مدرسة العذراء الإعدادية',
        confessionFather: 'أبونا يوسف',
        personalMobile: '',
        fatherMobile: '01001234789',
        motherMobile: '01112347890',
        address: 'القاهرة - شبرا - شارع شبرا',
        dateOfBirth: '2012-11-28'
      }
    },
    {
      id: 'P017',
      name: 'رامي رؤوف نجيب',
      points: 125,
      attended: true,
      attendanceDays: ['2025-07-02', '2025-07-03', '2025-07-05', '2025-07-07', '2025-07-09', '2025-07-11'],
      data: {
        fullName: 'رامي رؤوف نجيب',
        gender: 'male',
        educationStage: 'graduate',
        educationYear: '',
        studyOrWorkPlace: 'شركة المقاولون العرب',
        jobTitle: 'مهندس مدني',
        confessionFather: 'أبونا بولس',
        personalMobile: '01023456123',
        fatherMobile: '01134561234',
        motherMobile: '01245612345',
        address: 'القاهرة - مصر الجديدة - ميدان الحجاز',
        dateOfBirth: '1997-03-12'
      }
    },
    {
      id: 'P018',
      name: 'ماريان ميشيل بشاي',
      points: 205,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04', '2025-07-05', '2025-07-06', '2025-07-07', '2025-07-08', '2025-07-09', '2025-07-10', '2025-07-11', '2025-07-12'],
      data: {
        fullName: 'ماريان ميشيل بشاي',
        gender: 'female',
        educationStage: 'secondary',
        educationYear: 'الصف الثالث الثانوي',
        studyOrWorkPlace: 'مدرسة الأورمان الثانوية',
        confessionFather: 'أبونا مكاريوس',
        personalMobile: '01034561456',
        fatherMobile: '01145614567',
        motherMobile: '01256145678',
        address: 'الجيزة - الأورمان - شارع الجيزة',
        dateOfBirth: '2007-02-28'
      }
    },
    {
      id: 'P019',
      name: 'دانيال شنودة أمين',
      points: 100,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-04', '2025-07-07', '2025-07-10'],
      data: {
        fullName: 'دانيال شنودة أمين',
        gender: 'male',
        educationStage: 'kg',
        educationYear: 'KG1',
        studyOrWorkPlace: 'حضانة الملائكة',
        confessionFather: 'أبونا أنطونيوس',
        personalMobile: '',
        fatherMobile: '01067814589',
        motherMobile: '01178145890',
        address: 'الجيزة - المنيل - شارع المنيل',
        dateOfBirth: '2021-09-05'
      }
    },
    {
      id: 'P020',
      name: 'جيسيكا وليم صادق',
      points: 160,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-05', '2025-07-06', '2025-07-08', '2025-07-09', '2025-07-11'],
      data: {
        fullName: 'جيسيكا وليم صادق',
        gender: 'female',
        educationStage: 'primary',
        educationYear: 'الصف الرابع الابتدائي',
        studyOrWorkPlace: 'مدرسة المستقبل',
        confessionFather: 'أبونا يوسف',
        personalMobile: '',
        fatherMobile: '01089145678',
        motherMobile: '01190156789',
        address: 'القاهرة - مدينة نصر - شارع عباس العقاد',
        dateOfBirth: '2015-07-07'
      }
    },
    {
      id: 'P021',
      name: 'فادي رمزي عياد',
      points: 35,
      attended: false,
      attendanceDays: ['2025-07-02', '2025-07-08'],
      data: {
        fullName: 'فادي رمزي عياد',
        gender: 'male',
        educationStage: 'secondary',
        educationYear: 'الصف الأول الثانوي',
        studyOrWorkPlace: 'مدرسة السلام الثانوية',
        confessionFather: 'أبونا بولس',
        personalMobile: '01023456890',
        fatherMobile: '01134567901',
        motherMobile: '01245678012',
        address: 'الجيزة - العجوزة - شارع السودان',
        dateOfBirth: '2009-04-11'
      }
    },
    {
      id: 'P022',
      name: 'إيريني حبيب جرجس',
      points: 240,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04', '2025-07-05', '2025-07-06', '2025-07-07', '2025-07-08', '2025-07-09', '2025-07-10', '2025-07-11', '2025-07-12', '2025-07-13', '2025-07-14'],
      data: {
        fullName: 'إيريني حبيب جرجس',
        gender: 'female',
        educationStage: 'preparatory',
        educationYear: 'الصف الثالث الإعدادي',
        studyOrWorkPlace: 'مدرسة الأنبا أنطونيوس الإعدادية',
        confessionFather: 'أبونا أنطونيوس',
        personalMobile: '01056789234',
        fatherMobile: '01167890345',
        motherMobile: '01278901456',
        address: 'القاهرة - حدائق القبة - شارع ميرغني',
        dateOfBirth: '2010-01-09'
      }
    },
    {
      id: 'P023',
      name: 'صموئيل فوزي عزيز',
      points: 15,
      attended: false,
      attendanceDays: ['2025-07-05'],
      data: {
        fullName: 'صموئيل فوزي عزيز',
        gender: 'male',
        educationStage: 'kg',
        educationYear: 'Baby Class',
        studyOrWorkPlace: 'حضانة القديسة مارينا',
        confessionFather: 'أبونا مكاريوس',
        personalMobile: '',
        fatherMobile: '01012348765',
        motherMobile: '01123459876',
        address: 'الجيزة - المنيب - شارع المريوطية',
        dateOfBirth: '2022-11-20'
      }
    },
    {
      id: 'P024',
      name: 'مرثا إميل إبراهيم',
      points: 185,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04', '2025-07-05', '2025-07-07', '2025-07-08', '2025-07-10', '2025-07-11', '2025-07-12'],
      data: {
        fullName: 'مرثا إميل إبراهيم',
        gender: 'female',
        educationStage: 'university',
        educationYear: 'الفرقة الثانية',
        studyOrWorkPlace: '',
        universityName: 'جامعة حلوان',
        collegeName: 'كلية الصيدلة',
        confessionFather: 'أبونا يوسف',
        personalMobile: '01098764321',
        fatherMobile: '01187653210',
        motherMobile: '01276542109',
        address: 'القاهرة - حلوان - شارع جامعة حلوان',
        dateOfBirth: '2004-06-18'
      }
    },
    {
      id: 'P025',
      name: 'أبانوب رافت ميخائيل',
      points: 270,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04', '2025-07-05', '2025-07-06', '2025-07-07', '2025-07-08', '2025-07-09', '2025-07-10', '2025-07-11', '2025-07-12', '2025-07-13', '2025-07-14', '2025-07-15'],
      data: {
        fullName: 'أبانوب رافت ميخائيل',
        gender: 'male',
        educationStage: 'graduate',
        educationYear: '',
        studyOrWorkPlace: 'مستشفى القصر العيني',
        jobTitle: 'طبيب باطنة',
        confessionFather: 'أبونا بولس',
        personalMobile: '01045672345',
        fatherMobile: '01156783456',
        motherMobile: '01267894567',
        address: 'القاهرة - المنيل - شارع الجامعة',
        dateOfBirth: '1995-09-25'
      }
    },
    {
      id: 'P026',
      name: 'سيلفيا سمير رزق',
      points: 50,
      attended: false,
      attendanceDays: ['2025-07-01', '2025-07-04', '2025-07-09'],
      data: {
        fullName: 'سيلفيا سمير رزق',
        gender: 'female',
        educationStage: 'primary',
        educationYear: 'الصف الثاني الابتدائي',
        studyOrWorkPlace: 'مدرسة النصر الابتدائية',
        confessionFather: 'أبونا أنطونيوس',
        personalMobile: '',
        fatherMobile: '01067893456',
        motherMobile: '01178904567',
        address: 'القاهرة - عين شمس - شارع الحجاز',
        dateOfBirth: '2017-03-15'
      }
    },
    {
      id: 'P027',
      name: 'يوحنا عاطف نصيف',
      points: 230,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04', '2025-07-05', '2025-07-06', '2025-07-07', '2025-07-08', '2025-07-09', '2025-07-10', '2025-07-11', '2025-07-12', '2025-07-13'],
      data: {
        fullName: 'يوحنا عاطف نصيف',
        gender: 'male',
        educationStage: 'secondary',
        educationYear: 'الصف الثالث الثانوي',
        studyOrWorkPlace: 'مدرسة الكلية الإكليريكية',
        confessionFather: 'أبونا مكاريوس',
        personalMobile: '01034567234',
        fatherMobile: '01145678345',
        motherMobile: '01256789456',
        address: 'القاهرة - العباسية - شارع رمسيس',
        dateOfBirth: '2007-08-30'
      }
    },
    {
      id: 'P028',
      name: 'إليزابيث نبيل حنا',
      points: 20,
      attended: false,
      attendanceDays: ['2025-07-03', '2025-07-11'],
      data: {
        fullName: 'إليزابيث نبيل حنا',
        gender: 'female',
        educationStage: 'university',
        educationYear: 'الفرقة الأولى',
        studyOrWorkPlace: '',
        universityName: 'جامعة المنصورة',
        collegeName: 'كلية التجارة',
        confessionFather: 'أبونا يوسف',
        personalMobile: '01078904567',
        fatherMobile: '01189015678',
        motherMobile: '01290126789',
        address: 'المنصورة - ميت حدر - شارع الجيش',
        dateOfBirth: '2005-12-12'
      }
    },
    {
      id: 'P029',
      name: 'فيلوباتير جورج صليب',
      points: 195,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04', '2025-07-05', '2025-07-06', '2025-07-08', '2025-07-09', '2025-07-10', '2025-07-12'],
      data: {
        fullName: 'فيلوباتير جورج صليب',
        gender: 'male',
        educationStage: 'preparatory',
        educationYear: 'الصف الأول الإعدادي',
        studyOrWorkPlace: 'مدرسة الشهيد مارجرجس الإعدادية',
        confessionFather: 'أبونا بولس',
        personalMobile: '',
        fatherMobile: '01001235678',
        motherMobile: '01112346789',
        address: 'القاهرة - شبرا - ميدان شبرا',
        dateOfBirth: '2012-05-05'
      }
    },
    {
      id: 'P030',
      name: 'كارولين ماهر سليمان',
      points: 145,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-03', '2025-07-05', '2025-07-07', '2025-07-09', '2025-07-11', '2025-07-13'],
      data: {
        fullName: 'كارولين ماهر سليمان',
        gender: 'female',
        educationStage: 'graduate',
        educationYear: '',
        studyOrWorkPlace: 'بنك مصر',
        jobTitle: 'محاسبة',
        confessionFather: 'أبونا أنطونيوس',
        personalMobile: '01023457890',
        fatherMobile: '01134568901',
        motherMobile: '01245679012',
        address: 'الجيزة - الدقي - شارع النيل',
        dateOfBirth: '2000-02-20'
      }
    },
    {
      id: 'P031',
      name: 'مايكل سامي يوسف',
      points: 5,
      attended: false,
      attendanceDays: [],
      data: {
        fullName: 'مايكل سامي يوسف',
        gender: 'male',
        educationStage: 'kg',
        educationYear: 'KG2',
        studyOrWorkPlace: 'حضانة السيدة العذراء',
        confessionFather: 'أبونا مكاريوس',
        personalMobile: '',
        fatherMobile: '01056780123',
        motherMobile: '01167891234',
        address: 'الجيزة - بولاق الدكرور - شارع السودان',
        dateOfBirth: '2020-10-30'
      }
    },
    {
      id: 'P032',
      name: 'تريزا عادل منير',
      points: 215,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04', '2025-07-05', '2025-07-06', '2025-07-07', '2025-07-08', '2025-07-09', '2025-07-10', '2025-07-11', '2025-07-12'],
      data: {
        fullName: 'تريزا عادل منير',
        gender: 'female',
        educationStage: 'primary',
        educationYear: 'الصف السادس الابتدائي',
        studyOrWorkPlace: 'مدرسة القديسة تريزا',
        confessionFather: 'أبونا يوسف',
        personalMobile: '',
        fatherMobile: '01089012345',
        motherMobile: '01190123456',
        address: 'القاهرة - مصر الجديدة - روكسي',
        dateOfBirth: '2013-07-22'
      }
    },
    {
      id: 'P033',
      name: 'بيتر رؤوف عزت',
      points: 170,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-02', '2025-07-04', '2025-07-05', '2025-07-06', '2025-07-08', '2025-07-10', '2025-07-12'],
      data: {
        fullName: 'بيتر رؤوف عزت',
        gender: 'male',
        educationStage: 'university',
        educationYear: 'الفرقة الثالثة',
        studyOrWorkPlace: '',
        universityName: 'جامعة الأزهر',
        collegeName: 'كلية الهندسة',
        confessionFather: 'أبونا بولس',
        personalMobile: '01098761234',
        fatherMobile: '01187652345',
        motherMobile: '01276543456',
        address: 'القاهرة - مدينة نصر - الحي السابع',
        dateOfBirth: '2003-11-14'
      }
    },
    {
      id: 'P034',
      name: 'سارة شريف بطرس',
      points: 90,
      attended: true,
      attendanceDays: ['2025-07-02', '2025-07-05', '2025-07-08', '2025-07-11'],
      data: {
        fullName: 'سارة شريف بطرس',
        gender: 'female',
        educationStage: 'secondary',
        educationYear: 'الصف الثاني الثانوي',
        studyOrWorkPlace: 'مدرسة الأقباط الثانوية',
        confessionFather: 'أبونا أنطونيوس',
        personalMobile: '01045673456',
        fatherMobile: '01156784567',
        motherMobile: '01267895678',
        address: 'القاهرة - الزيتون - شارع الزيتون',
        dateOfBirth: '2008-04-08'
      }
    },
    {
      id: 'P035',
      name: 'كيرلس ممدوح صادق',
      points: 250,
      attended: true,
      attendanceDays: ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04', '2025-07-05', '2025-07-06', '2025-07-07', '2025-07-08', '2025-07-09', '2025-07-10', '2025-07-11', '2025-07-12', '2025-07-13', '2025-07-14', '2025-07-15'],
      data: {
        fullName: 'كيرلس ممدوح صادق',
        gender: 'male',
        educationStage: 'preparatory',
        educationYear: 'الصف الثاني الإعدادي',
        studyOrWorkPlace: 'مدرسة الكلية القبطية الإعدادية',
        confessionFather: 'أبونا مكاريوس',
        personalMobile: '01034568901',
        fatherMobile: '01145679012',
        motherMobile: '01256780123',
        address: 'القاهرة - المعادي - شارع 9',
        dateOfBirth: '2011-09-17'
      }
    }
  ]);

  const [todayAttendance, setTodayAttendance] = useState(25);

  useEffect(() => {
    if (isAuthenticated) {
      const hasVisited = localStorage.getItem('arribsalin-visited');
      if (!hasVisited) {
        setShowWelcome(true);
      }
    }
  }, [isAuthenticated]);

  const handleLogin = (email: string, password: string) => {
    // In real app, validate credentials
    toast.success('تم تسجيل الدخول بنجاح');
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleSignup = (data: TeacherData) => {
    // In real app, save to database
    toast.success('تم إنشاء الحساب بنجاح');
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleNavigate = (view: 'scanner' | 'registration' | 'market' | 'addPoints' | 'manualPoints' | 'profile' | 'viewDetails' | 'finance' | 'statistics' | 'teachers') => {
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

  const handleRegistrationSubmit = (data: StudentData) => {
    const newId = `P${String(participants.length + 1).padStart(3, '0')}`;
    const newParticipant: Participant = {
      id: newId,
      name: data.fullName,
      points: 0,
      attended: false,
      data,
      attendanceDays: []
    };

    setParticipants(prev => [...prev, newParticipant]);
    toast.success('تم تسجيل المشارك بنجاح!', {
      description: `رقم المشارك: ${newId}`
    });
    setCurrentView('dashboard');
  };

  const handleScanSuccess = (decodedText: string) => {
    const participant = participants.find(p => p.id === decodedText || p.name.includes(decodedText));
    const targetParticipant = participant || participants[0]; // Use first for demo

    if (scanMode === 'attendance') {
      handleAttendanceScan(targetParticipant);
    } else if (scanMode === 'market') {
      setSelectedParticipantId(targetParticipant.id);
      setCurrentView('market');
    } else if (scanMode === 'addPoints') {
      setSelectedParticipantId(targetParticipant.id);
      setCurrentView('addPoints');
    } else if (scanMode === 'viewDetails') {
      setSelectedParticipantId(targetParticipant.id);
      setCurrentView('profile');
    }
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

  const handleMarketConfirm = (pointsToDeduct: number) => {
    if (!selectedParticipantId) return;

    const participant = participants.find(p => p.id === selectedParticipantId);
    if (!participant) return;

    setParticipants(prev =>
      prev.map(p =>
        p.id === selectedParticipantId
          ? { ...p, points: p.points - pointsToDeduct }
          : p
      )
    );

    toast.success('تم خصم النقاط بنجاح!', {
      description: `${participant.name} - خصم ${pointsToDeduct} نقطة`
    });

    setSelectedParticipantId(null);
    setCurrentView('dashboard');
  };

  const handleAddPointsConfirm = (pointsToAdd: number) => {
    if (!selectedParticipantId) return;

    const participant = participants.find(p => p.id === selectedParticipantId);
    if (!participant) return;

    setParticipants(prev =>
      prev.map(p =>
        p.id === selectedParticipantId
          ? { ...p, points: p.points + pointsToAdd }
          : p
      )
    );

    toast.success('تم إضافة النقاط بنجاح!', {
      description: `${participant.name} - إضافة ${pointsToAdd} نقطة`
    });

    setSelectedParticipantId(null);
    setCurrentView('dashboard');
  };

  const handleManualPointsConfirm = (participantId: string, points: number, action: 'add' | 'subtract') => {
    const participant = participants.find(p => p.id === participantId);
    if (!participant) return;

    setParticipants(prev =>
      prev.map(p =>
        p.id === participantId
          ? {
              ...p,
              points: action === 'add' ? p.points + points : p.points - points
            }
          : p
      )
    );

    toast.success(action === 'add' ? 'تم إضافة النقاط بنجاح!' : 'تم خصم النقاط بنجاح!', {
      description: `${participant.name} - ${action === 'add' ? '+' : '-'}${points} نقطة`
    });

    setCurrentView('dashboard');
  };

  const handleViewProfile = (participantId: string) => {
    setSelectedParticipantId(participantId);
    setCurrentView('profile');
  };

  const handleCloseWelcome = () => {
    localStorage.setItem('arribsalin-visited', 'true');
    setShowWelcome(false);
  };

  const selectedParticipant = selectedParticipantId
    ? participants.find(p => p.id === selectedParticipantId)
    : null;

  if (!isAuthenticated) {
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
          <EnhancedDashboard
            onNavigate={handleNavigate}
            onViewProfile={handleViewProfile}
            totalParticipants={participants.length}
            todayAttendance={todayAttendance}
            participants={participants.map(p => ({
              id: p.id,
              name: p.name,
              points: p.points,
              attended: p.attended
            }))}
          />
        )}

        {currentView === 'registration' && (
          <EnhancedRegistrationForm
            onBack={() => setCurrentView('dashboard')}
            onSubmit={handleRegistrationSubmit}
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
              id: p.id,
              name: p.name,
              points: p.points
            }))}
            onConfirm={handleManualPointsConfirm}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'profile' && selectedParticipant && (
          <StudentProfile
            student={selectedParticipant}
            totalDays={totalDays}
            onBack={() => setCurrentView('dashboard')}
          />
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
            totalDays={totalDays}
          />
        )}

        {currentView === 'teachers' && (
          <TeachersPage
            onBack={() => setCurrentView('dashboard')}
          />
        )}
      </div>
    </>
  );
}
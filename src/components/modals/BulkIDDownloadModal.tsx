import { useState } from 'react';
import { X, CheckSquare, Square, Download as DownloadIcon, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { IDCard } from '../shared/IDCard';
import { Participant } from '../../types';

const CLASSES = [
  { id: 'kg', label: 'حضانة' },
  { id: 'primary_12', label: 'ابتدائي (الأول والثاني)' },
  { id: 'primary_34', label: 'ابتدائي (الثالث والرابع)' },
  { id: 'primary_56', label: 'ابتدائي (الخامس والسادس)' },
  { id: 'preparatory', label: 'إعدادي' },
  { id: 'secondary', label: 'ثانوي' },
  { id: 'university_graduate', label: 'جامعي وخريجين' },
  { id: 'other', label: 'أخرى' }
];

const getStageKey = (stageStr: string, yearStr: string) => {
  const s = String(stageStr || '').toLowerCase();
  const y = String(yearStr || '').toLowerCase();
  if (s.includes('حضانة') || s === 'kg') return 'kg';
  if (s.includes('إعدادي') || s === 'preparatory') return 'preparatory';
  if (s.includes('ثانوي') || s === 'secondary') return 'secondary';
  if (s === 'university' || s === 'graduate' || s.includes('جامع') || s.includes('خريج')) return 'university_graduate';
  if (s === 'primary' || s.includes('ابتدائي')) {
    if (y.includes('اول') || y.includes('أول') || y.includes('ثاني') || y.includes('1') || y.includes('2')) return 'primary_12';
    if (y.includes('ثالع') || y.includes('ثالث') || y.includes('رابع') || y.includes('3') || y.includes('4')) return 'primary_34';
    if (y.includes('خامس') || y.includes('سادس') || y.includes('5') || y.includes('6')) return 'primary_56';
    return 'primary_12';
  }
  return 'other';
};

interface BulkModalProps {
  participants: Participant[];
  onClose: () => void;
}

export function BulkIDDownloadModal({ participants, onClose }: BulkModalProps) {
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [currentBatch, setCurrentBatch] = useState<Participant[]>([]);
  

  const BATCH_SIZE = 8; // Render 8 cards at a time

  const toggleClass = (id: string) => {
    setSelectedClasses(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedClasses.length === CLASSES.length) setSelectedClasses([]);
    else setSelectedClasses(CLASSES.map(c => c.id));
  };

  const handleDownload = async () => {
    const targets = participants.filter((p: any) => {
       const stage = p.data?.educationStage || p.data?.educational_stage || '';
       const year = p.data?.educationYear || p.data?.academic_year || '';
       const key = getStageKey(stage, year);
       return selectedClasses.includes(key);
    });

    if (targets.length === 0) {
        alert('لا يوجد مخدومين في الفصول المحددة');
        return;
    }

    setIsDownloading(true);
    setProgress({ current: 0, total: targets.length });

    // Initialize PDF (Dimensions matching the IDCard: 350x550 px)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [350, 550]
    });

    let processedCount = 0;

    // Process in batches
    for (let i = 0; i < targets.length; i += BATCH_SIZE) {
      const batch = targets.slice(i, i + BATCH_SIZE);
      setCurrentBatch(batch);

      // Wait 2.5 seconds for the entire batch to render and images to load
      await new Promise(resolve => setTimeout(resolve, 2500));

      for (let j = 0; j < batch.length; j++) {
        const student = batch[j];
        const element = document.getElementById(`bulk-id-card-${student.id}`);
        
        if (element) {
          try {
            const canvas = await html2canvas(element, {
              scale: 2, // Scale 2 for high quality print without bloating RAM
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            // If it's not the very first page, add a new page to the PDF
            if (processedCount > 0) {
              pdf.addPage([350, 550], 'portrait');
            }
            
            pdf.addImage(imgData, 'JPEG', 0, 0, 350, 550);
            processedCount++;
            setProgress({ current: processedCount, total: targets.length });
          } catch (err) {
            console.error('Error generating card for', student.name, err);
          }
        }
      }
    }

    // Save the single PDF file
    pdf.save(`Aribsalin_${selectedClasses.join('_')}.pdf`);

    setIsDownloading(false);
    setCurrentBatch([]);
    onClose();

    
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-border">
         <div className="p-4 bg-primary/5 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-lg text-primary flex items-center gap-2">
               <DownloadIcon className="w-5 h-5"/>
               تحميل كروت المخدومين (PDF)
            </h3>
            <button onClick={onClose} disabled={isDownloading} className="p-2 hover:bg-muted rounded-lg disabled:opacity-50">
              <X className="w-5 h-5"/>
            </button>
         </div>

         <div className="p-5 space-y-4">
            <button onClick={toggleAll} disabled={isDownloading} className="flex items-center gap-2 text-primary font-medium hover:opacity-80">
               {selectedClasses.length === CLASSES.length ? <CheckSquare className="w-5 h-5"/> : <Square className="w-5 h-5"/>}
               اختيار الكل {selectedClasses.length > 0 && `(${selectedClasses.length} فصول مختارة)`} 
               {/* {`(${selectedStudents.length} مخدومين)`} */}
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto p-1">
               {CLASSES.map(c => (
                 <button
                   key={c.id}
                   disabled={isDownloading}
                   onClick={() => toggleClass(c.id)}
                   className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${selectedClasses.includes(c.id) ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border hover:bg-muted'}`}
                 >
                   {selectedClasses.includes(c.id) ? <CheckSquare className="w-5 h-5"/> : <Square className="w-5 h-5 text-muted-foreground"/>}
                   <span className="text-sm font-medium">{c.label}</span>
                 </button>
               ))}
            </div>

            {isDownloading && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center gap-2">
                 <Loader2 className="w-6 h-6 text-blue-500 animate-spin"/>
                 <div className="text-sm font-bold text-blue-700">
                    جاري التجميع والإعداد... ({progress.current} من {progress.total})
                 </div>
                 <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden mt-1">
                    <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${(progress.current / Math.max(1, progress.total)) * 100}%` }} />
                 </div>
                 <div className="text-xs text-blue-600 font-medium mt-1">يرجى عدم إغلاق هذه النافذة حتى يكتمل تحميل ملف الـ PDF</div>
              </div>
            )}
         </div>

         <div className="p-4 border-t border-border flex gap-3">
           <button
             onClick={handleDownload}
             disabled={isDownloading || selectedClasses.length === 0}
             className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
           >
             {isDownloading ? 'جاري المعالجة...' : 'تصدير كملف PDF'}
           </button>
         </div>
      </div>

      {/* Hidden element for rendering BATCH of ID Cards */}
      <div style={{ position: 'fixed', left: '200vw', top: 0, pointerEvents: 'none', backgroundColor: '#ffffff', padding: '20px', display: 'flex', gap: '20px' }}>
         {currentBatch.map(student => (
             <div key={student.id} id={`bulk-id-card-${student.id}`}>
                <IDCard student={student as any}/>
             </div>
         ))}
      </div>
    </div>
  );
}

import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download } from 'lucide-react';

interface TestQRCodeProps {
  participantId: string;
  participantName: string;
  onClose: () => void;
}

export function TestQRCode({ participantId, participantName, onClose }: TestQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (larger for better quality)
    const size = 600;
    canvas.width = size;
    canvas.height = size;

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        link.download = `QR_${participantId}_${participantName}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      });

      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-2 hover:bg-muted rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-8">
          <h3 className="text-xl mb-2 text-primary">كود QR للمشارك</h3>
          <p className="text-sm text-muted-foreground mb-6">{participantName}</p>

          <div ref={qrRef} className="bg-white p-6 rounded-xl inline-block mb-4">
            <QRCodeSVG value={participantId} size={200} />
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            {participantId}
          </p>

          <button
            onClick={downloadQRCode}
            className="w-full bg-secondary text-secondary-foreground rounded-xl py-3 shadow-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span>تحميل كود QR</span>
          </button>
        </div>
      </div>
    </div>
  );
}

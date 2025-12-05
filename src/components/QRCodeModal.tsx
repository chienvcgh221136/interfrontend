import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { useRef } from 'react';

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  shortCode: string;
}

export function QRCodeModal({ open, onClose, url, shortCode }: QRCodeModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      ctx?.fillRect(0, 0, canvas.width, canvas.height);
      ctx?.drawImage(img, 0, 0, 300, 300);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-${shortCode}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-6">
          <div ref={qrRef} className="p-4 bg-white rounded-xl shadow-inner">
            <QRCodeSVG
              value={url}
              size={200}
              level="H"
              includeMargin
              fgColor="#1e293b"
            />
          </div>
          <p className="text-sm text-muted-foreground text-center break-all px-4">
            {url}
          </p>
          <Button onClick={downloadQR} variant="gradient" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

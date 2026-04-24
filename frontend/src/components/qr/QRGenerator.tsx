import { useRef } from 'react';
import QRCode from 'qrcode.react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface QRGeneratorProps {
  wasteId: string;
  wasteName?: string;
}

export function QRGenerator({ wasteId, wasteName }: QRGeneratorProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `waste-${wasteId}.png`;
      link.href = url;
      link.click();
    }
  };

  return (
    <Card className="p-6 text-center">
      <h3 className="text-lg font-semibold mb-4">
        {wasteName ? `QR Code for ${wasteName}` : 'Waste QR Code'}
      </h3>
      
      <div ref={qrRef} className="flex justify-center mb-4">
        <QRCode value={wasteId} size={200} level="H" />
      </div>
      
      <p className="text-sm text-gray-600 mb-4">ID: {wasteId}</p>
      
      <Button onClick={downloadQR}>Download QR Code</Button>
    </Card>
  );
}

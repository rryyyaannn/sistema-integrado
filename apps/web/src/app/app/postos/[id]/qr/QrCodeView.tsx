'use client';

import { QRCodeSVG } from 'qrcode.react';

/**
 * QR Code que codifica somente o token (o app de campo bate em posts pelo token
 * para encontrar o posto, evitando dependencia de URL absoluta no QR).
 */
export function QrCodeView({ token }: { token: string }) {
  return (
    <div className="flex justify-center rounded-md border border-steel-200 bg-white p-6">
      <QRCodeSVG value={token} size={256} level="M" bgColor="#ffffff" fgColor="#0e1825" />
    </div>
  );
}

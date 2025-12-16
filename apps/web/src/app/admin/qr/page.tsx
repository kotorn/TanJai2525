'use client';
import { QRGenerator } from '@/components/admin/QRGenerator';

export default function AdminQRPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">QR Management</h1>
      <div className="flex justify-center">
        <QRGenerator />
      </div>
    </div>
  );
}

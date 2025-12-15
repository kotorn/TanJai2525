'use client';

import { useState } from 'react';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

// Mock server action call (In real app, we'd import the actual action)
// We already created the service class, we need a Server Action to wrap it.
// For now, we simulate the client-side interaction.

export default function SlipUploader({ orderId }: { orderId: string }) {
    const [file, setFile] = useState<File | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsVerifying(true);
        setVerificationResult(null);

        // Simulate API delay
        await new Promise(r => setTimeout(r, 2000));

        // Simulate Success/Fail based on randomness for demo
        // In production: const formData = new FormData(); formData.append('slip', file); await verifySlipAction(formData);
        const success = Math.random() > 0.3; // 70% chance success

        if (success) {
            setVerificationResult({
                success: true,
                amount: 500,
                sender: 'Customer Name',
                provider: 'SlipOK'
            });
            toast.success('Slip verified successfully!');
        } else {
            setVerificationResult({
                success: false,
                error: 'Could not detect valid transaction.'
            });
            toast.error('Verification failed. Use Fallback.');
        }

        setIsVerifying(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-sm mx-auto border">
            <h3 className="font-bold text-lg mb-4 text-center">Payment Verification</h3>

            {!verificationResult?.success ? (
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 cursor-pointer relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center">
                            <Upload className="w-10 h-10 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">
                                {file ? file.name : 'Tap to upload slip'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={!file || isVerifying}
                        className="w-full bg-blue-600 text-white py-2 rounded font-semibold disabled:opacity-50"
                    >
                        {isVerifying ? 'Verifying with EasySlip...' : 'Verify Payment'}
                    </button>
                </div>
            ) : (
                <div className="text-center space-y-3">
                    <div className="flex justify-center text-green-500">
                        <CheckCircle className="w-16 h-16" />
                    </div>
                    <div>
                        <p className="font-bold text-xl">Verified!</p>
                        <p className="text-sm text-gray-500">Amount: ฿{verificationResult.amount}</p>
                        <p className="text-sm text-gray-500">Via: {verificationResult.provider}</p>
                    </div>
                    <button
                        className="w-full bg-gray-100 text-gray-800 py-2 rounded"
                        onClick={() => { setFile(null); setVerificationResult(null); }}
                    >
                        Upload Another
                    </button>
                </div>
            )}

            {verificationResult?.success === false && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded text-sm text-center">
                    {verificationResult.error}
                </div>
            )}
        </div>
    );
}

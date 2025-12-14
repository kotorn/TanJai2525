"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface OnboardingSuccessProps {
    restaurantId: string;
}

export function OnboardingSuccess({ restaurantId }: OnboardingSuccessProps) {
    const router = useRouter();

    const handleGoToDashboard = () => {
        // TODO: Navigate to actual dashboard
        router.push("/dashboard");
    };

    return (
        <div className="text-center py-8">
            <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-green-100 p-6">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎉 ยินดีด้วย!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
                คุณได้สร้างร้านสำเร็จแล้ว
            </p>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-700 mb-4">
                    ขั้นตอนต่อไป:
                </p>
                <ol className="text-left text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-semibold mr-3 flex-shrink-0">
                            1
                        </span>
                        <span>เพิ่มเมนูอาหาร (อย่างน้อย 5 รายการ)</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-semibold mr-3 flex-shrink-0">
                            2
                        </span>
                        <span>สร้าง QR Code สำหรับโต๊ะ</span>
                    </li>
                    <li className="flex items-start">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-semibold mr-3 flex-shrink-0">
                            3
                        </span>
                        <span>ทดสอบสั่งอาหาร</span>
                    </li>
                </ol>
            </div>

            <div className="space-y-3">
                <Button
                    onClick={handleGoToDashboard}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    size="lg"
                >
                    ไปที่หน้าแดชบอร์ด →
                </Button>

                <p className="text-xs text-gray-500">
                    Restaurant ID: <code className="bg-gray-100 px-2 py-1 rounded">{restaurantId}</code>
                </p>
            </div>
        </div>
    );
}

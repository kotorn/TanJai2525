"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { phoneVerificationSchema, type PhoneVerification } from "@/features/restaurant/schemas/onboarding.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOtp } from "@/features/restaurant/actions";
interface PhoneVerificationStepProps {
    onVerified: (phone: string) => void;
}

export function PhoneVerificationStep({ onVerified }: PhoneVerificationStepProps) {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PhoneVerification>({
        resolver: zodResolver(phoneVerificationSchema),
    });


    const onSubmit = async (data: PhoneVerification) => {
        setIsLoading(true);

        try {
            const result = await sendOtp(data.phoneNumber);
            if (result.success) {
                onVerified(data.phoneNumber);
            } else {
                // handle error
                console.error("Failed to send OTP");
            }
        } catch (error) {
            console.error("Error sending OTP", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    ยินดีต้อนรับสู่ Tanjai POS
                </h1>
                <p className="text-gray-600">
                    กรุณากรอกหมายเลขโทรศัพท์เพื่อเริ่มต้น
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <Label htmlFor="phoneNumber">หมายเลขโทรศัพท์</Label>
                    <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="0812345678"
                        {...register("phoneNumber")}
                        className={errors.phoneNumber ? "border-red-500" : ""}
                        maxLength={10}
                    />
                    {errors.phoneNumber && (
                        <p className="text-sm text-red-600 mt-1">
                            {errors.phoneNumber.message}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={isLoading}
                >
                    {isLoading ? "กำลังส่ง OTP..." : "ส่ง OTP"}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
                <p>เราจะส่งรหัส OTP ไปยังหมายเลขโทรศัพท์ของคุณ</p>
            </div>
        </div>
    );
}

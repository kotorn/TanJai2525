"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpVerificationSchema, type OtpVerification } from "@/features/restaurant/schemas/onboarding.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyOtp, sendOtp } from "@/features/restaurant/actions";
interface OtpVerificationStepProps {
    phoneNumber: string;
    onVerified: () => void;
    onBack: () => void;
}

export function OtpVerificationStep({ phoneNumber, onVerified, onBack }: OtpVerificationStepProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<OtpVerification>({
        resolver: zodResolver(otpVerificationSchema),
    });

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const onSubmit = async (data: OtpVerification) => {
        setIsLoading(true);

        try {
            const result = await verifyOtp(phoneNumber, data.otp);
            if (result.success) {
                onVerified();
            } else {
                setError("otp", {
                    type: "manual",
                    message: result.error || "รหัส OTP ไม่ถูกต้อง",
                });
            }
        } catch (error) {
            console.error("OTP Verification Error", error);
            setError("otp", {
                type: "manual",
                message: "เกิดข้อผิดพลาด กรุณาลองใหม่",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setCanResend(false);
        setCountdown(60);

        try {
            await sendOtp(phoneNumber);
        } catch (error) {
            console.error("Resend OTP Error", error);
        }
    };

    return (
        <div>
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    ยืนยันรหัส OTP
                </h1>
                <p className="text-gray-600">
                    เราได้ส่งรหัส OTP ไปยัง
                </p>
                <p className="text-orange-600 font-semibold">
                    {phoneNumber}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <Input
                        type="text"
                        placeholder="000000"
                        {...register("otp")}
                        className={`text-center text-2xl tracking-widest ${errors.otp ? "border-red-500" : ""
                            }`}
                        maxLength={6}
                        autoComplete="one-time-code"
                    />
                    {errors.otp && (
                        <p className="text-sm text-red-600 mt-1 text-center">
                            {errors.otp.message}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={isLoading}
                >
                    {isLoading ? "กำลังยืนยัน..." : "ยืนยัน OTP"}
                </Button>

                <div className="flex items-center justify-between text-sm">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onBack}
                        className="text-gray-600"
                    >
                        ← เปลี่ยนเบอร์
                    </Button>

                    {canResend ? (
                        <button
                            type="button"
                            onClick={handleResend}
                            className="text-orange-600 hover:underline"
                        >
                            ส่ง OTP อีกครั้ง
                        </button>
                    ) : (
                        <span className="text-gray-500">
                            ส่งใหม่ใน {countdown} วินาที
                        </span>
                    )}
                </div>
            </form>

            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                    💡 สำหรับการทดสอบ: ใช้รหัส <strong>123456</strong>
                </p>
            </div>
        </div>
    );
}

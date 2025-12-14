"use client";

import { useState } from "react";
import { PhoneVerificationStep } from "@/features/restaurant/components/onboarding/PhoneVerificationStep";
import { OtpVerificationStep } from "@/features/restaurant/components/onboarding/OtpVerificationStep";
import { RestaurantProfileStep } from "@/features/restaurant/components/onboarding/RestaurantProfileStep";
import { OnboardingSuccess } from "@/features/restaurant/components/onboarding/OnboardingSuccess";

type OnboardingStep = "phone" | "otp" | "profile" | "success";

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState<OnboardingStep>("phone");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [restaurantId, setRestaurantId] = useState("");

    const handlePhoneVerified = (phone: string) => {
        setPhoneNumber(phone);
        setCurrentStep("otp");
    };

    const handleOtpVerified = () => {
        setCurrentStep("profile");
    };

    const handleProfileCompleted = (id: string) => {
        setRestaurantId(id);
        setCurrentStep("success");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        {["phone", "otp", "profile", "success"].map((step, index) => (
                            <div
                                key={step}
                                className={`flex items-center ${index < 3 ? "flex-1" : ""
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${currentStep === step
                                            ? "bg-orange-600 text-white"
                                            : ["phone", "otp", "profile", "success"].indexOf(currentStep) >
                                                index
                                                ? "bg-orange-400 text-white"
                                                : "bg-gray-200 text-gray-500"
                                        }`}
                                >
                                    {index + 1}
                                </div>
                                {index < 3 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 transition-colors ${["phone", "otp", "profile", "success"].indexOf(currentStep) >
                                                index
                                                ? "bg-orange-400"
                                                : "bg-gray-200"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 px-1">
                        <span>โทรศัพท์</span>
                        <span>OTP</span>
                        <span>ข้อมูลร้าน</span>
                        <span>เสร็จสิ้น</span>
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {currentStep === "phone" && (
                        <PhoneVerificationStep onVerified={handlePhoneVerified} />
                    )}
                    {currentStep === "otp" && (
                        <OtpVerificationStep
                            phoneNumber={phoneNumber}
                            onVerified={handleOtpVerified}
                            onBack={() => setCurrentStep("phone")}
                        />
                    )}
                    {currentStep === "profile" && (
                        <RestaurantProfileStep
                            phoneNumber={phoneNumber}
                            onCompleted={handleProfileCompleted}
                        />
                    )}
                    {currentStep === "success" && (
                        <OnboardingSuccess restaurantId={restaurantId} />
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    มีปัญหาในการสมัคร?{" "}
                    <a href="#" className="text-orange-600 hover:underline">
                        ติดต่อเรา
                    </a>
                </p>
            </div>
        </div>
    );
}

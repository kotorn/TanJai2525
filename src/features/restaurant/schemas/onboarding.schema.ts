import { z } from "zod";

// Phone verification schema
export const phoneVerificationSchema = z.object({
    phoneNumber: z
        .string()
        .min(10, "หมายเลขโทรศัพท์ต้องมีอย่างน้อย 10 หลัก")
        .max(10, "หมายเลขโทรศัพท์ต้องไม่เกิน 10 หลัก")
        .regex(/^0[0-9]{9}$/, "หมายเลขโทรศัพท์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0)"),
});

export const otpVerificationSchema = z.object({
    otp: z
        .string()
        .length(6, "รหัส OTP ต้องมี 6 หลัก")
        .regex(/^[0-9]{6}$/, "รหัส OTP ต้องเป็นตัวเลขเท่านั้น"),
});

// Restaurant profile schema
export const restaurantProfileSchema = z.object({
    name: z
        .string()
        .min(2, "ชื่อร้านต้องมีอย่างน้อย 2 ตัวอักษร")
        .max(100, "ชื่อร้านต้องไม่เกิน 100 ตัวอักษร"),

    address: z
        .string()
        .min(10, "ที่อยู่ต้องมีอย่างน้อย 10 ตัวอักษร")
        .max(500, "ที่อยู่ต้องไม่เกิน 500 ตัวอักษร"),

    cuisineType: z
        .string()
        .min(2, "ประเภทอาหารต้องมีอย่างน้อย 2 ตัวอักษร")
        .max(50, "ประเภทอาหารต้องไม่เกิน 50 ตัวอักษร"),

    description: z
        .string()
        .max(1000, "คำอธิบายต้องไม่เกิน 1000 ตัวอักษร")
        .optional(),

    logoUrl: z.string().url("URL โลโก้ไม่ถูกต้อง").optional(),
    bannerUrl: z.string().url("URL แบนเนอร์ไม่ถูกต้อง").optional(),
});

// Combined onboarding schema
export const onboardingSchema = phoneVerificationSchema
    .and(otpVerificationSchema)
    .and(restaurantProfileSchema);

// Type exports
export type PhoneVerification = z.infer<typeof phoneVerificationSchema>;
export type OtpVerification = z.infer<typeof otpVerificationSchema>;
export type RestaurantProfile = z.infer<typeof restaurantProfileSchema>;
export type OnboardingData = z.infer<typeof onboardingSchema>;

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { Restaurant } from '@/types/database.types'

const RestaurantSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must use lowercase letters, numbers, and dashes only"),
    cuisine_type: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    logo_url: z.string().optional(),
    banner_url: z.string().optional(),
})

export async function getRestaurants() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        throw new Error('Failed to fetch restaurants')
    }

    return data as Restaurant[]
}

export async function getRestaurant(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        return null
    }

    return data as Restaurant
}

export async function createRestaurant(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const rawData = {
        name: formData.get('name'),
        slug: formData.get('slug'),
        cuisine_type: formData.get('cuisine_type'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        logo_url: formData.get('logo_url'),
        banner_url: formData.get('banner_url'),
    }

    const result = RestaurantSchema.safeParse(rawData)

    if (!result.success) {
        return { error: 'Invalid data', details: result.error.flatten() }
    }

    const { error } = await supabase
        .from('restaurants')
        .insert(result.data)

    if (error) {
        if (error.code === '23505') {
            return { error: "This URL (slug) is already taken." }
        }
        return { error: 'Failed to create restaurant' }
    }

    revalidatePath('/dashboard/restaurants')
    redirect('/dashboard/restaurants')
}

export async function updateRestaurant(id: string, prevState: any, formData: FormData) {
    const supabase = await createClient()

    const rawData = {
        name: formData.get('name'),
        slug: formData.get('slug'),
        cuisine_type: formData.get('cuisine_type'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        logo_url: formData.get('logo_url'),
        banner_url: formData.get('banner_url'),
    }

    const result = RestaurantSchema.safeParse(rawData)

    if (!result.success) {
        return { error: 'Invalid data', details: result.error.flatten() }
    }

    const { error } = await supabase
        .from('restaurants')
        .update(result.data)
        .eq('id', id)

    if (error) {
        return { error: 'Failed to update restaurant' }
    }

    revalidatePath('/dashboard/restaurants')
    revalidatePath(`/dashboard/restaurants/${id}`)
    return { success: true }
}

export async function deleteRestaurant(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id)

    if (error) {
        throw new Error('Failed to delete restaurant')
    }

    revalidatePath('/dashboard/restaurants')
}

import { RestaurantProfile } from './schemas/onboarding.schema'

export async function sendOtp(phoneNumber: string) {
    console.log(`[Mock SMS] Sending OTP to ${phoneNumber}`)
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { success: true }
}

export async function verifyOtp(phoneNumber: string, otp: string) {
    console.log(`[Mock OTP] Verifying OTP ${otp} for ${phoneNumber}`)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Accept 123456 as valid OTP for testing
    if (otp === "123456") return { success: true }
    
    return { success: false, error: "รหัส OTP ไม่ถูกต้อง" }
}

export async function registerRestaurant(data: RestaurantProfile & { phoneNumber: string }) {
    // Check for Mock Mode
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMock = !supabaseUrl || supabaseUrl.includes("your-project-url");

    if (isMock) {
        console.warn("[Mock Mode] Registering restaurant:", data.name);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
        return { success: true, restaurantId: `mock-restaurant-${Date.now()}` };
    }

    const supabase = await createClient()

    let slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    // Fallback for non-latin names
    if (!slug || slug.length < 2) {
        slug = 'restaurant'
    }
    // Append random string to ensure uniqueness
    slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`

    const { data: restaurant, error } = await supabase
        .from('restaurants')
        .insert({
            name: data.name,
            slug: slug,
            cuisine_type: data.cuisineType,
            phone: data.phoneNumber,
            address: data.address,
            logo_url: data.logoUrl,
            banner_url: data.bannerUrl,
            settings: data.description ? { description: data.description } : {},
        })
        .select()
        .single()

    if (error) {
        console.error('Registration error:', error)
        return { success: false, error: 'Failed to create restaurant' }
    }

    return { success: true, restaurantId: restaurant.id }
}

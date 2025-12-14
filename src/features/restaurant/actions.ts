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

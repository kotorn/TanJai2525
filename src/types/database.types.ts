export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Restaurant {
    id: string
    name: string
    slug: string
    logo_url: string | null
    banner_url: string | null
    cuisine_type: string | null
    address: string | null
    phone: string | null
    settings: Json
    created_at: string
    updated_at: string
}

export interface MenuItem {
    id: string
    restaurant_id: string
    category_id: string | null
    name: string
    description: string | null
    price: number
    image_url: string | null
    is_available: boolean
    options: Json
    created_at: string
    updated_at: string
}

export interface Table {
    id: string
    restaurant_id: string
    name: string
    capacity: number
    location: string | null
    status: string
    qr_code_url: string | null
    created_at: string
    updated_at: string
}

export interface Database {
    public: {
        Tables: {
            restaurants: {
                Row: Restaurant
                Insert: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> & { id?: string }
                Update: Partial<Omit<Restaurant, 'id' | 'created_at' | 'updated_at'>>
            }
            menu_items: {
                Row: MenuItem
                Insert: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'> & { id?: string }
                Update: Partial<Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>>
            }
            tables: {
                Row: Table
                Insert: Omit<Table, 'id' | 'created_at' | 'updated_at'> & { id?: string }
                Update: Partial<Omit<Table, 'id' | 'created_at' | 'updated_at'>>
            }
        }
    }
}

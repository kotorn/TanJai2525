export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      menu_categories: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          }
        ]
      }
      menu_items: {
        Row: {
          id: string
          restaurant_id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          image_url: string | null
          is_available: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          category_id?: string | null
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          is_available?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_available?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      option_groups: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          is_required: boolean
          selection_type: 'single' | 'multiple'
          min_selection: number
          max_selection: number | null
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          is_required?: boolean
          selection_type?: 'single' | 'multiple'
          min_selection?: number
          max_selection?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          is_required?: boolean
          selection_type?: 'single' | 'multiple'
          min_selection?: number
          max_selection?: number | null
          created_at?: string
        }
      }
      options: {
        Row: {
          id: string
          group_id: string
          name: string
          price: number
          is_available: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          name: string
          price?: number
          is_available?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          name?: string
          price?: number
          is_available?: boolean
          sort_order?: number
          created_at?: string
        }
      }
    }
  }
}

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
      restaurants: {
        Row: {
          id: string
          created_at: string
          name: string
          owner_id: string | null
          plan_id: string
          subscription_status: 'active' | 'past_due' | 'canceled' | 'trial'
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          owner_id?: string | null
          plan_id?: string
          subscription_status?: 'active' | 'past_due' | 'canceled' | 'trial'
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          owner_id?: string | null
          plan_id?: string
          subscription_status?: 'active' | 'past_due' | 'canceled' | 'trial'
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "system_plans"
            referencedColumns: ["id"]
          }
        ]
      }
      system_plans: {
        Row: {
          id: string
          name: string
          price_thb: number
          features: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price_thb?: number
          features?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price_thb?: number
          features?: Json
          created_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          restaurant_id: string
          plan_id: string
          status: 'active' | 'past_due' | 'canceled' | 'trial'
          current_period_start: string
          current_period_end: string
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          plan_id: string
          status: 'active' | 'past_due' | 'canceled' | 'trial'
          current_period_start: string
          current_period_end: string
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          plan_id?: string
          status?: 'active' | 'past_due' | 'canceled' | 'trial'
          current_period_start?: string
          current_period_end?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "system_plans"
            referencedColumns: ["id"]
          }
        ]
      }
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

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
      tenants: {
        Row: {
          id: string
          created_at: string
          name: string
          slug: string | null
          owner_id: string | null
          plan_id: string
          subscription_status: 'active' | 'past_due' | 'canceled' | 'trial'
          settings: Json | null
          cuisine_type: string | null
          banner_url: string | null
          address: string | null
          phone: string | null
          logo_url: string | null
          current_plan: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          slug?: string | null
          owner_id?: string | null
          plan_id?: string
          subscription_status?: 'active' | 'past_due' | 'canceled' | 'trial'
          settings?: Json | null
          cuisine_type?: string | null
          banner_url?: string | null
          address?: string | null
          phone?: string | null
          logo_url?: string | null
          current_plan?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          slug?: string | null
          owner_id?: string | null
          plan_id?: string
          subscription_status?: 'active' | 'past_due' | 'canceled' | 'trial'
          settings?: Json | null
          cuisine_type?: string | null
          banner_url?: string | null
          address?: string | null
          phone?: string | null
          logo_url?: string | null
          current_plan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_plan_id_fkey"
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
          tenant_id: string
          plan_id: string
          status: 'active' | 'past_due' | 'canceled' | 'trial' | 'pending_verification' | 'expired'
          current_period_start: string | null
          current_period_end: string | null
          start_date: string
          end_date: string | null
          auto_renew: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          plan_id?: string
          status?: 'active' | 'past_due' | 'canceled' | 'trial' | 'pending_verification' | 'expired'
          current_period_start?: string | null
          current_period_end?: string | null
          start_date?: string
          end_date?: string | null
          auto_renew?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          plan_id?: string
          status?: 'active' | 'past_due' | 'canceled' | 'trial' | 'pending_verification' | 'expired'
          current_period_start?: string | null
          current_period_end?: string | null
          start_date?: string
          end_date?: string | null
          auto_renew?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
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
      payment_slips: {
        Row: {
          id: string
          subscription_id: string
          amount: number
          slip_image_url: string
          status: 'pending' | 'approved' | 'rejected' | 'verified'
          uploaded_at: string
          reviewed_by: string | null
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          subscription_id: string
          amount: number
          slip_image_url: string
          status?: 'pending' | 'approved' | 'rejected' | 'verified'
          uploaded_at?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          subscription_id?: string
          amount?: number
          slip_image_url?: string
          status?: 'pending' | 'approved' | 'rejected' | 'verified'
          uploaded_at?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_slips_subscription_id_fkey"
            columns: ["subscription_id"]
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          tenant_id: string | null
          role: 'owner' | 'staff' | 'super_admin' | 'customer'
          created_at: string
          email: string | null
          full_name: string | null
        }
        Insert: {
          id: string
          tenant_id?: string | null
          role?: 'owner' | 'staff' | 'super_admin' | 'customer'
          created_at?: string
          email?: string | null
          full_name?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string | null
          role?: 'owner' | 'staff' | 'super_admin' | 'customer'
          created_at?: string
          email?: string | null
          full_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            referencedRelation: "tenants"
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
            referencedRelation: "tenants"
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
            referencedRelation: "tenants"
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
      orders: {
        Row: {
          id: string
          restaurant_id: string
          table_id: string | null
          items: Json
          total_amount: number
          status: string
          customer_notes: string | null
          channel_source: 'pos' | 'liff' | 'line_oa' | 'facebook_messenger' | 'tiktok'
          external_order_id: string | null
          utm_source: string | null
          utm_medium: string | null
          source_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          table_id?: string | null
          items: Json
          total_amount: number
          status?: string
          customer_notes?: string | null
          channel_source?: 'pos' | 'liff' | 'line_oa' | 'facebook_messenger' | 'tiktok'
          external_order_id?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          source_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          table_id?: string | null
          items?: Json
          total_amount?: number
          status?: string
          customer_notes?: string | null
          channel_source?: 'pos' | 'liff' | 'line_oa' | 'facebook_messenger' | 'tiktok'
          external_order_id?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          source_url?: string | null
          created_at?: string
        }
      }
      stock_ledger: {
        Row: {
          id: string
          restaurant_id: string
          inventory_item_id: string
          order_id: string | null
          movement_type: 'in' | 'out' | 'adjustment' | 'waste'
          quantity: number
          previous_quantity: number | null
          new_quantity: number | null
          reason: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          restaurant_id: string
          inventory_item_id: string
          order_id?: string | null
          movement_type: 'in' | 'out' | 'adjustment' | 'waste'
          quantity: number
          previous_quantity?: number | null
          new_quantity?: number | null
          reason?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          restaurant_id?: string
          inventory_item_id?: string
          order_id?: string | null
          movement_type?: 'in' | 'out' | 'adjustment' | 'waste'
          quantity?: number
          previous_quantity?: number | null
          new_quantity?: number | null
          reason?: string | null
          created_at?: string
          created_by?: string | null
        }
      }
      social_profiles: {
        Row: {
          id: string
          customer_id: string | null
          provider: 'line' | 'facebook' | 'tiktok' | 'google'
          provider_user_id: string
          profile_data: Json | null
          last_interaction: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          provider: 'line' | 'facebook' | 'tiktok' | 'google'
          provider_user_id: string
          profile_data?: Json | null
          last_interaction?: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          provider?: 'line' | 'facebook' | 'tiktok' | 'google'
          provider_user_id?: string
          profile_data?: Json | null
          last_interaction?: string
          created_at?: string
        }
      }
      communication_logs: {
        Row: {
          id: string
          restaurant_id: string
          customer_id: string | null
          social_profile_id: string | null
          channel: 'pos' | 'liff' | 'line_oa' | 'facebook_messenger' | 'tiktok'
          direction: 'inbound' | 'outbound'
          content: string
          content_type: string
          external_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          customer_id?: string | null
          social_profile_id?: string | null
          channel?: 'pos' | 'liff' | 'line_oa' | 'facebook_messenger' | 'tiktok'
          direction: 'inbound' | 'outbound'
          content: string
          content_type?: string
          external_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          customer_id?: string | null
          social_profile_id?: string | null
          channel?: 'pos' | 'liff' | 'line_oa' | 'facebook_messenger' | 'tiktok'
          direction?: 'inbound' | 'outbound'
          content?: string
          content_type?: string
          external_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
    }
  }
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      product_strategies: {
        Row: {
          created_at: string
          current_features: string | null
          description: string | null
          id: string
          industry: string | null
          product_name: string
          stage: string | null
          startup_id: string | null
          strategy: Json
          target_users: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_features?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          product_name: string
          stage?: string | null
          startup_id?: string | null
          strategy: Json
          target_users?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_features?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          product_name?: string
          stage?: string | null
          startup_id?: string | null
          strategy?: Json
          target_users?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_strategies_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      startup_reports: {
        Row: {
          blind_spots: Json | null
          created_at: string
          executive_summary: string | null
          health_score: number | null
          id: string
          investor_questions: Json | null
          is_public: boolean
          opportunities: Json | null
          readiness: Json | null
          risks: Json | null
          startup_id: string
          strategic_recommendations: Json | null
          strengths: Json | null
          top_priorities: Json | null
          user_id: string
          validation_steps: Json | null
          verdict: Json | null
        }
        Insert: {
          blind_spots?: Json | null
          created_at?: string
          executive_summary?: string | null
          health_score?: number | null
          id?: string
          investor_questions?: Json | null
          is_public?: boolean
          opportunities?: Json | null
          readiness?: Json | null
          risks?: Json | null
          startup_id: string
          strategic_recommendations?: Json | null
          strengths?: Json | null
          top_priorities?: Json | null
          user_id: string
          validation_steps?: Json | null
          verdict?: Json | null
        }
        Update: {
          blind_spots?: Json | null
          created_at?: string
          executive_summary?: string | null
          health_score?: number | null
          id?: string
          investor_questions?: Json | null
          is_public?: boolean
          opportunities?: Json | null
          readiness?: Json | null
          risks?: Json | null
          startup_id?: string
          strategic_recommendations?: Json | null
          strengths?: Json | null
          top_priorities?: Json | null
          user_id?: string
          validation_steps?: Json | null
          verdict?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "startup_reports_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      startups: {
        Row: {
          competitors: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          problem: string | null
          revenue_model: string | null
          startup_name: string
          startup_stage: string | null
          target_audience: string | null
          user_id: string
        }
        Insert: {
          competitors?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          problem?: string | null
          revenue_model?: string | null
          startup_name: string
          startup_stage?: string | null
          target_audience?: string | null
          user_id: string
        }
        Update: {
          competitors?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          problem?: string | null
          revenue_model?: string | null
          startup_name?: string
          startup_stage?: string | null
          target_audience?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

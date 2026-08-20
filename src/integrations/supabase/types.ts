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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      compatibility_reports: {
        Row: {
          challenges: string[]
          created_at: string
          created_by: string
          discussion_topics: string[]
          id: string
          match_id: string
          score: number
          strengths: string[]
          updated_at: string
        }
        Insert: {
          challenges?: string[]
          created_at?: string
          created_by: string
          discussion_topics?: string[]
          id?: string
          match_id: string
          score: number
          strengths?: string[]
          updated_at?: string
        }
        Update: {
          challenges?: string[]
          created_at?: string
          created_by?: string
          discussion_topics?: string[]
          id?: string
          match_id?: string
          score?: number
          strengths?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compatibility_reports_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      interests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          user_a?: string
          user_b?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          match_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_reads: {
        Row: {
          chats: Json
          created_at: string
          matches_seen_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chats?: Json
          created_at?: string
          matches_seen_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chats?: Json
          created_at?: string
          matches_seen_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          anonymous_name: string
          available_hours: number
          avatar_url: string | null
          bio: string | null
          commitment_level: string | null
          created_at: string
          desired_partner_traits: string[]
          experience_level: string | null
          github_url: string | null
          id: string
          industry_interests: string[]
          linkedin_url: string | null
          looking_for: string | null
          portfolio_url: string | null
          real_name: string | null
          skills: string[]
          subscription_status: string
          updated_at: string
          website_url: string | null
          what_to_build: string | null
          working_style: string | null
        }
        Insert: {
          anonymous_name: string
          available_hours?: number
          avatar_url?: string | null
          bio?: string | null
          commitment_level?: string | null
          created_at?: string
          desired_partner_traits?: string[]
          experience_level?: string | null
          github_url?: string | null
          id: string
          industry_interests?: string[]
          linkedin_url?: string | null
          looking_for?: string | null
          portfolio_url?: string | null
          real_name?: string | null
          skills?: string[]
          subscription_status?: string
          updated_at?: string
          website_url?: string | null
          what_to_build?: string | null
          working_style?: string | null
        }
        Update: {
          anonymous_name?: string
          available_hours?: number
          avatar_url?: string | null
          bio?: string | null
          commitment_level?: string | null
          created_at?: string
          desired_partner_traits?: string[]
          experience_level?: string | null
          github_url?: string | null
          id?: string
          industry_interests?: string[]
          linkedin_url?: string | null
          looking_for?: string | null
          portfolio_url?: string | null
          real_name?: string | null
          skills?: string[]
          subscription_status?: string
          updated_at?: string
          website_url?: string | null
          what_to_build?: string | null
          working_style?: string | null
        }
        Relationships: []
      }
      shared_project_directions: {
        Row: {
          created_at: string
          id: string
          match_id: string
          notes: string
          problem: string
          project_title: string
          solution: string
          target_users: string
          updated_at: string
          updated_by: string | null
          why_now: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          notes?: string
          problem?: string
          project_title?: string
          solution?: string
          target_users?: string
          updated_at?: string
          updated_by?: string | null
          why_now?: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          notes?: string
          problem?: string
          project_title?: string
          solution?: string
          target_users?: string
          updated_at?: string
          updated_by?: string | null
          why_now?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_project_directions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      startup_proposals: {
        Row: {
          created_at: string
          created_by: string
          id: string
          match_id: string
          proposal_json: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          match_id: string
          proposal_json: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          match_id?: string
          proposal_json?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "startup_proposals_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      discover_founders: {
        Args: never
        Returns: {
          anonymous_name: string
          available_hours: number
          avatar_url: string
          bio: string
          commitment_level: string
          desired_partner_traits: string[]
          discovery_id: string
          email_verified: boolean
          experience_level: string
          has_github: boolean
          has_linkedin: boolean
          has_portfolio: boolean
          industry_interests: string[]
          interest_sent: boolean
          is_matched: boolean
          is_premium: boolean
          looking_for: string
          profile_strength: number
          skills: string[]
          working_style: string
        }[]
      }
      generate_anonymous_name: { Args: never; Returns: string }
      incoming_interests: {
        Args: never
        Returns: {
          anonymous_name: string
          available_hours: number
          avatar_url: string
          created_at: string
          discovery_id: string
          email_verified: boolean
          experience_level: string
          has_github: boolean
          has_linkedin: boolean
          has_portfolio: boolean
          industry_interests: string[]
          interest_sent: boolean
          is_premium: boolean
          profile_strength: number
          skills: string[]
          status: string
        }[]
      }
      is_match_member: {
        Args: { _match_id: string; _user_id: string }
        Returns: boolean
      }
      match_compatibility_inputs: {
        Args: { p_match_id: string }
        Returns: {
          a_commitment: string
          a_experience: string
          a_hours: number
          a_industries: string[]
          a_skills: string[]
          a_traits: string[]
          a_working_style: string
          b_commitment: string
          b_experience: string
          b_hours: number
          b_industries: string[]
          b_skills: string[]
          b_traits: string[]
          b_working_style: string
          is_member: boolean
          me_premium: boolean
        }[]
      }
      match_header: {
        Args: { p_match_id: string }
        Returns: {
          anonymous_name: string
          avatar_url: string
          commitment_level: string
          is_premium: boolean
          match_id: string
          skills: string[]
        }[]
      }
      my_email_verified: { Args: never; Returns: boolean }
      my_matches: {
        Args: never
        Returns: {
          anonymous_name: string
          available_hours: number
          avatar_url: string
          commitment_level: string
          created_at: string
          email_verified: boolean
          has_github: boolean
          has_linkedin: boolean
          has_portfolio: boolean
          industry_interests: string[]
          is_premium: boolean
          match_id: string
          profile_strength: number
          skills: string[]
        }[]
      }
      profile_strength: {
        Args: { p: Database["public"]["Tables"]["profiles"]["Row"] }
        Returns: number
      }
      regenerate_my_anonymous_name: { Args: never; Returns: string }
      respond_to_interest: {
        Args: { p_accept: boolean; p_discovery_id: string }
        Returns: {
          matched: boolean
        }[]
      }
      send_interest: {
        Args: { p_discovery_id: string }
        Returns: {
          matched: boolean
        }[]
      }
      suggest_anonymous_name: { Args: never; Returns: string }
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

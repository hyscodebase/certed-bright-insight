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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      investee_invitations: {
        Row: {
          accepted_at: string | null
          company_name: string
          contact_email: string
          created_at: string
          expires_at: string
          id: string
          invitation_token: string
          status: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          company_name: string
          contact_email: string
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token: string
          status?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          company_name?: string
          contact_email?: string
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      investees: {
        Row: {
          address: string | null
          average_salary: number | null
          capital: number | null
          company_name: string
          contact_email: string | null
          created_at: string
          employee_count: number | null
          established_date: string | null
          hire_count: number | null
          id: string
          industry: string | null
          investment_stage: string | null
          is_smb: boolean | null
          representative: string | null
          resign_count: number | null
          total_investment: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          average_salary?: number | null
          capital?: number | null
          company_name: string
          contact_email?: string | null
          created_at?: string
          employee_count?: number | null
          established_date?: string | null
          hire_count?: number | null
          id?: string
          industry?: string | null
          investment_stage?: string | null
          is_smb?: boolean | null
          representative?: string | null
          resign_count?: number | null
          total_investment?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          average_salary?: number | null
          capital?: number | null
          company_name?: string
          contact_email?: string | null
          created_at?: string
          employee_count?: number | null
          established_date?: string | null
          hire_count?: number | null
          id?: string
          industry?: string | null
          investment_stage?: string | null
          is_smb?: boolean | null
          representative?: string | null
          resign_count?: number | null
          total_investment?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      report_requests: {
        Row: {
          completed_at: string | null
          expires_at: string
          id: string
          investee_id: string
          request_token: string
          requested_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          expires_at?: string
          id?: string
          investee_id: string
          request_token: string
          requested_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          expires_at?: string
          id?: string
          investee_id?: string
          request_token?: string
          requested_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_requests_investee_id_fkey"
            columns: ["investee_id"]
            isOneToOne: false
            referencedRelation: "investees"
            referencedColumns: ["id"]
          },
        ]
      }
      shareholder_reports: {
        Row: {
          average_contract_value: number | null
          cac: number | null
          cash_balance: number
          contract_count: number | null
          conversion_rate: number | null
          created_at: string
          cumulative_revenue: number
          dau: number | null
          employee_count_change: number
          fixed_costs: number
          id: string
          investee_id: string
          mau: number | null
          monthly_revenue: number
          monthly_summary: string
          next_month_decisions: string
          paid_customer_count: number | null
          problems_risks: string
          report_period: string
          report_request_id: string | null
          runway_months: number
          shareholder_input_needed: string
          updated_at: string
          variable_costs: number
        }
        Insert: {
          average_contract_value?: number | null
          cac?: number | null
          cash_balance?: number
          contract_count?: number | null
          conversion_rate?: number | null
          created_at?: string
          cumulative_revenue?: number
          dau?: number | null
          employee_count_change?: number
          fixed_costs?: number
          id?: string
          investee_id: string
          mau?: number | null
          monthly_revenue?: number
          monthly_summary: string
          next_month_decisions: string
          paid_customer_count?: number | null
          problems_risks: string
          report_period: string
          report_request_id?: string | null
          runway_months?: number
          shareholder_input_needed: string
          updated_at?: string
          variable_costs?: number
        }
        Update: {
          average_contract_value?: number | null
          cac?: number | null
          cash_balance?: number
          contract_count?: number | null
          conversion_rate?: number | null
          created_at?: string
          cumulative_revenue?: number
          dau?: number | null
          employee_count_change?: number
          fixed_costs?: number
          id?: string
          investee_id?: string
          mau?: number | null
          monthly_revenue?: number
          monthly_summary?: string
          next_month_decisions?: string
          paid_customer_count?: number | null
          problems_risks?: string
          report_period?: string
          report_request_id?: string | null
          runway_months?: number
          shareholder_input_needed?: string
          updated_at?: string
          variable_costs?: number
        }
        Relationships: [
          {
            foreignKeyName: "shareholder_reports_investee_id_fkey"
            columns: ["investee_id"]
            isOneToOne: false
            referencedRelation: "investees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shareholder_reports_report_request_id_fkey"
            columns: ["report_request_id"]
            isOneToOne: false
            referencedRelation: "report_requests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: { Args: { p_invitation_token: string }; Returns: Json }
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

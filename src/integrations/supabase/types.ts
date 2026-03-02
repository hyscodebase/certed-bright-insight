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
      connection_requests: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          message: string | null
          requester_role: string
          requester_user_id: string
          status: string
          target_email: string
          target_user_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          message?: string | null
          requester_role: string
          requester_user_id: string
          status?: string
          target_email: string
          target_user_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          message?: string | null
          requester_role?: string
          requester_user_id?: string
          status?: string
          target_email?: string
          target_user_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_verifications: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          purpose: string
          user_id: string
          verified: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          purpose?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          purpose?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      fund_investees: {
        Row: {
          created_at: string
          fund_id: string
          id: string
          investee_id: string
        }
        Insert: {
          created_at?: string
          fund_id: string
          id?: string
          investee_id: string
        }
        Update: {
          created_at?: string
          fund_id?: string
          id?: string
          investee_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fund_investees_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_investees_investee_id_fkey"
            columns: ["investee_id"]
            isOneToOne: false
            referencedRelation: "investees"
            referencedColumns: ["id"]
          },
        ]
      }
      funds: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investee_invitations: {
        Row: {
          accepted_at: string | null
          company_name: string
          contact_email: string
          created_at: string
          expires_at: string
          fund_ids: Json | null
          id: string
          invitation_token: string
          report_fields: Json
          report_frequency: string
          representative: string | null
          status: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          company_name: string
          contact_email: string
          created_at?: string
          expires_at?: string
          fund_ids?: Json | null
          id?: string
          invitation_token: string
          report_fields?: Json
          report_frequency?: string
          representative?: string | null
          status?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          company_name?: string
          contact_email?: string
          created_at?: string
          expires_at?: string
          fund_ids?: Json | null
          id?: string
          invitation_token?: string
          report_fields?: Json
          report_frequency?: string
          representative?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      investee_profiles: {
        Row: {
          address: string | null
          business_registration_number: string | null
          capital: number | null
          company_name: string
          contact_email: string | null
          created_at: string
          employee_count: number | null
          established_date: string | null
          id: string
          industry: string | null
          representative: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          business_registration_number?: string | null
          capital?: number | null
          company_name: string
          contact_email?: string | null
          created_at?: string
          employee_count?: number | null
          established_date?: string | null
          id?: string
          industry?: string | null
          representative?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          business_registration_number?: string | null
          capital?: number | null
          company_name?: string
          contact_email?: string | null
          created_at?: string
          employee_count?: number | null
          established_date?: string | null
          id?: string
          industry?: string | null
          representative?: string | null
          updated_at?: string
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
          investee_user_id: string | null
          investment_stage: string | null
          is_smb: boolean | null
          report_fields: Json
          report_frequency: string
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
          investee_user_id?: string | null
          investment_stage?: string | null
          is_smb?: boolean | null
          report_fields?: Json
          report_frequency?: string
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
          investee_user_id?: string | null
          investment_stage?: string | null
          is_smb?: boolean | null
          report_fields?: Json
          report_frequency?: string
          representative?: string | null
          resign_count?: number | null
          total_investment?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          default_report_fields: Json
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          default_report_fields?: Json
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          default_report_fields?: Json
          display_name?: string | null
          id?: string
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
          report_fields: string[] | null
          report_period: string | null
          request_token: string
          requested_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          expires_at?: string
          id?: string
          investee_id: string
          report_fields?: string[] | null
          report_period?: string | null
          request_token: string
          requested_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          expires_at?: string
          id?: string
          investee_id?: string
          report_fields?: string[] | null
          report_period?: string | null
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
          arppu: number | null
          arr: number | null
          average_contract_value: number | null
          cac: number | null
          cash_balance: number
          contract_count: number | null
          conversion_rate: number | null
          created_at: string
          cumulative_revenue: number
          current_status: Json | null
          dau: number | null
          employee_count_change: number
          fixed_costs: number
          id: string
          investee_id: string
          latest_price_per_share: number | null
          mau: number | null
          metrics_data: Json | null
          monthly_revenue: number
          monthly_summary: string
          mrr: number | null
          next_month_decisions: string
          paid_customer_count: number | null
          problems_risks: Json
          remaining_gov_subsidy: number | null
          report_period: string
          report_request_id: string | null
          runway_months: number
          shareholder_input_needed: string
          total_shares_issued: number | null
          updated_at: string
          variable_costs: number
        }
        Insert: {
          arppu?: number | null
          arr?: number | null
          average_contract_value?: number | null
          cac?: number | null
          cash_balance?: number
          contract_count?: number | null
          conversion_rate?: number | null
          created_at?: string
          cumulative_revenue?: number
          current_status?: Json | null
          dau?: number | null
          employee_count_change?: number
          fixed_costs?: number
          id?: string
          investee_id: string
          latest_price_per_share?: number | null
          mau?: number | null
          metrics_data?: Json | null
          monthly_revenue?: number
          monthly_summary: string
          mrr?: number | null
          next_month_decisions: string
          paid_customer_count?: number | null
          problems_risks: Json
          remaining_gov_subsidy?: number | null
          report_period: string
          report_request_id?: string | null
          runway_months?: number
          shareholder_input_needed: string
          total_shares_issued?: number | null
          updated_at?: string
          variable_costs?: number
        }
        Update: {
          arppu?: number | null
          arr?: number | null
          average_contract_value?: number | null
          cac?: number | null
          cash_balance?: number
          contract_count?: number | null
          conversion_rate?: number | null
          created_at?: string
          cumulative_revenue?: number
          current_status?: Json | null
          dau?: number | null
          employee_count_change?: number
          fixed_costs?: number
          id?: string
          investee_id?: string
          latest_price_per_share?: number | null
          mau?: number | null
          metrics_data?: Json | null
          monthly_revenue?: number
          monthly_summary?: string
          mrr?: number | null
          next_month_decisions?: string
          paid_customer_count?: number | null
          problems_risks?: Json
          remaining_gov_subsidy?: number | null
          report_period?: string
          report_request_id?: string | null
          runway_months?: number
          shareholder_input_needed?: string
          total_shares_issued?: number | null
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: { Args: { p_invitation_token: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      submit_shareholder_report: {
        Args: {
          p_arppu?: number
          p_arr?: number
          p_average_contract_value?: number
          p_cac?: number
          p_cash_balance: number
          p_contract_count?: number
          p_conversion_rate?: number
          p_cumulative_revenue: number
          p_current_status?: Json
          p_dau?: number
          p_employee_count_change: number
          p_fixed_costs: number
          p_latest_price_per_share?: number
          p_mau?: number
          p_metrics_data?: Json
          p_monthly_revenue: number
          p_monthly_summary: string
          p_mrr?: number
          p_next_month_decisions: string
          p_paid_customer_count?: number
          p_problems_risks: Json
          p_remaining_gov_subsidy?: number
          p_report_period: string
          p_request_token: string
          p_runway_months: number
          p_shareholder_input_needed: string
          p_total_shares_issued?: number
          p_variable_costs: number
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "investor" | "investee"
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
    Enums: {
      app_role: ["investor", "investee"],
    },
  },
} as const

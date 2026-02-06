import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Investee {
  id: string;
  user_id: string;
  company_name: string;
  industry: string | null;
  is_smb: boolean | null;
  capital: number | null;
  representative: string | null;
  established_date: string | null;
  employee_count: number | null;
  investment_stage: string | null;
  total_investment: number | null;
  average_salary: number | null;
  address: string | null;
  contact_email: string | null;
  hire_count: number | null;
  resign_count: number | null;
  created_at: string;
  updated_at: string;
}

export function useInvestees() {
  return useQuery({
    queryKey: ["investees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investees")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Investee[];
    },
  });
}

export function useInvestee(id: string) {
  return useQuery({
    queryKey: ["investee", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investees")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Investee | null;
    },
    enabled: !!id,
  });
}

export function useCreateInvestee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { company_name: string; contact_email: string; representative?: string | null }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("로그인이 필요합니다");

      const { data: result, error } = await supabase
        .from("investees")
        .insert({
          user_id: user.user.id,
          company_name: data.company_name,
          contact_email: data.contact_email,
          representative: data.representative,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investees"] });
      toast({
        title: "피투자사 추가 완료",
        description: "새로운 피투자사가 등록되었습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "피투자사 추가 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Fund {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface FundInvestee {
  id: string;
  fund_id: string;
  investee_id: string;
  created_at: string;
}

export function useFunds() {
  return useQuery({
    queryKey: ["funds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funds")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Fund[];
    },
  });
}

export function useFundInvestees(fundId?: string) {
  return useQuery({
    queryKey: ["fund-investees", fundId],
    queryFn: async () => {
      let query = supabase.from("fund_investees").select("*");
      if (fundId) query = query.eq("fund_id", fundId);
      const { data, error } = await query;
      if (error) throw error;
      return data as FundInvestee[];
    },
  });
}

export function useAllFundInvestees() {
  return useQuery({
    queryKey: ["fund-investees-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("fund_investees").select("*");
      if (error) throw error;
      return data as FundInvestee[];
    },
  });
}

export function useCreateFund() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { name: string; description?: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("로그인이 필요합니다");

      const { data, error } = await supabase
        .from("funds")
        .insert({ user_id: user.user.id, name: params.name, description: params.description || null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      toast({ title: "펀드 생성 완료", description: "새 펀드가 생성되었습니다." });
    },
    onError: (error: Error) => {
      toast({ title: "펀드 생성 실패", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateFund() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: { id: string; name: string; description?: string }) => {
      const { data, error } = await supabase
        .from("funds")
        .update({ name: params.name, description: params.description || null })
        .eq("id", params.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      toast({ title: "펀드 수정 완료" });
    },
    onError: (error: Error) => {
      toast({ title: "펀드 수정 실패", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteFund() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (fundId: string) => {
      const { error } = await supabase.from("funds").delete().eq("id", fundId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      queryClient.invalidateQueries({ queryKey: ["fund-investees-all"] });
      toast({ title: "펀드 삭제 완료" });
    },
    onError: (error: Error) => {
      toast({ title: "펀드 삭제 실패", description: error.message, variant: "destructive" });
    },
  });
}

export function useAddInvesteeToFund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { fund_id: string; investee_id: string }) => {
      const { data, error } = await supabase
        .from("fund_investees")
        .insert(params)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ["fund-investees", params.fund_id] });
      queryClient.invalidateQueries({ queryKey: ["fund-investees-all"] });
    },
  });
}

export function useRemoveInvesteeFromFund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { fund_id: string; investee_id: string }) => {
      const { error } = await supabase
        .from("fund_investees")
        .delete()
        .eq("fund_id", params.fund_id)
        .eq("investee_id", params.investee_id);
      if (error) throw error;
    },
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: ["fund-investees", params.fund_id] });
      queryClient.invalidateQueries({ queryKey: ["fund-investees-all"] });
    },
  });
}

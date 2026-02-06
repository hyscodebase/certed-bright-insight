import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export type ShareholderReport = Tables<"shareholder_reports">;
export type ReportRequest = Tables<"report_requests">;

export function useShareholderReports(investeeId: string) {
  return useQuery({
    queryKey: ["shareholder-reports", investeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shareholder_reports")
        .select("*")
        .eq("investee_id", investeeId)
        .order("report_period", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!investeeId,
  });
}

export function useReportRequests(investeeId: string) {
  return useQuery({
    queryKey: ["report-requests", investeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_requests")
        .select("*")
        .eq("investee_id", investeeId)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!investeeId,
  });
}

export function useCreateReportRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (investeeId: string) => {
      const token = crypto.randomUUID();

      const { data, error } = await supabase
        .from("report_requests")
        .insert({
          investee_id: investeeId,
          request_token: token,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, investeeId) => {
      queryClient.invalidateQueries({ queryKey: ["report-requests", investeeId] });
    },
    onError: (error: Error) => {
      toast({
        title: "보고서 요청 생성 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useSendReportRequestEmail() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      company_name: string;
      contact_email: string;
      request_token: string;
    }) => {
      const response = await supabase.functions.invoke("send-report-request-email", {
        body: params,
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "보고서 요청 이메일 발송 완료",
        description: "피투자사에게 주주보고서 작성 요청 이메일을 보냈습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "이메일 발송 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

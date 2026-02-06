import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReportStatus {
  hasReport: boolean;
  hasPendingRequest: boolean;
  latestReportPeriod?: string;
}

export function useLatestReportStatus(investeeIds: string[]) {
  return useQuery({
    queryKey: ["report-status", investeeIds],
    queryFn: async () => {
      if (investeeIds.length === 0) return {};

      // Fetch latest reports for each investee
      const { data: reports, error: reportsError } = await supabase
        .from("shareholder_reports")
        .select("investee_id, report_period")
        .in("investee_id", investeeIds)
        .order("report_period", { ascending: false });

      if (reportsError) throw reportsError;

      // Fetch pending requests for each investee
      const { data: requests, error: requestsError } = await supabase
        .from("report_requests")
        .select("investee_id, status")
        .in("investee_id", investeeIds)
        .eq("status", "pending");

      if (requestsError) throw requestsError;

      // Build status map
      const statusMap: Record<string, ReportStatus> = {};

      // Initialize all investees
      investeeIds.forEach((id) => {
        statusMap[id] = {
          hasReport: false,
          hasPendingRequest: false,
        };
      });

      // Check for reports (get latest for each investee)
      const seenInvestees = new Set<string>();
      reports?.forEach((report) => {
        if (!seenInvestees.has(report.investee_id)) {
          seenInvestees.add(report.investee_id);
          statusMap[report.investee_id] = {
            ...statusMap[report.investee_id],
            hasReport: true,
            latestReportPeriod: report.report_period,
          };
        }
      });

      // Check for pending requests
      requests?.forEach((request) => {
        statusMap[request.investee_id] = {
          ...statusMap[request.investee_id],
          hasPendingRequest: true,
        };
      });

      return statusMap;
    },
    enabled: investeeIds.length > 0,
  });
}

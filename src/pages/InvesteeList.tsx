import { List, ChevronRight, Send, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvestees } from "@/hooks/useInvestees";
import { useLatestReportStatus } from "@/hooks/useLatestReportStatus";
import { useCreateReportRequest, useSendReportRequestEmail } from "@/hooks/useShareholderReports";
import { useFunds, useAllFundInvestees } from "@/hooks/useFunds";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { ReportRequestDialog } from "@/components/reports/ReportRequestDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FREQUENCY_LABELS: Record<string, string> = {
  monthly: "월간",
  quarterly: "분기",
  semi_annual: "반기",
  annual: "연간",
};

export default function InvesteeList() {
  const navigate = useNavigate();
  const { data: investees, isLoading } = useInvestees();
  const { data: reportStatuses } = useLatestReportStatus(investees?.map((i) => i.id) || []);
  const { data: funds } = useFunds();
  const { data: allFundInvestees } = useAllFundInvestees();
  const createReportRequest = useCreateReportRequest();
  const sendReportEmail = useSendReportRequestEmail();
  const { toast } = useToast();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFundFilter, setSelectedFundFilter] = useState<string>("all");
  const [selectedInvestee, setSelectedInvestee] = useState<{
    id: string;
    companyName: string;
    contactEmail: string | null;
    reportFrequency: string;
  } | null>(null);

  const { data: investorProfile } = useQuery({
    queryKey: ["investor-profile"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("company_name")
        .eq("user_id", user.user.id)
        .single();
      return data;
    },
  });

  const investorCompanyName = investorProfile?.company_name || "투자사";

  const filteredInvestees = useMemo(() => {
    if (!investees) return [];
    if (selectedFundFilter === "all") return investees;
    if (selectedFundFilter === "unassigned") {
      const assignedIds = new Set(allFundInvestees?.map((fi) => fi.investee_id) || []);
      return investees.filter((i) => !assignedIds.has(i.id));
    }
    const fundInvesteeIds = new Set(
      allFundInvestees?.filter((fi) => fi.fund_id === selectedFundFilter).map((fi) => fi.investee_id) || []
    );
    return investees.filter((i) => fundInvesteeIds.has(i.id));
  }, [investees, selectedFundFilter, allFundInvestees]);

  const handleOpenRequestDialog = (
    e: React.MouseEvent,
    investeeId: string,
    companyName: string,
    contactEmail: string | null,
    reportFrequency: string
  ) => {
    e.stopPropagation();
    if (!contactEmail) {
      toast({ title: "이메일 주소 없음", description: "피투자사의 담당자 이메일이 등록되어 있지 않습니다.", variant: "destructive" });
      return;
    }
    setSelectedInvestee({ id: investeeId, companyName, contactEmail, reportFrequency });
    setDialogOpen(true);
  };

  const handleConfirmRequest = async (reportPeriod: string) => {
    if (!selectedInvestee || !selectedInvestee.contactEmail) return;
    setSendingId(selectedInvestee.id);
    try {
      const request = await createReportRequest.mutateAsync({ investeeId: selectedInvestee.id, reportPeriod });
      await sendReportEmail.mutateAsync({
        company_name: selectedInvestee.companyName,
        contact_email: selectedInvestee.contactEmail,
        request_token: request.request_token,
        report_period: reportPeriod,
        investor_company_name: investorCompanyName,
      });
      setDialogOpen(false);
    } catch (error) {
      // Error handling in hooks
    } finally {
      setSendingId(null);
    }
  };

  const getStatusBadge = (investeeId: string) => {
    const status = reportStatuses?.[investeeId];
    if (!status) return <Badge variant="outline" className="text-muted-foreground">미요청</Badge>;
    if (status.hasReport) return <Badge variant="default">제출완료</Badge>;
    if (status.hasPendingRequest) return <Badge variant="secondary">요청중</Badge>;
    return <Badge variant="outline" className="text-muted-foreground">미요청</Badge>;
  };

  // Get fund names for an investee
  const getFundBadges = (investeeId: string) => {
    const fundIds = allFundInvestees?.filter((fi) => fi.investee_id === investeeId).map((fi) => fi.fund_id) || [];
    if (fundIds.length === 0) return null;
    return fundIds.map((fid) => {
      const fund = funds?.find((f) => f.id === fid);
      return fund ? (
        <Badge key={fid} variant="outline" className="text-xs">{fund.name}</Badge>
      ) : null;
    });
  };

  return (
    <DashboardLayout>
      <PageHeader title="피투자사 목록" icon={<List className="h-6 w-6" />} />

      <Card className="animate-fade-in border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-medium">피투자사 목록</CardTitle>
          <div className="flex items-center gap-3">
            {funds && funds.length > 0 && (
              <Select value={selectedFundFilter} onValueChange={setSelectedFundFilter}>
                <SelectTrigger className="h-8 w-[160px] text-sm">
                  <SelectValue placeholder="펀드 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="unassigned">미배정</SelectItem>
                  {funds.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <button
              onClick={() => navigate("/add-investee")}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
            >
              피투자사 추가
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-t">
                <TableHead className="w-[30%] pl-6 font-medium text-foreground">기업명</TableHead>
                <TableHead className="font-medium text-foreground">펀드</TableHead>
                <TableHead className="font-medium text-foreground">보고 주기</TableHead>
                <TableHead className="font-medium text-foreground">제출 상태</TableHead>
                <TableHead className="font-medium text-foreground">보고서 요청</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredInvestees.length > 0 ? (
                filteredInvestees.map((company) => (
                  <TableRow
                    key={company.id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => navigate(`/company/${company.id}`)}
                  >
                    <TableCell className="pl-6 font-medium">{company.company_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getFundBadges(company.id) || <span className="text-xs text-muted-foreground">-</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {FREQUENCY_LABELS[company.report_frequency] || "월간"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(company.id)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        disabled={sendingId === company.id}
                        onClick={(e) =>
                          handleOpenRequestDialog(e, company.id, company.company_name, company.contact_email, company.report_frequency || "monthly")
                        }
                      >
                        {sendingId === company.id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            발송중
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            요청
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    {selectedFundFilter !== "all" ? "해당 펀드에 속한 피투자사가 없습니다." : "등록된 피투자사가 없습니다."}
                    <button
                      onClick={() => navigate("/add-investee")}
                      className="ml-2 text-primary hover:underline"
                    >
                      추가하기
                    </button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedInvestee && (
        <ReportRequestDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          companyName={selectedInvestee.companyName}
          onConfirm={handleConfirmRequest}
          isLoading={sendingId === selectedInvestee.id}
          reportFrequency={selectedInvestee.reportFrequency}
        />
      )}
    </DashboardLayout>
  );
}

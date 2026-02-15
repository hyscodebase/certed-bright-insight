import { List, Plus, Send, Loader2, Pencil, Trash2, ChevronRight } from "lucide-react";
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
import { useInvestees, useDeleteInvestee } from "@/hooks/useInvestees";
import { useLatestReportStatus } from "@/hooks/useLatestReportStatus";
import { useCreateReportRequest, useSendReportRequestEmail } from "@/hooks/useShareholderReports";
import { useFunds, useAllFundInvestees } from "@/hooks/useFunds";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { ReportRequestDialog } from "@/components/reports/ReportRequestDialog";
import { InvesteeFormDialog } from "@/components/investees/InvesteeFormDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const deleteInvestee = useDeleteInvestee();
  const { toast } = useToast();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [selectedFundFilter, setSelectedFundFilter] = useState<string>("all");
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editingInvestee, setEditingInvestee] = useState<{
    id: string;
    company_name: string;
    representative: string | null;
    contact_email: string | null;
  } | null>(null);
  const [selectedInvestee, setSelectedInvestee] = useState<{
    id: string;
    companyName: string;
    contactEmail: string | null;
    reportFields: Record<string, string[]>;
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
    reportFields: any
  ) => {
    e.stopPropagation();
    if (!contactEmail) {
      toast({ title: "이메일 주소 없음", description: "피투자사의 담당자 이메일이 등록되어 있지 않습니다.", variant: "destructive" });
      return;
    }
    // Parse report_fields into config
    const config: Record<string, string[]> = (reportFields && typeof reportFields === "object" && !Array.isArray(reportFields))
      ? reportFields
      : { monthly: [], quarterly: [], semi_annual: [], annual: [] };
    setSelectedInvestee({ id: investeeId, companyName, contactEmail, reportFields: config });
    setDialogOpen(true);
  };

  const handleConfirmRequest = async (periods: Array<{ period: string; reportFields: string[] }>) => {
    if (!selectedInvestee || !selectedInvestee.contactEmail) return;
    setSendingId(selectedInvestee.id);
    try {
      for (const { period, reportFields } of periods) {
        const request = await createReportRequest.mutateAsync({
          investeeId: selectedInvestee.id,
          reportPeriod: period,
          reportFields,
        });
        await sendReportEmail.mutateAsync({
          company_name: selectedInvestee.companyName,
          contact_email: selectedInvestee.contactEmail,
          request_token: request.request_token,
          report_period: period,
          investor_company_name: investorCompanyName,
        });
      }
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
            <Button onClick={() => navigate("/add-investee")} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              피투자사 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-t">
                <TableHead className="w-[25%] pl-6 font-medium text-foreground">기업명</TableHead>
                <TableHead className="font-medium text-foreground">펀드</TableHead>
                <TableHead className="font-medium text-foreground">보고 주기</TableHead>
                <TableHead className="font-medium text-foreground">제출 상태</TableHead>
                <TableHead className="font-medium text-foreground">보고서 요청</TableHead>
                <TableHead className="w-[120px] font-medium text-foreground">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24">
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
                          handleOpenRequestDialog(e, company.id, company.company_name, company.contact_email, (company as any).report_fields)
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
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingInvestee({
                            id: company.id,
                            company_name: company.company_name,
                            representative: company.representative,
                            contact_email: company.contact_email,
                          });
                          setEditFormOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ id: company.id, name: company.company_name });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
          enabledFrequencies={Object.keys(selectedInvestee.reportFields)}
          reportFieldsConfig={selectedInvestee.reportFields}
        />
      )}

      <InvesteeFormDialog
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        investee={editingInvestee}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>피투자사 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" 피투자사를 삭제하시겠습니까? 관련된 보고서 요청 및 데이터가 함께 삭제될 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteTarget) {
                  await deleteInvestee.mutateAsync(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

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
import { useInvestees } from "@/hooks/useInvestees";
import { useLatestReportStatus } from "@/hooks/useLatestReportStatus";
import { useCreateReportRequest, useSendReportRequestEmail } from "@/hooks/useShareholderReports";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ReportRequestDialog } from "@/components/reports/ReportRequestDialog";

export default function InvesteeList() {
  const navigate = useNavigate();
  const { data: investees, isLoading } = useInvestees();
  const { data: reportStatuses } = useLatestReportStatus(investees?.map((i) => i.id) || []);
  const createReportRequest = useCreateReportRequest();
  const sendReportEmail = useSendReportRequestEmail();
  const { toast } = useToast();
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvestee, setSelectedInvestee] = useState<{
    id: string;
    companyName: string;
    contactEmail: string | null;
  } | null>(null);

  const handleOpenRequestDialog = (
    e: React.MouseEvent,
    investeeId: string,
    companyName: string,
    contactEmail: string | null
  ) => {
    e.stopPropagation();

    if (!contactEmail) {
      toast({
        title: "이메일 주소 없음",
        description: "피투자사의 담당자 이메일이 등록되어 있지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    setSelectedInvestee({ id: investeeId, companyName, contactEmail });
    setDialogOpen(true);
  };

  const handleConfirmRequest = async (reportPeriod: string) => {
    if (!selectedInvestee || !selectedInvestee.contactEmail) return;

    setSendingId(selectedInvestee.id);

    try {
      const request = await createReportRequest.mutateAsync({
        investeeId: selectedInvestee.id,
        reportPeriod,
      });
      await sendReportEmail.mutateAsync({
        company_name: selectedInvestee.companyName,
        contact_email: selectedInvestee.contactEmail,
        request_token: request.request_token,
        report_period: reportPeriod,
      });
      setDialogOpen(false);
    } catch (error) {
      // Error handling is done in the hooks
    } finally {
      setSendingId(null);
    }
  };

  const getStatusBadge = (investeeId: string) => {
    const status = reportStatuses?.[investeeId];
    
    if (!status) {
      return <Badge variant="outline" className="text-muted-foreground">미요청</Badge>;
    }
    
    if (status.hasReport) {
      return <Badge variant="default">제출완료</Badge>;
    }
    
    if (status.hasPendingRequest) {
      return <Badge variant="secondary">요청중</Badge>;
    }
    
    return <Badge variant="outline" className="text-muted-foreground">미요청</Badge>;
  };

  return (
    <DashboardLayout>
      <PageHeader title="피투자사 목록" icon={<List className="h-6 w-6" />} />

      <Card className="animate-fade-in border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-medium">피투자사 목록</CardTitle>
          <button
            onClick={() => navigate("/add-investee")}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
          >
            피투자사 추가
            <ChevronRight className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-t">
                <TableHead className="w-[40%] pl-6 font-medium text-foreground">
                  기업명
                </TableHead>
                <TableHead className="font-medium text-foreground">제출 상태</TableHead>
                <TableHead className="font-medium text-foreground">보고서 요청</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : investees && investees.length > 0 ? (
                investees.map((company) => (
                  <TableRow
                    key={company.id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => navigate(`/company/${company.id}`)}
                  >
                    <TableCell className="pl-6 font-medium">{company.company_name}</TableCell>
                    <TableCell>{getStatusBadge(company.id)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        disabled={sendingId === company.id}
                        onClick={(e) =>
                          handleOpenRequestDialog(e, company.id, company.company_name, company.contact_email)
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
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    등록된 피투자사가 없습니다.
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
        />
      )}
    </DashboardLayout>
  );
}

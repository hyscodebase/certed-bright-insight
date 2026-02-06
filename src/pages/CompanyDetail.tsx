import { useParams } from "react-router-dom";
import { Building2, TrendingUp, DollarSign, RefreshCw, FileText, Send, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useInvestee } from "@/hooks/useInvestees";
import { useShareholderReports, useCreateReportRequest, useSendReportRequestEmail } from "@/hooks/useShareholderReports";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

function formatCurrency(amount: number | null): string {
  if (amount === null || amount === 0) return "정보 없음";
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억 원`;
  }
  if (amount >= 10000) {
    return `${Math.round(amount / 10000).toLocaleString()}만 원`;
  }
  return `${amount.toLocaleString()} 원`;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "정보 없음";
  return dateString.replace(/-/g, ".");
}

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  return `${year}년 ${month}월`;
}

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: company, isLoading } = useInvestee(id || "");
  const { data: reports = [] } = useShareholderReports(id || "");
  const createReportRequest = useCreateReportRequest();
  const sendReportEmail = useSendReportRequestEmail();
  const { toast } = useToast();
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const handleRequestReport = async () => {
    if (!company || !company.contact_email) {
      toast({
        title: "이메일 주소 없음",
        description: "피투자사의 담당자 이메일이 등록되어 있지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingRequest(true);

    try {
      const request = await createReportRequest.mutateAsync(company.id);
      await sendReportEmail.mutateAsync({
        company_name: company.company_name,
        contact_email: company.contact_email,
        request_token: request.request_token,
      });
    } catch (error) {
      // Error handling is done in the hooks
    } finally {
      setIsSendingRequest(false);
    }
  };

  // Prepare chart data from reports
  const revenueChartData = reports
    .slice(0, 6)
    .reverse()
    .map((r) => ({
      month: r.report_period.split("-")[1] + "월",
      monthly: r.monthly_revenue / 10000, // Convert to 만원
      cumulative: r.cumulative_revenue / 10000,
    }));

  const costChartData = reports
    .slice(0, 6)
    .reverse()
    .map((r) => ({
      month: r.report_period.split("-")[1] + "월",
      fixed: r.fixed_costs / 10000,
      variable: r.variable_costs / 10000,
    }));

  const cashChartData = reports
    .slice(0, 6)
    .reverse()
    .map((r) => ({
      month: r.report_period.split("-")[1] + "월",
      value: r.cash_balance / 1000000, // Convert to 백만원
    }));

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader title="기업상세 정보" showBack />
        <Card className="animate-fade-in border-border shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!company) {
    return (
      <DashboardLayout>
        <PageHeader title="기업상세 정보" showBack />
        <Card className="animate-fade-in border-border shadow-sm">
          <CardContent className="p-6 text-center text-muted-foreground">
            피투자사 정보를 찾을 수 없습니다.
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const today = new Date().toISOString().split("T")[0].replace(/-/g, ".");
  const latestReport = reports[0];

  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center justify-between">
        <PageHeader title="기업상세 정보" showBack />
        <Button
          onClick={handleRequestReport}
          disabled={isSendingRequest}
          className="gap-2"
        >
          {isSendingRequest ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              발송 중...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              주주보고서 작성 요청
            </>
          )}
        </Button>
      </div>

      {/* Company Info Card */}
      <Card className="mb-6 animate-fade-in border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">{company.company_name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-4">
              <InfoRow label="산업" value={company.industry || "정보 없음"} />
              <InfoRow label="기업구분" value={company.is_smb ? "중소기업" : "대기업"} />
              <InfoRow label="자본금" value={formatCurrency(company.capital)} subtext={`${today} 기준`} />
              <InfoRow label="대표자" value={company.representative || "정보 없음"} />
              <InfoRow label="설립일" value={formatDate(company.established_date)} />
              <InfoRow label="직원수" value={company.employee_count?.toString() || "0"} subtext={`${today} 기준`} />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <InfoRow label="입사자" value={`${company.hire_count || 0} 명`} subtext="최근 3 개월" />
              <InfoRow label="퇴사자" value={`${company.resign_count || 0} 명`} subtext="최근 3 개월" />
              <InfoRow label="투자단계" value={company.investment_stage || "Seed"} />
              <InfoRow label="투자액" value={formatCurrency(company.total_investment)} />
              <InfoRow label="평균연봉" value={formatCurrency(company.average_salary)} />
              <InfoRow label="주소" value={company.address || "정보 없음"} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latest Report Summary */}
      {latestReport && (
        <Card className="mb-6 animate-fade-in border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">
              {formatPeriod(latestReport.report_period)} 보고서 요약
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">이번 달 요약</span>
              <p className="mt-1 text-sm">{latestReport.monthly_summary}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">문제/리스크</span>
              <p className="mt-1 text-sm">{latestReport.problems_risks}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">주주 의견 필요 사안</span>
              <p className="mt-1 text-sm">{latestReport.shareholder_input_needed}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Runway Card */}
        <Card className="animate-fade-in border-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">런웨이</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-lg font-semibold text-primary">
                {latestReport ? `${latestReport.runway_months}개월` : "정보 없음"}
              </span>
              <span className="ml-2 rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                Gross Burn Rate 기준
              </span>
            </div>

            {/* Circular Progress Indicator */}
            <div className="flex flex-col items-center py-6">
              <div className="relative h-32 w-32">
                <svg className="h-32 w-32 -rotate-90 transform">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="352"
                    strokeDashoffset={latestReport ? Math.max(0, 352 - (latestReport.runway_months / 24) * 352) : 352}
                    className="text-chart-secondary"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">
                    {latestReport?.runway_months || 0}
                  </span>
                  <span className="text-xs text-muted-foreground">개월</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-primary" />
                <span className="text-muted-foreground">현금 잔고 | {latestReport ? formatCurrency(latestReport.cash_balance) : "정보 없음"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-muted" />
                <span className="text-muted-foreground">
                  번 레이트 | {latestReport ? formatCurrency(latestReport.fixed_costs + latestReport.variable_costs) : "0 원"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart Card */}
        <Card className="animate-fade-in border-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">매출 추이</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <span className="text-lg font-semibold text-primary">
                {latestReport ? formatCurrency(latestReport.monthly_revenue) : "정보 없음"}
              </span>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">단위 : 만원</p>

            <div className="h-48">
              {revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="monthly" fill="hsl(var(--chart-primary))" radius={[4, 4, 0, 0]} name="월 매출" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  보고서 데이터가 없습니다
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cash Balance Card */}
        <Card className="animate-fade-in border-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">현금 잔고</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <span className="text-2xl font-bold text-primary">
                {latestReport ? formatCurrency(latestReport.cash_balance) : "정보 없음"}
              </span>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">단위 : 백만원</p>

            <div className="h-48">
              {cashChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--chart-primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-primary))", strokeWidth: 2, r: 4 }}
                      name="현금 잔고"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  보고서 데이터가 없습니다
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shareholder Reports Table */}
      <Card className="animate-fade-in border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-medium">주주보고서</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-t">
                <TableHead className="w-[30%] pl-6 font-medium text-foreground">보고 기간</TableHead>
                <TableHead className="font-medium text-foreground">월 매출</TableHead>
                <TableHead className="font-medium text-foreground">현금 잔고</TableHead>
                <TableHead className="font-medium text-foreground">런웨이</TableHead>
                <TableHead className="font-medium text-foreground">작성일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length > 0 ? (
                reports.map((report) => (
                  <TableRow key={report.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="pl-6 font-medium">{formatPeriod(report.report_period)}</TableCell>
                    <TableCell>{formatCurrency(report.monthly_revenue)}</TableCell>
                    <TableCell>{formatCurrency(report.cash_balance)}</TableCell>
                    <TableCell>{report.runway_months}개월</TableCell>
                    <TableCell>{formatDate(report.created_at.split("T")[0])}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    등록된 주주보고서가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function InfoRow({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="flex gap-4">
      <span className="w-20 shrink-0 text-sm text-muted-foreground">{label}</span>
      <div>
        <span className="text-sm font-medium">{value}</span>
        {subtext && <span className="ml-2 text-xs text-muted-foreground">({subtext})</span>}
      </div>
    </div>
  );
}

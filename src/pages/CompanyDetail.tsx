import { useParams } from "react-router-dom";
import { Building2, TrendingUp, DollarSign, RefreshCw, FileText, Send, Loader2, Briefcase, Plus, Pencil } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
} from "recharts";
import { useInvestee } from "@/hooks/useInvestees";
import { useShareholderReports, useCreateReportRequest, useSendReportRequestEmail, type ShareholderReport } from "@/hooks/useShareholderReports";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings2 } from "lucide-react";
import { ReportDetailDialog } from "@/components/reports/ReportDetailDialog";
import { ReportRequestDialog } from "@/components/reports/ReportRequestDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFunds, useAllFundInvestees, useAddInvesteeToFund, useRemoveInvesteeFromFund, type Fund } from "@/hooks/useFunds";
import { FundFormDialog } from "@/components/funds/FundFormDialog";

const OPTIONAL_REPORT_FIELDS = [
  { key: "contract_count", label: "계약 수" },
  { key: "paid_customer_count", label: "유료 고객 수" },
  { key: "average_contract_value", label: "평균 계약 단가" },
  { key: "mau", label: "MAU" },
  { key: "dau", label: "DAU" },
  { key: "conversion_rate", label: "전환율" },
  { key: "cac", label: "CAC" },
] as const;

const ALL_FIELD_KEYS = OPTIONAL_REPORT_FIELDS.map(f => f.key);

const FREQUENCY_OPTIONS = [
  { key: "monthly", label: "월간" },
  { key: "quarterly", label: "분기" },
  { key: "semi_annual", label: "반기" },
  { key: "annual", label: "연간" },
] as const;

type ReportFieldsConfig = Record<string, string[]>;

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
  const [selectedReport, setSelectedReport] = useState<ShareholderReport | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [fundFormOpen, setFundFormOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [fundEditMode, setFundEditMode] = useState(false);
  const [reportFieldsEditMode, setReportFieldsEditMode] = useState(false);
  const queryClient = useQueryClient();

  const [selectedFrequencyTab, setSelectedFrequencyTab] = useState<string>(company?.report_frequency || "monthly");

  const reportFieldsConfig = useMemo((): ReportFieldsConfig => {
    const raw = (company as any)?.report_fields;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      return raw as ReportFieldsConfig;
    }
    // Legacy: flat array or missing -> apply to all frequencies
    const defaultFields = Array.isArray(raw) ? raw : [...ALL_FIELD_KEYS];
    return {
      monthly: defaultFields,
      quarterly: defaultFields,
      semi_annual: defaultFields,
      annual: defaultFields,
    };
  }, [(company as any)?.report_fields]);

  const getFieldsForFrequency = (freq: string): Set<string> => {
    return new Set<string>(reportFieldsConfig[freq] ?? ALL_FIELD_KEYS);
  };

  const currentFrequencyFields = useMemo(
    () => getFieldsForFrequency(selectedFrequencyTab),
    [selectedFrequencyTab, reportFieldsConfig]
  );

  // Fields for the investee's own frequency (used for request dialog default)
  const currentReportFields = useMemo(
    () => getFieldsForFrequency(company?.report_frequency || "monthly"),
    [company?.report_frequency, reportFieldsConfig]
  );

  const updateReportFields = useMutation({
    mutationFn: async (newConfig: ReportFieldsConfig) => {
      if (!id) throw new Error("No investee id");
      const { error } = await supabase
        .from("investees")
        .update({ report_fields: newConfig } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investee", id] });
      toast({ title: "보고서 필드 설정이 저장되었습니다." });
    },
  });

  const handleToggleReportField = useCallback((fieldKey: string) => {
    const currentFields = new Set(reportFieldsConfig[selectedFrequencyTab] ?? ALL_FIELD_KEYS);
    if (currentFields.has(fieldKey)) {
      currentFields.delete(fieldKey);
    } else {
      currentFields.add(fieldKey);
    }
    updateReportFields.mutate({
      ...reportFieldsConfig,
      [selectedFrequencyTab]: Array.from(currentFields),
    });
  }, [reportFieldsConfig, selectedFrequencyTab, updateReportFields]);

  // Fund management
  const { data: funds } = useFunds();
  const { data: allFundInvestees } = useAllFundInvestees();
  const addToFund = useAddInvesteeToFund();
  const removeFromFund = useRemoveInvesteeFromFund();

  const assignedFundIds = useMemo(() => {
    if (!allFundInvestees || !id) return new Set<string>();
    return new Set(allFundInvestees.filter((fi) => fi.investee_id === id).map((fi) => fi.fund_id));
  }, [allFundInvestees, id]);

  const handleToggleFund = async (fundId: string) => {
    if (!id) return;
    if (assignedFundIds.has(fundId)) {
      await removeFromFund.mutateAsync({ fund_id: fundId, investee_id: id });
    } else {
      await addToFund.mutateAsync({ fund_id: fundId, investee_id: id });
    }
  };
  // Fetch investor's company name from profile
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

  const handleReportClick = (report: ShareholderReport) => {
    setSelectedReport(report);
    setIsReportDialogOpen(true);
  };

  const handleOpenRequestDialog = () => {
    if (!company || !company.contact_email) {
      toast({
        title: "이메일 주소 없음",
        description: "피투자사의 담당자 이메일이 등록되어 있지 않습니다.",
        variant: "destructive",
      });
      return;
    }
    setIsRequestDialogOpen(true);
  };

  const handleRequestReport = async (periods: Array<{ period: string; reportFields: string[] }>) => {
    if (!company || !company.contact_email) return;

    setIsSendingRequest(true);

    try {
      for (const { period, reportFields } of periods) {
        const request = await createReportRequest.mutateAsync({
          investeeId: company.id,
          reportPeriod: period,
          reportFields,
        });
        await sendReportEmail.mutateAsync({
          company_name: company.company_name,
          contact_email: company.contact_email,
          request_token: request.request_token,
          report_period: period,
          investor_company_name: investorCompanyName,
        });
      }
      setIsRequestDialogOpen(false);
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
          onClick={handleOpenRequestDialog}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          주주보고서 작성 요청
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
          <div className="space-y-3">
            <InfoRow label="대표자" value={company.representative || "정보 없음"} />
            <InfoRow label="담당자 이메일" value={company.contact_email || "정보 없음"} />
          </div>
        </CardContent>
      </Card>

      {/* Fund Assignments */}
      <Card className="mb-6 animate-fade-in border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-medium">소속 펀드</CardTitle>
              {!fundEditMode && <Badge variant="secondary">{assignedFundIds.size}개</Badge>}
            </div>
            <div className="flex items-center gap-2">
              {fundEditMode && (
                <Button size="sm" variant="outline" className="gap-1" onClick={() => { setEditingFund(null); setFundFormOpen(true); }}>
                  <Plus className="h-3.5 w-3.5" />
                  펀드 생성
                </Button>
              )}
              <Button size="sm" variant={fundEditMode ? "default" : "outline"} onClick={() => setFundEditMode(!fundEditMode)}>
                {fundEditMode ? "완료" : "편집"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {fundEditMode ? (
            /* Edit mode: show all funds with checkboxes */
            <Table>
              <TableHeader>
                <TableRow className="border-t">
                  <TableHead className="w-[80px] whitespace-nowrap pl-6 font-medium text-foreground">선택</TableHead>
                  <TableHead className="font-medium text-foreground">펀드명</TableHead>
                  <TableHead className="font-medium text-foreground">설명</TableHead>
                  <TableHead className="w-[60px] font-medium text-foreground"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funds && funds.length > 0 ? funds.map((fund) => {
                  const isAssigned = assignedFundIds.has(fund.id);
                  return (
                    <TableRow
                      key={fund.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${isAssigned ? "bg-primary/5" : ""}`}
                      onClick={() => handleToggleFund(fund.id)}
                    >
                      <TableCell className="pl-6" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isAssigned} onCheckedChange={() => handleToggleFund(fund.id)} />
                      </TableCell>
                      <TableCell className="font-medium">{fund.name}</TableCell>
                      <TableCell className="text-muted-foreground">{fund.description || "-"}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingFund(fund); setFundFormOpen(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      등록된 펀드가 없습니다. 펀드를 먼저 생성해 주세요.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            /* View mode: show only assigned funds */
            <Table>
              <TableHeader>
                <TableRow className="border-t">
                  <TableHead className="pl-6 font-medium text-foreground">펀드명</TableHead>
                  <TableHead className="font-medium text-foreground">설명</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funds && funds.filter((f) => assignedFundIds.has(f.id)).length > 0 ? (
                  funds.filter((f) => assignedFundIds.has(f.id)).map((fund) => (
                    <TableRow key={fund.id}>
                      <TableCell className="pl-6 font-medium">{fund.name}</TableCell>
                      <TableCell className="text-muted-foreground">{fund.description || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                      소속된 펀드가 없습니다. 편집 버튼을 눌러 펀드를 배정하세요.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Report Field Settings */}
      <Card className="mb-6 animate-fade-in border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-medium">보고서 선택 항목 설정</CardTitle>
            </div>
            <Button size="sm" variant={reportFieldsEditMode ? "default" : "outline"} onClick={() => setReportFieldsEditMode(!reportFieldsEditMode)}>
              {reportFieldsEditMode ? "완료" : "편집"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Frequency tabs */}
          <div className="flex gap-1 rounded-lg border p-1">
            {FREQUENCY_OPTIONS.map((freq) => (
              <button
                key={freq.key}
                onClick={() => setSelectedFrequencyTab(freq.key)}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedFrequencyTab === freq.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {freq.label}
              </button>
            ))}
          </div>

          {reportFieldsEditMode ? (
            <Table>
              <TableHeader>
                <TableRow className="border-t">
                  <TableHead className="w-[80px] whitespace-nowrap pl-6 font-medium text-foreground">포함</TableHead>
                  <TableHead className="font-medium text-foreground">필드명</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {OPTIONAL_REPORT_FIELDS.map((field) => (
                  <TableRow
                    key={field.key}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${currentFrequencyFields.has(field.key) ? "bg-primary/5" : ""}`}
                    onClick={() => handleToggleReportField(field.key)}
                  >
                    <TableCell className="pl-6" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={currentFrequencyFields.has(field.key)} onCheckedChange={() => handleToggleReportField(field.key)} />
                    </TableCell>
                    <TableCell className="font-medium">{field.label}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-wrap gap-2">
              {OPTIONAL_REPORT_FIELDS.filter(f => currentFrequencyFields.has(f.key)).map((field) => (
                <Badge key={field.key} variant="secondary">{field.label}</Badge>
              ))}
              {currentFrequencyFields.size === 0 && (
                <p className="text-sm text-muted-foreground">선택된 항목이 없습니다.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>


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
                    className="text-primary"
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
                  <TableRow 
                    key={report.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleReportClick(report)}
                  >
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

      <ReportDetailDialog
        report={selectedReport}
        companyName={company?.company_name}
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
      />

      <ReportRequestDialog
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
        companyName={company.company_name}
        onConfirm={handleRequestReport}
        isLoading={isSendingRequest}
        reportFrequency={company.report_frequency || "monthly"}
        defaultReportFields={Array.from(currentReportFields)}
      />

      <FundFormDialog
        open={fundFormOpen}
        onOpenChange={setFundFormOpen}
        editingFund={editingFund}
      />
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

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReportFormData {
  // Required fields
  monthly_summary: string;
  problems_risks: string;
  next_month_decisions: string;
  shareholder_input_needed: string;
  monthly_revenue: string;
  fixed_costs: string;
  variable_costs: string;
  cash_balance: string;
  runway_months: string;
  employee_count_change: string;
  // Optional fields
  contract_count: string;
  paid_customer_count: string;
  average_contract_value: string;
  mau: string;
  dau: string;
  conversion_rate: string;
  cac: string;
}

const initialFormData: ReportFormData = {
  monthly_summary: "",
  problems_risks: "",
  next_month_decisions: "",
  shareholder_input_needed: "",
  monthly_revenue: "",
  fixed_costs: "",
  variable_costs: "",
  cash_balance: "",
  runway_months: "",
  employee_count_change: "",
  contract_count: "",
  paid_customer_count: "",
  average_contract_value: "",
  mau: "",
  dau: "",
  conversion_rate: "",
  cac: "",
};

type RequiredField = keyof ReportFormData;

const OPTIONAL_FIELD_LABELS: Record<string, string> = {
  contract_count: "계약 수",
  paid_customer_count: "유료 고객 수",
  average_contract_value: "평균 계약 단가",
  mau: "MAU",
  dau: "DAU",
  conversion_rate: "전환율",
  cac: "CAC",
};

// Required fields are dynamically determined based on whether this is the first report + enabled optional fields
const getRequiredFields = (isFirstReport: boolean, enabledOptional: Set<string>): { key: RequiredField; label: string }[] => {
  const baseFields: { key: RequiredField; label: string }[] = [
    { key: "monthly_summary", label: "이번 달 한 줄 요약" },
    { key: "problems_risks", label: "문제/리스크" },
    { key: "next_month_decisions", label: "다음 달 중요한 의사결정 포인트" },
    { key: "shareholder_input_needed", label: "주주 의견이 필요한 사안" },
    { key: "monthly_revenue", label: "월 매출" },
    { key: "fixed_costs", label: "고정비" },
    { key: "variable_costs", label: "변동비" },
    { key: "runway_months", label: "Runway" },
    { key: "employee_count_change", label: "인원 수 변화" },
  ];
  
  if (isFirstReport) {
    baseFields.push({ key: "cash_balance", label: "현금 잔고" });
  }

  // Add enabled optional fields as required
  for (const fieldKey of enabledOptional) {
    if (OPTIONAL_FIELD_LABELS[fieldKey]) {
      baseFields.push({ key: fieldKey as RequiredField, label: OPTIONAL_FIELD_LABELS[fieldKey] });
    }
  }
  
  return baseFields;
};

function formatReportPeriod(period: string): string {
  if (/^\d{4}-Q\d$/.test(period)) {
    const [year, q] = period.split("-Q");
    return `${year}년 ${q}분기`;
  } else if (/^\d{4}-H\d$/.test(period)) {
    const [year, h] = period.split("-H");
    return `${year}년 ${h === "1" ? "상반기" : "하반기"}`;
  } else if (/^\d{4}$/.test(period)) {
    return `${period}년`;
  } else {
    const [year, month] = period.split("-");
    return `${year}년 ${parseInt(month)}월`;
  }
}

export default function SubmitReport() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const { toast } = useToast();

  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "expired" | "completed" | "submitting" | "success">("loading");
  const [companyName, setCompanyName] = useState("");
  const [reportPeriod, setReportPeriod] = useState("");
  const [formData, setFormData] = useState<ReportFormData>(initialFormData);
  const [investeeId, setInvesteeId] = useState<string>("");
  const [previousCumulativeRevenue, setPreviousCumulativeRevenue] = useState<number>(0);
  const [previousCashBalance, setPreviousCashBalance] = useState<number | null>(null);
  const [isFirstReport, setIsFirstReport] = useState<boolean>(true);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [enabledOptionalFields, setEnabledOptionalFields] = useState<Set<string>>(
    new Set(["contract_count", "paid_customer_count", "average_contract_value", "mau", "dau", "conversion_rate", "cac"])
  );

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setStatus("invalid");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("report_requests")
          .select(`
            *,
            investees (id, company_name, report_fields, report_frequency)
          `)
          .eq("request_token", token)
          .maybeSingle();

        if (error || !data) {
          setStatus("invalid");
          return;
        }

        if (data.status === "completed") {
          setStatus("completed");
          setCompanyName((data.investees as any)?.company_name || "");
          return;
        }

        if (new Date(data.expires_at) < new Date()) {
          setStatus("expired");
          return;
        }

        const investee = data.investees as any;
        setCompanyName(investee?.company_name || "");
        setInvesteeId(investee?.id || "");
        
        // Set enabled optional fields: request-level overrides investee-level
        const requestFields = (data as any).report_fields;
        if (requestFields && Array.isArray(requestFields)) {
          setEnabledOptionalFields(new Set(requestFields));
        } else if (investee?.report_fields) {
          // Frequency-based config (jsonb object) or legacy flat array
          const rf = investee.report_fields;
          const freq = investee.report_frequency || "monthly";
          if (typeof rf === "object" && !Array.isArray(rf) && rf[freq]) {
            setEnabledOptionalFields(new Set(rf[freq]));
          } else if (Array.isArray(rf)) {
            setEnabledOptionalFields(new Set(rf));
          }
        }
        
        // Use the requested report period, fallback to current month if not set
        if (data.report_period) {
          setReportPeriod(data.report_period);
        } else {
          const now = new Date();
          setReportPeriod(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
        }

        // Fetch previous report data (cumulative revenue and cash balance)
        if (investee?.id) {
          const { data: reportsData } = await supabase
            .from("shareholder_reports")
            .select("cumulative_revenue, cash_balance, monthly_revenue, fixed_costs, variable_costs")
            .eq("investee_id", investee.id)
            .order("report_period", { ascending: false })
            .limit(1);
          
          if (reportsData && reportsData.length > 0) {
            const prevCash = reportsData[0].cash_balance || 0;
            setPreviousCumulativeRevenue(reportsData[0].cumulative_revenue || 0);
            setPreviousCashBalance(prevCash);
            setIsFirstReport(false);
            // Set default cash_balance calculated from previous data
            // Will be updated when user changes revenue/costs
            setFormData(prev => ({ ...prev, cash_balance: String(prevCash) }));
          } else {
            setIsFirstReport(true);
          }
        }
        
        setStatus("valid");
      } catch {
        setStatus("invalid");
      }
    }

    validateToken();
  }, [token]);

  const handleInputChange = (field: keyof ReportFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouchedFields((prev) => new Set(prev).add(field));
  };

  const requiredFields = getRequiredFields(isFirstReport, enabledOptionalFields);

  const getMissingRequiredFields = (): string[] => {
    return requiredFields
      .filter(({ key }) => {
        const value = formData[key];
        if (typeof value === "string") {
          return !value.trim();
        }
        return !value;
      })
      .map(({ label }) => label);
  };

  const isRequiredFieldsFilled = () => {
    return getMissingRequiredFields().length === 0;
  };

  const isFieldInvalid = (field: RequiredField): boolean => {
    if (!showValidationErrors && !touchedFields.has(field)) return false;
    const value = formData[field];
    if (typeof value === "string") {
      return !value.trim();
    }
    return !value;
  };

  // Calculate cumulative revenue automatically
  const calculatedCumulativeRevenue = previousCumulativeRevenue + (parseInt(formData.monthly_revenue) || 0);

  // Calculate default cash balance for non-first reports
  // Formula: previous cash balance + this month revenue - fixed costs - variable costs
  const defaultCashBalance = (previousCashBalance || 0) + (parseInt(formData.monthly_revenue) || 0) - (parseInt(formData.fixed_costs) || 0) - (parseInt(formData.variable_costs) || 0);

  // Update cash_balance default when revenue/costs change (only if user hasn't manually edited it)
  const hasTouchedCashBalance = touchedFields.has("cash_balance");
  useEffect(() => {
    if (!isFirstReport && !hasTouchedCashBalance) {
      setFormData(prev => ({ ...prev, cash_balance: String(defaultCashBalance) }));
    }
  }, [formData.monthly_revenue, formData.fixed_costs, formData.variable_costs, isFirstReport, defaultCashBalance, hasTouchedCashBalance]);

  // Actual cash balance to submit (user input value)
  const finalCashBalance = parseInt(formData.cash_balance) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationErrors(true);

    if (!isRequiredFieldsFilled()) {
      toast({
        title: "필수 항목 누락",
        description: `다음 항목을 입력해주세요: ${getMissingRequiredFields().join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setStatus("submitting");

    try {
      const { data, error } = await supabase.rpc("submit_shareholder_report", {
        p_request_token: token!,
        p_report_period: reportPeriod,
        p_monthly_summary: formData.monthly_summary,
        p_problems_risks: formData.problems_risks,
        p_next_month_decisions: formData.next_month_decisions,
        p_shareholder_input_needed: formData.shareholder_input_needed,
        p_monthly_revenue: parseInt(formData.monthly_revenue) || 0,
        p_cumulative_revenue: calculatedCumulativeRevenue,
        p_fixed_costs: parseInt(formData.fixed_costs) || 0,
        p_variable_costs: parseInt(formData.variable_costs) || 0,
        p_cash_balance: finalCashBalance,
        p_runway_months: parseInt(formData.runway_months) || 0,
        p_employee_count_change: parseInt(formData.employee_count_change) || 0,
        p_contract_count: formData.contract_count ? parseInt(formData.contract_count) : null,
        p_paid_customer_count: formData.paid_customer_count ? parseInt(formData.paid_customer_count) : null,
        p_average_contract_value: formData.average_contract_value ? parseInt(formData.average_contract_value) : null,
        p_mau: formData.mau ? parseInt(formData.mau) : null,
        p_dau: formData.dau ? parseInt(formData.dau) : null,
        p_conversion_rate: formData.conversion_rate ? parseFloat(formData.conversion_rate) : null,
        p_cac: formData.cac ? parseInt(formData.cac) : null,
      });

      const result = data as { success: boolean; error?: string };

      if (!result.success) {
        throw new Error(result.error || "제출에 실패했습니다");
      }

      setStatus("success");
    } catch (error: any) {
      toast({
        title: "제출 실패",
        description: error.message,
        variant: "destructive",
      });
      setStatus("valid");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md animate-fade-in">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">요청을 확인하고 있습니다...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h2 className="text-xl font-semibold">유효하지 않은 요청입니다</h2>
            <p className="text-muted-foreground">
              요청 링크가 올바르지 않습니다. 이메일의 링크를 다시 확인해주세요.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500" />
            <h2 className="text-xl font-semibold">요청이 만료되었습니다</h2>
            <p className="text-muted-foreground">
              보고서 작성 요청이 만료되었습니다. 투자사에 새로운 요청을 요청해주세요.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "completed" || status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <h2 className="text-xl font-semibold">
              {status === "success" ? "보고서 제출 완료!" : "이미 제출된 보고서입니다"}
            </h2>
            <p className="text-muted-foreground">
              {companyName && `${companyName}의 `}주주보고서가 정상적으로 제출되었습니다.
              <br />
              감사합니다.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Card className="animate-fade-in border-border shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-semibold">
                  {companyName} 주주보고서 작성
                </CardTitle>
              </div>
              <span className="rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {formatReportPeriod(reportPeriod)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Required Fields Section */}
              <div className="space-y-6">

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthly_summary">
                      이번 달 한 줄 요약 <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="monthly_summary"
                      placeholder="이번 달 주요 성과 또는 상황을 한 줄로 요약해주세요"
                      value={formData.monthly_summary}
                      onChange={(e) => handleInputChange("monthly_summary", e.target.value)}
                      className={`min-h-[80px] ${isFieldInvalid("monthly_summary") ? "border-destructive" : ""}`}
                    />
                    {isFieldInvalid("monthly_summary") && (
                      <p className="text-xs text-destructive">필수 항목입니다</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="problems_risks">
                      문제/리스크 <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="problems_risks"
                      placeholder="현재 직면한 문제점이나 리스크를 작성해주세요"
                      value={formData.problems_risks}
                      onChange={(e) => handleInputChange("problems_risks", e.target.value)}
                      className={`min-h-[80px] ${isFieldInvalid("problems_risks") ? "border-destructive" : ""}`}
                    />
                    {isFieldInvalid("problems_risks") && (
                      <p className="text-xs text-destructive">필수 항목입니다</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="next_month_decisions">
                      다음 달 중요한 의사결정 포인트 <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="next_month_decisions"
                      placeholder="다음 달에 결정해야 할 중요 사안을 작성해주세요"
                      value={formData.next_month_decisions}
                      onChange={(e) => handleInputChange("next_month_decisions", e.target.value)}
                      className={`min-h-[80px] ${isFieldInvalid("next_month_decisions") ? "border-destructive" : ""}`}
                    />
                    {isFieldInvalid("next_month_decisions") && (
                      <p className="text-xs text-destructive">필수 항목입니다</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shareholder_input_needed">
                      주주 의견이 필요한 사안 <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="shareholder_input_needed"
                      placeholder="주주들의 의견이나 조언이 필요한 사안을 작성해주세요"
                      value={formData.shareholder_input_needed}
                      onChange={(e) => handleInputChange("shareholder_input_needed", e.target.value)}
                      className={`min-h-[80px] ${isFieldInvalid("shareholder_input_needed") ? "border-destructive" : ""}`}
                    />
                    {isFieldInvalid("shareholder_input_needed") && (
                      <p className="text-xs text-destructive">필수 항목입니다</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="monthly_revenue">
                      월 매출 (원) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="monthly_revenue"
                      type="number"
                      placeholder="0"
                      value={formData.monthly_revenue}
                      onChange={(e) => handleInputChange("monthly_revenue", e.target.value)}
                      className={isFieldInvalid("monthly_revenue") ? "border-destructive" : ""}
                    />
                    {isFieldInvalid("monthly_revenue") && (
                      <p className="text-xs text-destructive">필수 항목입니다</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cumulative_revenue">누적 매출 (원)</Label>
                    <Input
                      id="cumulative_revenue"
                      type="number"
                      value={calculatedCumulativeRevenue}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">자동 계산됩니다</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fixed_costs">
                      고정비 (원) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fixed_costs"
                      type="number"
                      placeholder="0"
                      value={formData.fixed_costs}
                      onChange={(e) => handleInputChange("fixed_costs", e.target.value)}
                      className={isFieldInvalid("fixed_costs") ? "border-destructive" : ""}
                    />
                    {isFieldInvalid("fixed_costs") && (
                      <p className="text-xs text-destructive">필수 항목입니다</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="variable_costs">
                      변동비 (원) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="variable_costs"
                      type="number"
                      placeholder="0"
                      value={formData.variable_costs}
                      onChange={(e) => handleInputChange("variable_costs", e.target.value)}
                      className={isFieldInvalid("variable_costs") ? "border-destructive" : ""}
                    />
                    {isFieldInvalid("variable_costs") && (
                      <p className="text-xs text-destructive">필수 항목입니다</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cash_balance">
                      현금 잔고 (원) {isFirstReport && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      id="cash_balance"
                      type="number"
                      placeholder="0"
                      value={formData.cash_balance}
                      onChange={(e) => handleInputChange("cash_balance", e.target.value)}
                      className={isFieldInvalid("cash_balance") ? "border-destructive" : ""}
                    />
                    {isFieldInvalid("cash_balance") && (
                      <p className="text-xs text-destructive">필수 항목입니다</p>
                    )}
                    {isFirstReport ? (
                      <p className="text-xs text-muted-foreground">첫 보고서에서는 직접 입력해주세요</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        기본값: 전달 잔고({previousCashBalance?.toLocaleString()}원) + 월 매출 - 고정비 - 변동비
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="runway_months">
                      Runway (개월) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="runway_months"
                      type="number"
                      placeholder="0"
                      value={formData.runway_months}
                      onChange={(e) => handleInputChange("runway_months", e.target.value)}
                      className={isFieldInvalid("runway_months") ? "border-destructive" : ""}
                    />
                    {isFieldInvalid("runway_months") && (
                      <p className="text-xs text-destructive">필수 항목입니다</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employee_count_change">
                      인원 수 변화 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="employee_count_change"
                      type="number"
                      placeholder="0 (증가: +, 감소: -)"
                      value={formData.employee_count_change}
                      onChange={(e) => handleInputChange("employee_count_change", e.target.value)}
                      className={isFieldInvalid("employee_count_change") ? "border-destructive" : ""}
                    />
                    {isFieldInvalid("employee_count_change") && (
                      <p className="text-xs text-destructive">필수 항목입니다</p>
                    )}
                  </div>
                </div>
              </div>

              {/* KPI Fields Section - only enabled fields, all required */}
              {enabledOptionalFields.size > 0 && (
              <div className="space-y-6">

                <div className="grid gap-4 sm:grid-cols-2">
                  {enabledOptionalFields.has("contract_count") && (
                  <div className="space-y-2">
                    <Label htmlFor="contract_count">계약 수 <span className="text-destructive">*</span></Label>
                    <Input
                      id="contract_count"
                      type="number"
                      placeholder="0"
                      value={formData.contract_count}
                      onChange={(e) => handleInputChange("contract_count", e.target.value)}
                      className={isFieldInvalid("contract_count") ? "border-destructive" : ""}
                    />
                    {isFieldInvalid("contract_count") && <p className="text-xs text-destructive">필수 항목입니다</p>}
                  </div>
                  )}

                  {enabledOptionalFields.has("paid_customer_count") && (
                  <div className="space-y-2">
                    <Label htmlFor="paid_customer_count">유료 고객 수 <span className="text-destructive">*</span></Label>
                    <Input
                      id="paid_customer_count"
                      type="number"
                      placeholder="0"
                      value={formData.paid_customer_count}
                      onChange={(e) => handleInputChange("paid_customer_count", e.target.value)}
                      className={isFieldInvalid("paid_customer_count") ? "border-destructive" : ""}
                    />
                    {isFieldInvalid("paid_customer_count") && <p className="text-xs text-destructive">필수 항목입니다</p>}
                  </div>
                  )}

                  {enabledOptionalFields.has("average_contract_value") && (
                  <div className="space-y-2">
                    <Label htmlFor="average_contract_value">평균 계약 단가 (원) <span className="text-destructive">*</span></Label>
                    <Input
                      id="average_contract_value"
                      type="number"
                      placeholder="0"
                      value={formData.average_contract_value}
                      onChange={(e) => handleInputChange("average_contract_value", e.target.value)}
                      className={isFieldInvalid("average_contract_value") ? "border-destructive" : ""}
                    />
                    {isFieldInvalid("average_contract_value") && <p className="text-xs text-destructive">필수 항목입니다</p>}
                  </div>
                  )}

                  {enabledOptionalFields.has("mau") && (
                  <div className="space-y-2">
                    <Label htmlFor="mau">MAU <span className="text-destructive">*</span></Label>
                    <Input
                      id="mau"
                      type="number"
                      placeholder="0"
                      value={formData.mau}
                      onChange={(e) => handleInputChange("mau", e.target.value)}
                      className={isFieldInvalid("mau") ? "border-destructive" : ""}
                    />
                    {isFieldInvalid("mau") && <p className="text-xs text-destructive">필수 항목입니다</p>}
                  </div>
                  )}

                  {enabledOptionalFields.has("dau") && (
                  <div className="space-y-2">
                    <Label htmlFor="dau">DAU <span className="text-destructive">*</span></Label>
                    <Input
                      id="dau"
                      type="number"
                      placeholder="0"
                      value={formData.dau}
                      onChange={(e) => handleInputChange("dau", e.target.value)}
                      className={isFieldInvalid("dau") ? "border-destructive" : ""}
                    />
                    {isFieldInvalid("dau") && <p className="text-xs text-destructive">필수 항목입니다</p>}
                  </div>
                  )}

                  {enabledOptionalFields.has("conversion_rate") && (
                  <div className="space-y-2">
                    <Label htmlFor="conversion_rate">전환율 (%) <span className="text-destructive">*</span></Label>
                    <Input
                      id="conversion_rate"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={formData.conversion_rate}
                      onChange={(e) => handleInputChange("conversion_rate", e.target.value)}
                      className={isFieldInvalid("conversion_rate") ? "border-destructive" : ""}
                    />
                    {isFieldInvalid("conversion_rate") && <p className="text-xs text-destructive">필수 항목입니다</p>}
                  </div>
                  )}

                  {enabledOptionalFields.has("cac") && (
                  <div className="space-y-2">
                    <Label htmlFor="cac">CAC (원) <span className="text-destructive">*</span></Label>
                    <Input
                      id="cac"
                      type="number"
                      placeholder="0"
                      value={formData.cac}
                      onChange={(e) => handleInputChange("cac", e.target.value)}
                      className={isFieldInvalid("cac") ? "border-destructive" : ""}
                    />
                    {isFieldInvalid("cac") && <p className="text-xs text-destructive">필수 항목입니다</p>}
                  </div>
                  )}
                </div>
              </div>
              )}

              <Button
                type="submit"
                disabled={!isRequiredFieldsFilled() || status === "submitting"}
                className="h-11 w-full rounded-lg"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    제출 중...
                  </>
                ) : (
                  "주주보고서 제출"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

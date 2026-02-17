import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ListFieldInput, type ListItem } from "@/components/reports/ListFieldInput";
import { FIELD_DEF_MAP, REPORT_FIELD_CATEGORIES, type ReportFieldDef } from "@/lib/report-fields";

const PROBLEMS_RISKS_CATEGORIES = ["제품", "시장", "재무", "인사", "기술", "법률/규제", "기타"];
const CURRENT_STATUS_CATEGORIES = ["제품", "시장", "재무", "인사", "기술", "기타"];

// Legacy column-based fields (not stored in metrics_data)
const LEGACY_COLUMN_FIELDS = new Set([
  "contract_count", "paid_customer_count", "average_contract_value",
  "mau", "dau", "conversion_rate", "cac",
  "arppu", "mrr", "arr",
  "remaining_gov_subsidy", "total_shares_issued", "latest_price_per_share",
]);

type FormData = Record<string, string>;

const BASE_REQUIRED_KEYS = [
  "monthly_summary", "next_month_decisions", "shareholder_input_needed",
  "monthly_revenue", "fixed_costs", "variable_costs", "runway_months", "employee_count_change",
];

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
  const [formData, setFormData] = useState<FormData>({});
  const [investeeId, setInvesteeId] = useState<string>("");
  const [previousCumulativeRevenue, setPreviousCumulativeRevenue] = useState<number>(0);
  const [previousCashBalance, setPreviousCashBalance] = useState<number | null>(null);
  const [isFirstReport, setIsFirstReport] = useState<boolean>(true);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [enabledOptionalFields, setEnabledOptionalFields] = useState<Set<string>>(new Set());

  const [problemsRisksList, setProblemsRisksList] = useState<ListItem[]>([]);
  const [currentStatusList, setCurrentStatusList] = useState<ListItem[]>([]);

  useEffect(() => {
    async function validateToken() {
      if (!token) { setStatus("invalid"); return; }
      try {
        const { data, error } = await supabase
          .from("report_requests")
          .select(`*, investees (id, company_name, report_fields, report_frequency)`)
          .eq("request_token", token)
          .maybeSingle();

        if (error || !data) { setStatus("invalid"); return; }
        if (data.status === "completed") {
          setStatus("completed");
          setCompanyName((data.investees as any)?.company_name || "");
          return;
        }
        if (new Date(data.expires_at) < new Date()) { setStatus("expired"); return; }

        const investee = data.investees as any;
        setCompanyName(investee?.company_name || "");
        setInvesteeId(investee?.id || "");

        const requestFields = (data as any).report_fields;
        if (requestFields && Array.isArray(requestFields)) {
          setEnabledOptionalFields(new Set(requestFields));
        } else if (investee?.report_fields) {
          const rf = investee.report_fields;
          const freq = investee.report_frequency || "monthly";
          if (typeof rf === "object" && !Array.isArray(rf) && rf[freq]) {
            setEnabledOptionalFields(new Set(rf[freq]));
          } else if (Array.isArray(rf)) {
            setEnabledOptionalFields(new Set(rf));
          }
        }

        if (data.report_period) {
          setReportPeriod(data.report_period);
        } else {
          const now = new Date();
          setReportPeriod(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
        }

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouchedFields((prev) => new Set(prev).add(field));
  };

  // Build required fields list including enabled optional fields
  const requiredFields = useMemo(() => {
    const baseFields = [
      { key: "monthly_summary", label: "이번 달 한 줄 요약" },
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
    for (const fieldKey of enabledOptionalFields) {
      const def = FIELD_DEF_MAP[fieldKey];
      if (def) {
        baseFields.push({ key: fieldKey, label: def.label });
      }
    }
    return baseFields;
  }, [isFirstReport, enabledOptionalFields]);

  const getMissingRequiredFields = (): string[] => {
    const missing: string[] = [];
    for (const { key, label } of requiredFields) {
      const value = formData[key];
      if (!value || !value.trim()) missing.push(label);
    }
    if (problemsRisksList.length === 0) missing.push("문제/리스크");
    if (currentStatusList.length === 0) missing.push("현황");
    return missing;
  };

  const isRequiredFieldsFilled = () => getMissingRequiredFields().length === 0;

  const isFieldInvalid = (field: string): boolean => {
    if (!showValidationErrors && !touchedFields.has(field)) return false;
    const value = formData[field];
    return !value || !value.trim();
  };

  const calculatedCumulativeRevenue = previousCumulativeRevenue + (parseInt(formData.monthly_revenue) || 0);
  const defaultCashBalance = (previousCashBalance || 0) + (parseInt(formData.monthly_revenue) || 0) - (parseInt(formData.fixed_costs) || 0) - (parseInt(formData.variable_costs) || 0);
  const hasTouchedCashBalance = touchedFields.has("cash_balance");

  useEffect(() => {
    if (!isFirstReport && !hasTouchedCashBalance) {
      setFormData(prev => ({ ...prev, cash_balance: String(defaultCashBalance) }));
    }
  }, [formData.monthly_revenue, formData.fixed_costs, formData.variable_costs, isFirstReport, defaultCashBalance, hasTouchedCashBalance]);

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
      // Separate legacy column fields from extended fields
      const metricsData: Record<string, number | null> = {};
      for (const fieldKey of enabledOptionalFields) {
        const def = FIELD_DEF_MAP[fieldKey];
        if (def?.isExtended && formData[fieldKey]) {
          const val = def.step === "0.01" ? parseFloat(formData[fieldKey]) : parseInt(formData[fieldKey]);
          metricsData[fieldKey] = isNaN(val) ? null : val;
        }
      }

      const { data, error } = await supabase.rpc("submit_shareholder_report", {
        p_request_token: token!,
        p_report_period: reportPeriod,
        p_monthly_summary: formData.monthly_summary,
        p_problems_risks: JSON.stringify(problemsRisksList),
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
        p_arppu: formData.arppu ? parseInt(formData.arppu) : null,
        p_mrr: formData.mrr ? parseInt(formData.mrr) : null,
        p_arr: formData.arr ? parseInt(formData.arr) : null,
        p_remaining_gov_subsidy: formData.remaining_gov_subsidy ? parseInt(formData.remaining_gov_subsidy) : null,
        p_total_shares_issued: formData.total_shares_issued ? parseInt(formData.total_shares_issued) : null,
        p_latest_price_per_share: formData.latest_price_per_share ? parseInt(formData.latest_price_per_share) : null,
        p_current_status: JSON.stringify(currentStatusList),
        p_metrics_data: JSON.stringify(metricsData),
      } as any);

      const result = data as { success: boolean; error?: string };
      if (!result.success) throw new Error(result.error || "제출에 실패했습니다");
      setStatus("success");
    } catch (error: any) {
      toast({ title: "제출 실패", description: error.message, variant: "destructive" });
      setStatus("valid");
    }
  };

  // Render helper for optional numeric fields
  const renderOptionalField = (fieldKey: string) => {
    if (!enabledOptionalFields.has(fieldKey)) return null;
    const def = FIELD_DEF_MAP[fieldKey];
    if (!def) return null;
    const unitLabel = def.unit ? ` (${def.unit})` : "";
    return (
      <div className="space-y-2" key={fieldKey}>
        <Label htmlFor={fieldKey}>{def.label}{unitLabel} <span className="text-destructive">*</span></Label>
        <Input
          id={fieldKey}
          type="number"
          step={def.step}
          placeholder="0"
          value={formData[fieldKey] || ""}
          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
          className={isFieldInvalid(fieldKey) ? "border-destructive" : ""}
        />
        {isFieldInvalid(fieldKey) && <p className="text-xs text-destructive">필수 항목입니다</p>}
      </div>
    );
  };

  // Group enabled optional fields by category for rendering
  const enabledFieldsByCategory = useMemo(() => {
    return REPORT_FIELD_CATEGORIES
      .map(cat => ({
        ...cat,
        fields: cat.fields.filter(f => enabledOptionalFields.has(f.key)),
      }))
      .filter(cat => cat.fields.length > 0);
  }, [enabledOptionalFields]);

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
            <p className="text-muted-foreground">요청 링크가 올바르지 않습니다. 이메일의 링크를 다시 확인해주세요.</p>
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
            <p className="text-muted-foreground">보고서 작성 요청이 만료되었습니다. 투자사에 새로운 요청을 요청해주세요.</p>
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
              {companyName && `${companyName}의 `}주주보고서가 정상적으로 제출되었습니다.<br />감사합니다.
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
              {/* Text fields section */}
              <div className="space-y-6">
                <h3 className="text-base font-semibold text-foreground">
                  경영 현황 <span className="text-destructive">*</span>
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthly_summary">
                      이번 달 한 줄 요약 <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="monthly_summary"
                      placeholder="이번 달 주요 성과 또는 상황을 한 줄로 요약해주세요"
                      value={formData.monthly_summary || ""}
                      onChange={(e) => handleInputChange("monthly_summary", e.target.value)}
                      className={`min-h-[80px] ${isFieldInvalid("monthly_summary") ? "border-destructive" : ""}`}
                    />
                    {isFieldInvalid("monthly_summary") && <p className="text-xs text-destructive">필수 항목입니다</p>}
                  </div>

                  <ListFieldInput
                    label="문제/리스크"
                    required
                    items={problemsRisksList}
                    onChange={setProblemsRisksList}
                    categories={PROBLEMS_RISKS_CATEGORIES}
                    contentPlaceholder="문제점이나 리스크를 입력하세요"
                    isInvalid={showValidationErrors && problemsRisksList.length === 0}
                  />

                  <ListFieldInput
                    label="현황"
                    required
                    items={currentStatusList}
                    onChange={setCurrentStatusList}
                    categories={CURRENT_STATUS_CATEGORIES}
                    contentPlaceholder="현재 상황을 입력하세요"
                    isInvalid={showValidationErrors && currentStatusList.length === 0}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="next_month_decisions">
                      다음 달 중요한 의사결정 포인트 <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="next_month_decisions"
                      placeholder="다음 달에 결정해야 할 중요 사안을 작성해주세요"
                      value={formData.next_month_decisions || ""}
                      onChange={(e) => handleInputChange("next_month_decisions", e.target.value)}
                      className={`min-h-[80px] ${isFieldInvalid("next_month_decisions") ? "border-destructive" : ""}`}
                    />
                    {isFieldInvalid("next_month_decisions") && <p className="text-xs text-destructive">필수 항목입니다</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shareholder_input_needed">
                      주주 의견이 필요한 사안 <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="shareholder_input_needed"
                      placeholder="주주들의 의견이나 조언이 필요한 사안을 작성해주세요"
                      value={formData.shareholder_input_needed || ""}
                      onChange={(e) => handleInputChange("shareholder_input_needed", e.target.value)}
                      className={`min-h-[80px] ${isFieldInvalid("shareholder_input_needed") ? "border-destructive" : ""}`}
                    />
                    {isFieldInvalid("shareholder_input_needed") && <p className="text-xs text-destructive">필수 항목입니다</p>}
                  </div>
                </div>
              </div>

              {/* Core financial fields */}
              <div className="space-y-6">
                <h3 className="text-base font-semibold text-foreground">
                  기본 재무 지표 <span className="text-destructive">*</span>
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="monthly_revenue">월 매출 (원) <span className="text-destructive">*</span></Label>
                    <Input id="monthly_revenue" type="number" placeholder="0" value={formData.monthly_revenue || ""} onChange={(e) => handleInputChange("monthly_revenue", e.target.value)} className={isFieldInvalid("monthly_revenue") ? "border-destructive" : ""} />
                    {isFieldInvalid("monthly_revenue") && <p className="text-xs text-destructive">필수 항목입니다</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cumulative_revenue">누적 매출 (원)</Label>
                    <Input id="cumulative_revenue" type="number" value={calculatedCumulativeRevenue} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">자동 계산됩니다</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fixed_costs">고정비 (원) <span className="text-destructive">*</span></Label>
                    <Input id="fixed_costs" type="number" placeholder="0" value={formData.fixed_costs || ""} onChange={(e) => handleInputChange("fixed_costs", e.target.value)} className={isFieldInvalid("fixed_costs") ? "border-destructive" : ""} />
                    {isFieldInvalid("fixed_costs") && <p className="text-xs text-destructive">필수 항목입니다</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="variable_costs">변동비 (원) <span className="text-destructive">*</span></Label>
                    <Input id="variable_costs" type="number" placeholder="0" value={formData.variable_costs || ""} onChange={(e) => handleInputChange("variable_costs", e.target.value)} className={isFieldInvalid("variable_costs") ? "border-destructive" : ""} />
                    {isFieldInvalid("variable_costs") && <p className="text-xs text-destructive">필수 항목입니다</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cash_balance">현금 잔고 (원) {isFirstReport && <span className="text-destructive">*</span>}</Label>
                    <Input id="cash_balance" type="number" placeholder="0" value={formData.cash_balance || ""} onChange={(e) => handleInputChange("cash_balance", e.target.value)} className={isFieldInvalid("cash_balance") ? "border-destructive" : ""} />
                    {isFieldInvalid("cash_balance") && <p className="text-xs text-destructive">필수 항목입니다</p>}
                    {isFirstReport ? (
                      <p className="text-xs text-muted-foreground">첫 보고서에서는 직접 입력해주세요</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        기본값: 전달 잔고({previousCashBalance?.toLocaleString()}원) + 월 매출 - 고정비 - 변동비
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="runway_months">Runway (개월) <span className="text-destructive">*</span></Label>
                    <Input id="runway_months" type="number" placeholder="0" value={formData.runway_months || ""} onChange={(e) => handleInputChange("runway_months", e.target.value)} className={isFieldInvalid("runway_months") ? "border-destructive" : ""} />
                    {isFieldInvalid("runway_months") && <p className="text-xs text-destructive">필수 항목입니다</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employee_count_change">인원 수 변화 <span className="text-destructive">*</span></Label>
                    <Input id="employee_count_change" type="number" placeholder="0 (증가: +, 감소: -)" value={formData.employee_count_change || ""} onChange={(e) => handleInputChange("employee_count_change", e.target.value)} className={isFieldInvalid("employee_count_change") ? "border-destructive" : ""} />
                    {isFieldInvalid("employee_count_change") && <p className="text-xs text-destructive">필수 항목입니다</p>}
                  </div>
                </div>
              </div>

              {/* Optional fields by category */}
              {enabledFieldsByCategory.length > 0 && (
                <div className="space-y-6">
                  {enabledFieldsByCategory.map(cat => (
                    <div key={cat.key} className="space-y-4">
                      <h3 className="text-base font-semibold text-foreground">
                        {cat.label} <span className="text-destructive">*</span>
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {cat.fields.map(f => renderOptionalField(f.key))}
                      </div>
                    </div>
                  ))}
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

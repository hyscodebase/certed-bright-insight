import { Eye, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_FIELD_CATEGORIES, ALL_REPORT_FIELDS } from "@/constants/reportFields";

const PERCENT_FIELDS = new Set([
  "conversion_rate", "gross_margin", "operating_margin", "ebitda_margin",
  "net_margin", "payout_ratio", "dividend_yield", "major_shareholder_ratio",
  "foreign_ownership_ratio", "revenue_growth_rate", "debt_ratio", "current_ratio",
]);

const COUNT_FIELDS = new Set([
  "contract_count", "paid_customer_count", "mau", "dau",
  "floating_shares", "treasury_shares", "total_shares_issued",
  "employee_count_change",
]);

const getFieldUnit = (key: string): string => {
  if (PERCENT_FIELDS.has(key)) return "%";
  if (COUNT_FIELDS.has(key)) return "";
  if (key === "runway_months") return "개월";
  return "원";
};

interface ReportFormPreviewDialogProps {
  enabledFields: Set<string>;
  companyName?: string;
  frequencyLabel?: string;
}

export function ReportFormPreviewDialog({
  enabledFields,
  companyName = "피투자사",
  frequencyLabel = "월간",
}: ReportFormPreviewDialogProps) {
  const enabledCategories = REPORT_FIELD_CATEGORIES
    .map(cat => ({
      ...cat,
      enabledFields: cat.fields.filter(f => enabledFields.has(f.key)),
    }))
    .filter(cat => cat.enabledFields.length > 0);

  const renderReadonlyNumeric = (key: string, label: string, unit: string) => (
    <div className="space-y-1.5" key={key}>
      <Label className="text-xs text-muted-foreground">
        {label}{unit ? ` (${unit})` : ""} <span className="text-destructive">*</span>
      </Label>
      <Input type="number" placeholder="0" disabled className="h-8 bg-muted text-sm" />
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="gap-1.5">
          <Eye className="h-3.5 w-3.5" />
          미리보기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <DialogTitle className="text-lg">
              {companyName} 주주보고서 미리보기
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            현재 <span className="font-medium text-foreground">{frequencyLabel}</span> 설정 기준으로 피투자사에게 보여질 보고서 양식입니다. (읽기 전용)
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* ── 서술형 필수 항목 ── */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              필수 항목 <span className="text-destructive">*</span>
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">이번 달 한 줄 요약 <span className="text-destructive">*</span></Label>
              <Textarea disabled placeholder="이번 달 주요 성과 또는 상황을 한 줄로 요약해주세요" className="min-h-[60px] bg-muted text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">문제/리스크 <span className="text-destructive">*</span></Label>
              <div className="rounded-md border border-dashed border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                카테고리 선택 + 내용 입력 (리스트 형식)
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">현황 <span className="text-destructive">*</span></Label>
              <div className="rounded-md border border-dashed border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                카테고리 선택 + 내용 입력 (리스트 형식)
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">다음 달 중요한 의사결정 포인트 <span className="text-destructive">*</span></Label>
              <Textarea disabled placeholder="다음 달에 결정해야 할 중요 사안을 작성해주세요" className="min-h-[60px] bg-muted text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">주주 의견이 필요한 사안 <span className="text-destructive">*</span></Label>
              <Textarea disabled placeholder="주주들의 의견이나 조언이 필요한 사안을 작성해주세요" className="min-h-[60px] bg-muted text-sm" />
            </div>
          </div>

          {/* ── 기본 재무 항목 ── */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">기본 재무</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {renderReadonlyNumeric("monthly_revenue", "월 매출", "원")}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">누적 매출 (원)</Label>
                <Input type="number" placeholder="자동 계산" disabled className="h-8 bg-muted text-sm" />
              </div>
              {renderReadonlyNumeric("fixed_costs", "고정비", "원")}
              {renderReadonlyNumeric("variable_costs", "변동비", "원")}
              {renderReadonlyNumeric("cash_balance", "현금 잔고", "원")}
              {renderReadonlyNumeric("runway_months", "Runway", "개월")}
              {renderReadonlyNumeric("employee_count_change", "인원 수 변화", "")}
            </div>
          </div>

          {/* ── 선택 KPI 항목 ── */}
          {enabledCategories.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">KPI 항목</h3>
              {enabledCategories.map(cat => (
                <div key={cat.category} className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">{cat.category}</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {cat.enabledFields.map(field =>
                      renderReadonlyNumeric(field.key, field.label, getFieldUnit(field.key))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {enabledCategories.length === 0 && (
            <p className="text-sm text-muted-foreground">선택된 KPI 항목이 없습니다.</p>
          )}

          {/* ── 제출 버튼 (비활성) ── */}
          <Button disabled className="h-10 w-full rounded-lg">
            주주보고서 제출
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

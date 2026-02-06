import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ShareholderReport } from "@/hooks/useShareholderReports";

interface ReportDetailDialogProps {
  report: ShareholderReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatCurrency(amount: number | null): string {
  if (amount === null || amount === 0) return "0 원";
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억 원`;
  }
  if (amount >= 10000) {
    return `${Math.round(amount / 10000).toLocaleString()}만 원`;
  }
  return `${amount.toLocaleString()} 원`;
}

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  return `${year}년 ${month}월`;
}

export function ReportDetailDialog({ report, open, onOpenChange }: ReportDetailDialogProps) {
  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {formatPeriod(report.report_period)} 주주보고서
            <Badge variant="secondary" className="text-xs">
              {report.created_at.split("T")[0].replace(/-/g, ".")} 작성
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-primary">주요 내용</h3>
            
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-4">
                <span className="text-xs font-medium text-muted-foreground">이번 달 한 줄 요약</span>
                <p className="mt-1 text-sm">{report.monthly_summary}</p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <span className="text-xs font-medium text-muted-foreground">문제/리스크</span>
                <p className="mt-1 text-sm">{report.problems_risks}</p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <span className="text-xs font-medium text-muted-foreground">다음 달 중요한 의사결정 포인트</span>
                <p className="mt-1 text-sm">{report.next_month_decisions}</p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <span className="text-xs font-medium text-muted-foreground">주주 의견이 필요한 사안</span>
                <p className="mt-1 text-sm">{report.shareholder_input_needed}</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Financial Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-primary">재무 현황</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <InfoCard label="월 매출" value={formatCurrency(report.monthly_revenue)} />
              <InfoCard label="누적 매출" value={formatCurrency(report.cumulative_revenue)} />
              <InfoCard label="고정비" value={formatCurrency(report.fixed_costs)} />
              <InfoCard label="변동비" value={formatCurrency(report.variable_costs)} />
              <InfoCard label="현금 잔고" value={formatCurrency(report.cash_balance)} highlight />
              <InfoCard label="런웨이" value={`${report.runway_months}개월`} highlight />
            </div>
          </section>

          <Separator />

          {/* HR Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-primary">인력 현황</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <InfoCard 
                label="인원 수 변화" 
                value={report.employee_count_change > 0 
                  ? `+${report.employee_count_change}명` 
                  : `${report.employee_count_change}명`
                }
                variant={report.employee_count_change > 0 ? "positive" : report.employee_count_change < 0 ? "negative" : "neutral"}
              />
            </div>
          </section>

          {/* Optional Metrics Section */}
          {(report.contract_count !== null || 
            report.paid_customer_count !== null || 
            report.average_contract_value !== null ||
            report.mau !== null ||
            report.dau !== null ||
            report.conversion_rate !== null ||
            report.cac !== null) && (
            <>
              <Separator />
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-primary">비즈니스 지표</h3>
                
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {report.contract_count !== null && (
                    <InfoCard label="계약 수" value={`${report.contract_count}건`} />
                  )}
                  {report.paid_customer_count !== null && (
                    <InfoCard label="유료 고객 수" value={`${report.paid_customer_count}명`} />
                  )}
                  {report.average_contract_value !== null && (
                    <InfoCard label="평균 계약 단가" value={formatCurrency(report.average_contract_value)} />
                  )}
                  {report.mau !== null && (
                    <InfoCard label="MAU" value={report.mau.toLocaleString()} />
                  )}
                  {report.dau !== null && (
                    <InfoCard label="DAU" value={report.dau.toLocaleString()} />
                  )}
                  {report.conversion_rate !== null && (
                    <InfoCard label="전환율" value={`${report.conversion_rate}%`} />
                  )}
                  {report.cac !== null && (
                    <InfoCard label="CAC" value={formatCurrency(report.cac)} />
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoCard({ 
  label, 
  value, 
  highlight = false,
  variant = "neutral"
}: { 
  label: string; 
  value: string; 
  highlight?: boolean;
  variant?: "positive" | "negative" | "neutral";
}) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-primary/30 bg-primary/5" : "border-border bg-background"}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <p className={`mt-0.5 text-sm font-semibold ${
        variant === "positive" ? "text-chart-secondary" : 
        variant === "negative" ? "text-destructive" : 
        "text-foreground"
      }`}>
        {value}
      </p>
    </div>
  );
}

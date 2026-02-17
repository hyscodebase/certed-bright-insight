import { ChevronLeft, Users, DollarSign, FileText, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import type { ShareholderReport } from "@/hooks/useShareholderReports";

interface ReportDetailDialogProps {
  report: ShareholderReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName?: string;
}

function formatCurrencyShort(amount: number | null): string {
  if (amount === null || amount === 0) return "0원";
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(0)}억 원`;
  }
  if (amount >= 10000) {
    return `${Math.round(amount / 10000).toLocaleString()}만 원`;
  }
  return `${amount.toLocaleString()}원`;
}

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  return `${year}년 ${parseInt(month)}월`;
}

interface ListItem {
  category: string;
  content: string;
}

function parseJsonList(value: any): ListItem[] {
  let arr: any[] = [];
  if (Array.isArray(value)) {
    arr = value;
  } else if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) arr = parsed;
      else return value ? [{ category: "기타", content: value }] : [];
    } catch {
      return value ? [{ category: "기타", content: value }] : [];
    }
  }
  // Handle both old string[] and new {category, content}[] formats
  return arr.map((item) =>
    typeof item === "string"
      ? { category: "기타", content: item }
      : { category: item.category || "기타", content: item.content || String(item) }
  );
}

function groupByCategory(items: ListItem[]): Record<string, string[]> {
  return items.reduce<Record<string, string[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item.content);
    return acc;
  }, {});
}

export function ReportDetailDialog({ report, open, onOpenChange, companyName }: ReportDetailDialogProps) {
  if (!report) return null;

  const totalExpense = report.fixed_costs + report.variable_costs;
  const month = report.report_period.split("-")[1] + "월";
  
  const mauChartData = report.mau !== null ? [{ month, value: report.mau }] : [];
  const dauChartData = report.dau !== null ? [{ month, value: report.dau }] : [];
  const paidCustomerChartData = report.paid_customer_count !== null ? [{ month, value: report.paid_customer_count }] : [];
  const revenueChartData = [{ month, value: report.monthly_revenue / 10000 }];

  const problemsRisks = parseJsonList(report.problems_risks);
  const currentStatus = parseJsonList(report.current_status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold">
              {companyName || "피투자사"} {formatPeriod(report.report_period)}
            </h1>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Monthly Customer Metrics */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">월간 고객지표</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible defaultValue="user-metrics" className="w-full">
                <AccordionItem value="user-metrics" className="border-b-0">
                  <AccordionTrigger className="py-3 text-sm font-semibold text-primary hover:no-underline">
                    회원 지표
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <MetricCard label="MAU (월간 활성 사용자)" value={report.mau !== null ? report.mau.toLocaleString() : "-"} unit="명" chartData={mauChartData} chartUnit="명" />
                      <MetricCard label="DAU (일간 활성 사용자)" value={report.dau !== null ? report.dau.toLocaleString() : "-"} unit="명" chartData={dauChartData} chartUnit="명" />
                      <MetricCard label="유료 고객 수" value={report.paid_customer_count !== null ? report.paid_customer_count.toLocaleString() : "-"} unit="명" chartData={paidCustomerChartData} chartUnit="명" />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="revenue-metrics" className="border-b-0">
                  <AccordionTrigger className="py-3 text-sm font-semibold text-primary hover:no-underline">
                    수익 지표
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <MetricCard label="계약 수" value={report.contract_count !== null ? report.contract_count.toLocaleString() : "-"} unit="건" chartData={report.contract_count !== null ? [{ month, value: report.contract_count }] : []} chartUnit="건" />
                      <MetricCard label="월 매출" value={formatCurrencyShort(report.monthly_revenue)} unit="" chartData={revenueChartData} chartUnit="만원" />
                      <MetricCard label="평균 계약 단가" value={report.average_contract_value !== null ? formatCurrencyShort(report.average_contract_value) : "-"} unit="" chartData={report.average_contract_value !== null ? [{ month, value: report.average_contract_value / 10000 }] : []} chartUnit="만원" />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="acquisition-metrics" className="border-b-0">
                  <AccordionTrigger className="py-3 text-sm font-semibold text-primary hover:no-underline">
                    획득 지표
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <MetricCard label="전환율" value={report.conversion_rate !== null ? `${report.conversion_rate}%` : "-"} unit="" chartData={report.conversion_rate !== null ? [{ month, value: report.conversion_rate }] : []} chartUnit="%" />
                      <MetricCard label="CAC (고객 획득 비용)" value={report.cac !== null ? formatCurrencyShort(report.cac) : "-"} unit="" chartData={report.cac !== null ? [{ month, value: report.cac / 10000 }] : []} chartUnit="만원" />
                      <MetricCard label="ARPPU" value={report.arppu !== null ? formatCurrencyShort(report.arppu) : "-"} unit="" chartData={report.arppu !== null ? [{ month, value: report.arppu / 10000 }] : []} chartUnit="만원" />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="saas-metrics" className="border-b-0">
                  <AccordionTrigger className="py-3 text-sm font-semibold text-primary hover:no-underline">
                    SaaS 지표
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <MetricCard label="MRR (월간 반복 매출)" value={report.mrr !== null ? formatCurrencyShort(report.mrr) : "-"} unit="" chartData={report.mrr !== null ? [{ month, value: report.mrr / 10000 }] : []} chartUnit="만원" />
                      <MetricCard label="ARR (연간 반복 매출)" value={report.arr !== null ? formatCurrencyShort(report.arr) : "-"} unit="" chartData={report.arr !== null ? [{ month, value: report.arr / 10000 }] : []} chartUnit="만원" />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">재무 현황</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <span className="text-sm text-muted-foreground">현금 잔고</span>
                  <p className="mt-1 text-xl font-bold text-primary">{formatCurrencyShort(report.cash_balance)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <span className="text-sm text-muted-foreground">월 매출</span>
                  <p className="mt-1 text-xl font-bold text-primary">{formatCurrencyShort(report.monthly_revenue)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <span className="text-sm text-muted-foreground">누적 매출</span>
                  <p className="mt-1 text-xl font-bold text-primary">{formatCurrencyShort(report.cumulative_revenue)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <span className="text-sm text-muted-foreground">Runway</span>
                  <p className="mt-1 text-xl font-bold text-primary">{report.runway_months}개월</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <span className="text-sm text-muted-foreground">고정비</span>
                  <p className="mt-1 text-lg font-semibold text-destructive">{formatCurrencyShort(report.fixed_costs)}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">변동비</span>
                  <p className="mt-1 text-lg font-semibold text-destructive">{formatCurrencyShort(report.variable_costs)}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">총 지출</span>
                  <p className="mt-1 text-lg font-semibold text-destructive">{formatCurrencyShort(totalExpense)}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <span className="text-sm text-muted-foreground">인원 수 변화</span>
                  <p className={`mt-1 text-lg font-semibold ${report.employee_count_change >= 0 ? "text-primary" : "text-destructive"}`}>
                    {report.employee_count_change > 0 ? "+" : ""}{report.employee_count_change}명
                  </p>
                </div>
                {report.remaining_gov_subsidy !== null && (
                  <div>
                    <span className="text-sm text-muted-foreground">잔여 정부지원금</span>
                    <p className="mt-1 text-lg font-semibold text-primary">{formatCurrencyShort(report.remaining_gov_subsidy)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Investment Metrics */}
          {(report.total_shares_issued !== null || report.latest_price_per_share !== null) && (
            <Card className="border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base font-semibold">투자 지표</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {report.total_shares_issued !== null && (
                    <div className="rounded-lg bg-muted/50 p-4">
                      <span className="text-sm text-muted-foreground">총발행주식수</span>
                      <p className="mt-1 text-xl font-bold text-primary">{report.total_shares_issued.toLocaleString()}주</p>
                    </div>
                  )}
                  {report.latest_price_per_share !== null && (
                    <div className="rounded-lg bg-muted/50 p-4">
                      <span className="text-sm text-muted-foreground">최신 주당가격</span>
                      <p className="mt-1 text-xl font-bold text-primary">{formatCurrencyShort(report.latest_price_per_share)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Monthly Key Issues */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">월간 주요 경영 현안 공유</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-primary">이번 달 요약</h4>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{report.monthly_summary || "등록된 내용이 없습니다."}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-primary">현황</h4>
                  {currentStatus.length > 0 ? (
                    <div className="mt-2 space-y-3">
                      {Object.entries(groupByCategory(currentStatus)).map(([cat, contents]) => (
                        <div key={cat}>
                          <span className="text-xs font-semibold text-muted-foreground">{cat}</span>
                          <ul className="mt-1 space-y-1">
                            {contents.map((c, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                <span className="whitespace-pre-wrap">{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">등록된 내용이 없습니다.</p>
                  )}
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-primary">문제/리스크</h4>
                  {problemsRisks.length > 0 ? (
                    <div className="mt-2 space-y-3">
                      {Object.entries(groupByCategory(problemsRisks)).map(([cat, contents]) => (
                        <div key={cat}>
                          <span className="text-xs font-semibold text-muted-foreground">{cat}</span>
                          <ul className="mt-1 space-y-1">
                            {contents.map((c, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="mt-1.5 text-muted-foreground">•</span>
                                <span className="whitespace-pre-wrap">{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">등록된 내용이 없습니다.</p>
                  )}
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-primary">다음 달 중요한 의사결정 포인트</h4>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{report.next_month_decisions || "등록된 내용이 없습니다."}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold text-primary">주주 의견이 필요한 사안</h4>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{report.shareholder_input_needed || "등록된 내용이 없습니다."}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetricCard({
  label,
  value,
  unit,
  chartData,
  chartUnit,
}: {
  label: string;
  value: string;
  unit: string;
  chartData: Array<{ month: string; value: number }>;
  chartUnit: string;
}) {
  return (
    <div>
      <span className="text-sm text-muted-foreground">{label}</span>
      <p className="mt-1 text-2xl font-bold text-primary">
        {value} <span className="text-base font-normal">{unit}</span>
      </p>
      <p className="mt-2 text-xs text-muted-foreground">단위 : {chartUnit}</p>
      <div className="mt-2 h-24">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Bar dataKey="value" fill="hsl(var(--chart-primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            데이터 없음
          </div>
        )}
      </div>
    </div>
  );
}

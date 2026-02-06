import { ChevronLeft, FileDown, Users, DollarSign, Wallet, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import type { Investee } from "@/hooks/useInvestees";

interface ReportDetailDialogProps {
  report: ShareholderReport | null;
  company?: Investee | null;
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

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  return dateString.replace(/-/g, ".");
}

export function ReportDetailDialog({ report, company, open, onOpenChange }: ReportDetailDialogProps) {
  if (!report) return null;

  const today = new Date().toISOString().split("T")[0].replace(/-/g, ".");
  const totalExpense = report.fixed_costs + report.variable_costs;
  
  // 단일 보고서 데이터로 차트 생성
  const month = report.report_period.split("-")[1] + "월";
  
  const mauChartData = report.mau !== null ? [{ month, value: report.mau }] : [];
  const dauChartData = report.dau !== null ? [{ month, value: report.dau }] : [];
  const paidCustomerChartData = report.paid_customer_count !== null ? [{ month, value: report.paid_customer_count }] : [];
  const revenueChartData = [{ month, value: report.monthly_revenue / 10000 }];

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
              {company?.company_name || "피투자사"} {formatPeriod(report.report_period)}
            </h1>
          </div>
          <Button variant="default" size="sm" className="gap-2">
            <FileDown className="h-4 w-4" />
            PDF
          </Button>
        </div>

        <div className="space-y-6 p-6">
          {/* Company Info Grid */}
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-3">
                  <InfoRow label="산업" value={company?.industry || "정보 없음"} />
                  <InfoRow label="기업구분" value={company?.is_smb ? "중소기업" : "대기업"} />
                  <InfoRow label="자본금" value={formatCurrency(company?.capital || null)} subtext={`(${today} 기준)`} />
                  <InfoRow label="대표자" value={company?.representative || "정보 없음"} />
                  <InfoRow label="설립일" value={formatDate(company?.established_date || null)} />
                  <InfoRow label="직원수" value={`${company?.employee_count || 0}`} subtext={`(${today} 기준)`} />
                </div>
                {/* Right Column */}
                <div className="space-y-3">
                  <InfoRow label="입사자" value={`${company?.hire_count || 0} 명`} subtext="(최근 3 개월)" />
                  <InfoRow label="퇴사자" value={`${company?.resign_count || 0} 명`} subtext="(최근 3 개월)" />
                  <InfoRow label="투자단계" value={company?.investment_stage || "Seed"} />
                  <InfoRow label="투자액" value={formatCurrency(company?.total_investment || null)} />
                  <InfoRow label="평균연봉" value={company?.average_salary ? formatCurrency(company.average_salary) : "정보 없음"} />
                  <InfoRow label="주소" value={company?.address || "정보 없음"} />
                </div>
              </div>
            </CardContent>
          </Card>

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
                      {/* MAU */}
                      <MetricCard
                        label="MAU (월간 활성 사용자)"
                        value={report.mau !== null ? report.mau.toLocaleString() : "-"}
                        unit="명"
                        chartData={mauChartData}
                        chartUnit="명"
                      />
                      {/* DAU */}
                      <MetricCard
                        label="DAU (일간 활성 사용자)"
                        value={report.dau !== null ? report.dau.toLocaleString() : "-"}
                        unit="명"
                        chartData={dauChartData}
                        chartUnit="명"
                      />
                      {/* Paid Customers */}
                      <MetricCard
                        label="유료 고객 수"
                        value={report.paid_customer_count !== null ? report.paid_customer_count.toLocaleString() : "-"}
                        unit="명"
                        chartData={paidCustomerChartData}
                        chartUnit="명"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="revenue-metrics" className="border-b-0">
                  <AccordionTrigger className="py-3 text-sm font-semibold text-primary hover:no-underline">
                    수익 지표
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <MetricCard
                        label="계약 수"
                        value={report.contract_count !== null ? report.contract_count.toLocaleString() : "-"}
                        unit="건"
                        chartData={report.contract_count !== null ? [{ month, value: report.contract_count }] : []}
                        chartUnit="건"
                      />
                      <MetricCard
                        label="월 매출"
                        value={formatCurrencyShort(report.monthly_revenue)}
                        unit=""
                        chartData={revenueChartData}
                        chartUnit="만원"
                      />
                      <MetricCard
                        label="평균 계약 단가"
                        value={report.average_contract_value !== null ? formatCurrencyShort(report.average_contract_value) : "-"}
                        unit=""
                        chartData={report.average_contract_value !== null ? [{ month, value: report.average_contract_value / 10000 }] : []}
                        chartUnit="만원"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Cash Balance */}
                <div>
                  <span className="text-sm text-muted-foreground">월말 통장 잔액</span>
                  <p className="mt-1 text-xl font-bold text-primary">
                    총 {formatCurrencyShort(report.cash_balance)}
                  </p>
                  <Separator className="my-3" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{month} 투자금</span>
                      <span>0 원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{month} 지원금</span>
                      <span>0 원</span>
                    </div>
                  </div>
                </div>

                {/* Revenue */}
                <div>
                  <span className="text-sm text-muted-foreground">월 수입</span>
                  <p className="mt-1 text-xl font-bold text-primary">
                    총 {formatCurrencyShort(report.monthly_revenue)}
                  </p>
                </div>

                {/* Expenses */}
                <div>
                  <span className="text-sm text-muted-foreground">월 지출</span>
                  <p className="mt-1 text-xl font-bold text-destructive">
                    총 {formatCurrencyShort(totalExpense)}
                  </p>
                  <Separator className="my-3" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">고정비</span>
                      <span>{formatCurrencyShort(report.fixed_costs)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">변동비</span>
                      <span>{formatCurrencyShort(report.variable_costs)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Follow-up Investment & Grants (placeholder) */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">월간 후속투자 및 지원금</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="investment" className="border-b-0">
                  <AccordionTrigger className="py-3 text-sm font-semibold text-primary hover:no-underline">
                    후속 투자
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="pb-2 text-left font-medium">펀드명(투자사)</th>
                            <th className="pb-2 text-left font-medium">주식수</th>
                            <th className="pb-2 text-left font-medium">단가(원)</th>
                            <th className="pb-2 text-left font-medium">투자금(원)</th>
                            <th className="pb-2 text-left font-medium">PRE(원)</th>
                            <th className="pb-2 text-left font-medium">POST(원)</th>
                            <th className="pb-2 text-left font-medium">투자 단계</th>
                            <th className="pb-2 text-left font-medium">날짜</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={8} className="py-4 text-center text-muted-foreground">
                              등록된 후속 투자가 없습니다.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="grants" className="border-b-0">
                  <AccordionTrigger className="py-3 text-sm font-semibold text-primary hover:no-underline">
                    지원금
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="pb-2 text-left font-medium">주관 기관</th>
                            <th className="pb-2 text-left font-medium">프로그램명</th>
                            <th className="pb-2 text-left font-medium">지원금(원)</th>
                            <th className="pb-2 text-left font-medium">날짜</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-muted-foreground">
                              등록된 지원금이 없습니다.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Monthly Key Issues */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">월간 주요 경영 현안 공유</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible defaultValue="plans" className="w-full">
                <AccordionItem value="plans" className="border-b-0">
                  <AccordionTrigger className="py-3 text-sm font-semibold text-primary hover:no-underline">
                    월 주요 계획
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p className="whitespace-pre-wrap">{report.next_month_decisions || "등록된 내용이 없습니다."}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="summary" className="border-b-0">
                  <AccordionTrigger className="py-3 text-sm font-semibold text-primary hover:no-underline">
                    이번 달 요약
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p className="whitespace-pre-wrap">{report.monthly_summary || "등록된 내용이 없습니다."}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="issues" className="border-b-0">
                  <AccordionTrigger className="py-3 text-sm font-semibold text-primary hover:no-underline">
                    공유 사안
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">문제/리스크:</span>
                        <p className="mt-1 whitespace-pre-wrap">{report.problems_risks || "등록된 내용이 없습니다."}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">주주 의견 필요:</span>
                        <p className="mt-1 whitespace-pre-wrap">{report.shareholder_input_needed || "등록된 내용이 없습니다."}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
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
      <span className="text-sm font-medium">
        {value}
        {subtext && <span className="ml-1 text-xs text-muted-foreground">{subtext}</span>}
      </span>
    </div>
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

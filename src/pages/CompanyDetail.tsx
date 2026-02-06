import { Building2, TrendingUp, DollarSign, RefreshCw, FileText } from "lucide-react";
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

const companyInfo = {
  name: "지디피스튜디오",
  industry: "정보통신업 (IT)",
  type: "중소기업",
  capital: "1,823만 원",
  capitalDate: "2026.02.06 기준",
  ceo: "이유",
  established: "2022.02.22",
  employees: "0",
  employeesDate: "2026.02.06 기준",
  hired: "0 명",
  hiredPeriod: "최근 3 개월",
  resigned: "0 명",
  resignedPeriod: "최근 3 개월",
  investmentStage: "Seed",
  totalInvestment: "1억 4,000만 원",
  avgSalary: "정보 없음",
  address: "경기 성남시 분당구 대왕판교로645번길 12 (삼평동, 경기창조경제혁신센터), 8층 R07",
};

const burnRateData = [
  { month: "02월", value: 80 },
];

const capitalData = [
  { month: "02월", value: 18.23 },
];

const reports = [
  {
    id: "1",
    title: "지디피스튜디오 2026 1월",
    period: "2026년 02월",
    created: "2026.02.04",
  },
];

export default function CompanyDetail() {
  return (
    <DashboardLayout>
      <PageHeader title="기업상세 정보" showBack />

      {/* Company Info Card */}
      <Card className="mb-6 animate-fade-in border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">{companyInfo.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-4">
              <InfoRow label="산업" value={companyInfo.industry} />
              <InfoRow label="기업구분" value={companyInfo.type} />
              <InfoRow label="자본금" value={companyInfo.capital} subtext={companyInfo.capitalDate} />
              <InfoRow label="대표자" value={companyInfo.ceo} />
              <InfoRow label="설립일" value={companyInfo.established} />
              <InfoRow label="직원수" value={companyInfo.employees} subtext={companyInfo.employeesDate} />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <InfoRow label="입사자" value={companyInfo.hired} subtext={companyInfo.hiredPeriod} />
              <InfoRow label="퇴사자" value={companyInfo.resigned} subtext={companyInfo.resignedPeriod} />
              <InfoRow label="투자단계" value={companyInfo.investmentStage} />
              <InfoRow label="투자액" value={companyInfo.totalInvestment} />
              <InfoRow label="평균연봉" value={companyInfo.avgSalary} />
              <InfoRow label="주소" value={companyInfo.address} />
            </div>
          </div>
        </CardContent>
      </Card>

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
              <span className="text-lg font-semibold text-primary">자본금 증가 상태</span>
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
                    strokeDashoffset="88"
                    className="text-chart-secondary"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="rounded-full bg-chart-secondary/20 px-2 py-0.5 text-xs font-medium text-chart-secondary">
                    Cash Zero
                  </span>
                  <span className="mt-1 text-sm text-muted-foreground">자본금 증가</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-primary" />
                <span className="text-muted-foreground">자본금 | 1,823만 원</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-muted" />
                <span className="text-muted-foreground">번 레이트 | 0 원</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Burn Rate Card */}
        <Card className="animate-fade-in border-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">번 레이트</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <span className="text-lg font-semibold text-primary">자본금 증가</span>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">단위 : 십만원</p>
            
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={burnRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--chart-primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Capital Card */}
        <Card className="animate-fade-in border-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">자본금</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <span className="text-2xl font-bold text-primary">1,823만 원</span>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">단위 : 백만원</p>
            
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={capitalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-primary))", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shareholder Reports */}
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
                <TableHead className="w-[50%] pl-6 font-medium text-foreground">문서명</TableHead>
                <TableHead className="font-medium text-foreground">주주보고서 시기</TableHead>
                <TableHead className="font-medium text-foreground">작성일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="pl-6 font-medium">{report.title}</TableCell>
                  <TableCell>{report.period}</TableCell>
                  <TableCell>{report.created}</TableCell>
                </TableRow>
              ))}
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

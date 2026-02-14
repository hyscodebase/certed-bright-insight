import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Briefcase, Search, TrendingUp, DollarSign, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInvestees } from "@/hooks/useInvestees";
import {
  useFunds,
  useFundInvestees,
  useAddInvesteeToFund,
  useRemoveInvesteeFromFund,
} from "@/hooks/useFunds";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FREQUENCY_LABELS: Record<string, string> = {
  monthly: "월간",
  quarterly: "분기",
  semi_annual: "반기",
  annual: "연간",
};

function formatCurrency(amount: number | null | undefined): string {
  if (!amount) return "-";
  if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억`;
  if (amount >= 10000) return `${Math.round(amount / 10000).toLocaleString()}만`;
  return `${amount.toLocaleString()}`;
}

export default function FundDetail() {
  const { id: fundId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: funds } = useFunds();
  const { data: investees, isLoading: investeesLoading } = useInvestees();
  const { data: fundInvestees, isLoading: mappingLoading } = useFundInvestees(fundId);
  const addInvestee = useAddInvesteeToFund();
  const removeInvestee = useRemoveInvesteeFromFund();
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);

  const fund = funds?.find((f) => f.id === fundId);
  const assignedIds = useMemo(
    () => new Set(fundInvestees?.map((fi) => fi.investee_id) || []),
    [fundInvestees]
  );

  // Fetch latest reports for assigned investees to compute stats
  const assignedInvesteeIds = useMemo(() => Array.from(assignedIds), [assignedIds]);
  const { data: latestReports } = useQuery({
    queryKey: ["fund-stats-reports", fundId, assignedInvesteeIds],
    queryFn: async () => {
      if (assignedInvesteeIds.length === 0) return [];
      const { data, error } = await supabase
        .from("shareholder_reports")
        .select("*")
        .in("investee_id", assignedInvesteeIds)
        .order("report_period", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: assignedInvesteeIds.length > 0,
  });

  // Compute per-investee latest report and aggregate stats
  const stats = useMemo(() => {
    if (!latestReports || latestReports.length === 0) {
      return { totalRevenue: 0, totalCash: 0, avgRunway: 0, totalEmployeeChange: 0, reportCount: 0, companyCount: assignedInvesteeIds.length };
    }
    const seen = new Set<string>();
    const latestPerInvestee = latestReports.filter((r) => {
      if (seen.has(r.investee_id)) return false;
      seen.add(r.investee_id);
      return true;
    });

    const totalRevenue = latestPerInvestee.reduce((s, r) => s + (r.monthly_revenue || 0), 0);
    const totalCash = latestPerInvestee.reduce((s, r) => s + (r.cash_balance || 0), 0);
    const avgRunway = latestPerInvestee.length > 0
      ? Math.round(latestPerInvestee.reduce((s, r) => s + (r.runway_months || 0), 0) / latestPerInvestee.length)
      : 0;
    const totalEmployeeChange = latestPerInvestee.reduce((s, r) => s + (r.employee_count_change || 0), 0);

    return {
      totalRevenue,
      totalCash,
      avgRunway,
      totalEmployeeChange,
      reportCount: latestPerInvestee.length,
      companyCount: assignedInvesteeIds.length,
    };
  }, [latestReports, assignedInvesteeIds]);

  const filteredInvestees = useMemo(() => {
    if (!investees) return [];
    if (!search.trim()) return investees;
    const q = search.toLowerCase();
    return investees.filter(
      (i) =>
        i.company_name.toLowerCase().includes(q) ||
        i.contact_email?.toLowerCase().includes(q) ||
        i.representative?.toLowerCase().includes(q)
    );
  }, [investees, search]);

  const handleToggle = async (investeeId: string, checked: boolean) => {
    if (!fundId) return;
    if (checked) {
      await addInvestee.mutateAsync({ fund_id: fundId, investee_id: investeeId });
    } else {
      await removeInvestee.mutateAsync({ fund_id: fundId, investee_id: investeeId });
    }
  };

  const isLoading = investeesLoading || mappingLoading;

  return (
    <DashboardLayout>
      <PageHeader title={fund ? `${fund.name}` : "펀드 상세"} icon={<Briefcase className="h-6 w-6" />} showBack />

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">포트폴리오</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.companyCount}개</p>
            <p className="text-xs text-muted-foreground">{stats.reportCount}개 보고서 제출</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">총 월 매출</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-primary">{formatCurrency(stats.totalRevenue)}원</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium">총 현금 잔고</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-primary">{formatCurrency(stats.totalCash)}원</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
              <span className="text-xs font-medium">평균 런웨이</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.avgRunway}개월</p>
          </CardContent>
        </Card>
      </div>

      {/* Investee Table */}
      <Card className="animate-fade-in border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-medium">소속 피투자사</CardTitle>
              {!editMode && <Badge variant="secondary">{assignedIds.size}개</Badge>}
            </div>
            <Button size="sm" variant={editMode ? "default" : "outline"} onClick={() => setEditMode(!editMode)}>
              {editMode ? "완료" : "편집"}
            </Button>
          </div>
          {editMode && (
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="기업명, 이메일, 대표자로 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {editMode ? (
            /* Edit mode: show all investees with checkboxes */
            <Table>
              <TableHeader>
                <TableRow className="border-t">
                  <TableHead className="w-[80px] whitespace-nowrap pl-6 font-medium text-foreground">선택</TableHead>
                  <TableHead className="font-medium text-foreground">기업명</TableHead>
                  <TableHead className="font-medium text-foreground">대표자</TableHead>
                  <TableHead className="font-medium text-foreground">담당자 이메일</TableHead>
                  <TableHead className="font-medium text-foreground">보고 주기</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredInvestees.length > 0 ? (
                  filteredInvestees.map((inv) => {
                    const isAssigned = assignedIds.has(inv.id);
                    return (
                      <TableRow
                        key={inv.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${isAssigned ? "bg-primary/5" : ""}`}
                        onClick={() => handleToggle(inv.id, !isAssigned)}
                      >
                        <TableCell className="pl-6" onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={isAssigned} onCheckedChange={(val) => handleToggle(inv.id, !!val)} />
                        </TableCell>
                        <TableCell className="font-medium">{inv.company_name}</TableCell>
                        <TableCell className="text-muted-foreground">{inv.representative || "-"}</TableCell>
                        <TableCell className="text-muted-foreground">{inv.contact_email || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {FREQUENCY_LABELS[inv.report_frequency] || "월간"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      {search ? "검색 결과가 없습니다." : "등록된 피투자사가 없습니다."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            /* View mode: show only assigned investees */
            <Table>
              <TableHeader>
                <TableRow className="border-t">
                  <TableHead className="pl-6 font-medium text-foreground">기업명</TableHead>
                  <TableHead className="font-medium text-foreground">대표자</TableHead>
                  <TableHead className="font-medium text-foreground">담당자 이메일</TableHead>
                  <TableHead className="font-medium text-foreground">보고 주기</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investees && investees.filter((inv) => assignedIds.has(inv.id)).length > 0 ? (
                  investees.filter((inv) => assignedIds.has(inv.id)).map((inv) => (
                    <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/company/${inv.id}`)}>
                      <TableCell className="pl-6 font-medium">{inv.company_name}</TableCell>
                      <TableCell className="text-muted-foreground">{inv.representative || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{inv.contact_email || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {FREQUENCY_LABELS[inv.report_frequency] || "월간"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      소속된 피투자사가 없습니다. 편집 버튼을 눌러 피투자사를 배정하세요.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

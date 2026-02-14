import { useState } from "react";
import { Home, Building2, FileCheck, Clock, FileX, ChevronRight, Briefcase, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInvestees } from "@/hooks/useInvestees";
import { useFunds } from "@/hooks/useFunds";
import { useLatestReportStatus } from "@/hooks/useLatestReportStatus";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { FundFormDialog } from "@/components/funds/FundFormDialog";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

function StatCard({ title, value, subtitle, icon, onClick }: StatCardProps) {
  return (
    <Card 
      className={`animate-fade-in border-border shadow-sm ${onClick ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: investees, isLoading } = useInvestees();
  const { data: funds, isLoading: fundsLoading } = useFunds();
  const { data: reportStatuses } = useLatestReportStatus(investees?.map((i) => i.id) || []);
  const [fundFormOpen, setFundFormOpen] = useState(false);

  const totalInvestees = investees?.length || 0;
  const hasFunds = funds && funds.length > 0;
  
  const reportStats = {
    submitted: 0,
    pending: 0,
    notRequested: 0,
  };

  if (investees && reportStatuses) {
    investees.forEach((investee) => {
      const status = reportStatuses[investee.id];
      if (!status) {
        reportStats.notRequested++;
      } else if (status.hasReport) {
        reportStats.submitted++;
      } else if (status.hasPendingRequest) {
        reportStats.pending++;
      } else {
        reportStats.notRequested++;
      }
    });
  }

  const submissionRate = totalInvestees > 0 
    ? Math.round((reportStats.submitted / totalInvestees) * 100) 
    : 0;

  if (isLoading || fundsLoading) {
    return (
      <DashboardLayout>
        <PageHeader title="홈" icon={<Home className="h-6 w-6" />} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-fade-in border-border shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="홈" icon={<Home className="h-6 w-6" />} />

      <div className="space-y-6">
        {/* No Funds Onboarding */}
        {!hasFunds && (
          <Card className="animate-fade-in border-dashed border-2 border-primary/30 bg-primary/5 shadow-sm">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Briefcase className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">펀드를 먼저 생성해 주세요</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  피투자사를 관리하려면 먼저 펀드를 생성해야 합니다. 펀드를 만들고 피투자사를 배정해 보세요.
                </p>
              </div>
              <Button onClick={() => setFundFormOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                첫 번째 펀드 만들기
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="전체 피투자사"
            value={totalInvestees}
            subtitle="개사"
            icon={<Building2 className="h-6 w-6" />}
            onClick={() => navigate("/investees")}
          />
          <StatCard
            title="보고서 제출 완료"
            value={reportStats.submitted}
            subtitle={`${totalInvestees}개 중 ${reportStats.submitted}개 제출`}
            icon={<FileCheck className="h-6 w-6" />}
          />
          <StatCard
            title="보고서 요청 중"
            value={reportStats.pending}
            subtitle="응답 대기 중"
            icon={<Clock className="h-6 w-6" />}
          />
          <StatCard
            title="미요청"
            value={reportStats.notRequested}
            subtitle="보고서 요청 필요"
            icon={<FileX className="h-6 w-6" />}
          />
        </div>

        {/* Submission Rate Card */}
        <Card className="animate-fade-in border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">보고서 제출률</CardTitle>
            <button
              onClick={() => navigate("/investees")}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              상세 보기
              <ChevronRight className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold">{submissionRate}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {reportStats.submitted} / {totalInvestees} 피투자사
                </p>
              </div>
            </div>
            <Progress value={submissionRate} className="h-3" />
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center p-3 rounded-lg bg-primary/10">
                <p className="text-lg font-semibold text-primary">{reportStats.submitted}</p>
                <p className="text-xs text-muted-foreground">제출 완료</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary">
                <p className="text-lg font-semibold">{reportStats.pending}</p>
                <p className="text-xs text-muted-foreground">요청 중</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-lg font-semibold text-muted-foreground">{reportStats.notRequested}</p>
                <p className="text-xs text-muted-foreground">미요청</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <FundFormDialog open={fundFormOpen} onOpenChange={setFundFormOpen} />
    </DashboardLayout>
  );
}

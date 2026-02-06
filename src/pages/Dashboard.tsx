import { Home, Building2, FileCheck, Clock, FileX, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInvestees } from "@/hooks/useInvestees";
import { useLatestReportStatus } from "@/hooks/useLatestReportStatus";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

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
  const { data: reportStatuses } = useLatestReportStatus(investees?.map((i) => i.id) || []);

  // Calculate statistics
  const totalInvestees = investees?.length || 0;
  
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

  if (isLoading) {
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
              <div className="text-center p-3 rounded-lg bg-chart-secondary/10">
                <p className="text-lg font-semibold text-chart-secondary">{reportStats.submitted}</p>
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
    </DashboardLayout>
  );
}

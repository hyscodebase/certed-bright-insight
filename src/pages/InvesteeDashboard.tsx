import { useState, useEffect } from "react";
import { Home, FileText, Clock, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ReportRequest {
  id: string;
  status: string;
  report_period: string | null;
  requested_at: string;
  expires_at: string;
  completed_at: string | null;
  investee_id: string;
  investees: {
    company_name: string;
    report_fields: any;
    report_frequency: string;
  } | null;
}

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

export default function InvesteeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ReportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [investeeProfile, setInvesteeProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch investee profile
      const { data: profile } = await supabase
        .from("investee_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      setInvesteeProfile(profile);

      // Fetch report requests for linked investees
      const { data: requestsData } = await supabase
        .from("report_requests")
        .select(`
          *,
          investees (company_name, report_fields, report_frequency)
        `)
        .order("requested_at", { ascending: false });

      setRequests((requestsData as any[]) || []);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const pendingRequests = requests.filter(r => r.status === "pending" && new Date(r.expires_at) > new Date());
  const completedRequests = requests.filter(r => r.status === "completed");
  const expiredRequests = requests.filter(r => r.status === "pending" && new Date(r.expires_at) <= new Date());

  if (loading) {
    return (
      <DashboardLayout>
        <PageHeader title="홈" icon={<Home className="h-6 w-6" />} />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
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
        {/* Welcome */}
        {investeeProfile && (
          <Card className="animate-fade-in border-border shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">{investeeProfile.company_name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                주주보고서 작성 요청을 확인하고 보고서를 작성하세요.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="animate-fade-in">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-sm text-muted-foreground">작성 대기</p>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedRequests.length}</p>
                <p className="text-sm text-muted-foreground">제출 완료</p>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{expiredRequests.length}</p>
                <p className="text-sm text-muted-foreground">만료</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        <Card className="animate-fade-in border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              작성 대기 중인 보고서
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                현재 작성 대기 중인 보고서가 없습니다.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {req.report_period ? formatReportPeriod(req.report_period) : "기간 미정"} 주주보고서
                      </p>
                      <p className="text-sm text-muted-foreground">
                        요청일: {new Date(req.requested_at).toLocaleDateString("ko-KR")}
                        {" · "}
                        마감: {new Date(req.expires_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/investee/submit-report/${req.id}`)}
                      className="gap-1"
                    >
                      작성하기
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Requests */}
        {completedRequests.length > 0 && (
          <Card className="animate-fade-in border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                제출 완료
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {req.report_period ? formatReportPeriod(req.report_period) : "기간 미정"} 주주보고서
                      </p>
                      <p className="text-sm text-muted-foreground">
                        제출일: {req.completed_at ? new Date(req.completed_at).toLocaleDateString("ko-KR") : "-"}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-primary">제출 완료</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

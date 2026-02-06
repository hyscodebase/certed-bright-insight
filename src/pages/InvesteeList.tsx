import { List, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { useInvestees } from "@/hooks/useInvestees";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvesteeList() {
  const navigate = useNavigate();
  const { data: investees, isLoading } = useInvestees();

  return (
    <DashboardLayout>
      <PageHeader title="피투자사 목록" icon={<List className="h-6 w-6" />} />

      <Card className="animate-fade-in border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-medium">피투자사 목록</CardTitle>
          <button
            onClick={() => navigate("/add-investee")}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
          >
            피투자사 추가
            <ChevronRight className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-t">
                <TableHead className="w-[60%] pl-6 font-medium text-foreground">
                  기업명
                </TableHead>
                <TableHead className="font-medium text-foreground">투자 단계</TableHead>
                <TableHead className="font-medium text-foreground">직원수</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : investees && investees.length > 0 ? (
                investees.map((company) => (
                  <TableRow
                    key={company.id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => navigate(`/company/${company.id}`)}
                  >
                    <TableCell className="pl-6 font-medium">{company.company_name}</TableCell>
                    <TableCell>{company.investment_stage || "-"}</TableCell>
                    <TableCell>{company.employee_count ?? "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    등록된 피투자사가 없습니다.
                    <button
                      onClick={() => navigate("/add-investee")}
                      className="ml-2 text-primary hover:underline"
                    >
                      추가하기
                    </button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

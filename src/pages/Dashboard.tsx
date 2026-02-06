import { Home, FileText, ChevronRight } from "lucide-react";
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

const investees = [
  {
    id: "1",
    name: "지디피스튜디오",
    stage: "Seed",
    employees: "-",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <PageHeader title="홈" icon={<Home className="h-6 w-6" />} />

      <Card className="animate-fade-in border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-medium">피투자사 정보</CardTitle>
          </div>
          <button
            onClick={() => navigate("/investees")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            상세 정보 확인
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
              {investees.map((company) => (
                <TableRow
                  key={company.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => navigate(`/company/${company.id}`)}
                >
                  <TableCell className="pl-6 font-medium">{company.name}</TableCell>
                  <TableCell>{company.stage}</TableCell>
                  <TableCell>{company.employees}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

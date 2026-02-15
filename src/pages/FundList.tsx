import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Plus, Pencil, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useFunds, useAllFundInvestees, type Fund } from "@/hooks/useFunds";
import { FundFormDialog } from "@/components/funds/FundFormDialog";

export default function FundList() {
  const navigate = useNavigate();
  const { data: funds, isLoading } = useFunds();
  const { data: allFundInvestees } = useAllFundInvestees();
  const [formOpen, setFormOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);

  const getInvesteeCountForFund = (fundId: string) =>
    allFundInvestees?.filter((fi) => fi.fund_id === fundId).length || 0;

  const handleOpenCreate = () => {
    setEditingFund(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, fund: Fund) => {
    e.stopPropagation();
    setEditingFund(fund);
    setFormOpen(true);
  };

  return (
    <DashboardLayout>
      <PageHeader title="펀드 관리" icon={<Briefcase className="h-6 w-6" />} />

      <Card className="animate-fade-in border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-medium">펀드 목록</CardTitle>
          <Button onClick={handleOpenCreate} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            펀드 추가
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : funds && funds.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-t">
                  <TableHead className="w-[30%] pl-6 font-medium text-foreground">펀드명</TableHead>
                  <TableHead className="font-medium text-foreground">설명</TableHead>
                  <TableHead className="font-medium text-foreground">포트폴리오</TableHead>
                  <TableHead className="w-[120px] font-medium text-foreground">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funds.map((fund) => {
                  const count = getInvesteeCountForFund(fund.id);
                  return (
                    <TableRow
                      key={fund.id}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => navigate(`/funds/${fund.id}`)}
                    >
                      <TableCell className="pl-6 font-medium">{fund.name}</TableCell>
                      <TableCell className="text-muted-foreground">{fund.description || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{count}개</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleOpenEdit(e, fund)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              등록된 펀드가 없습니다. 펀드를 추가해보세요.
            </div>
          )}
        </CardContent>
      </Card>

      <FundFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingFund={editingFund}
      />

    </DashboardLayout>
  );
}

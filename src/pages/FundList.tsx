import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useFunds,
  useCreateFund,
  useUpdateFund,
  useDeleteFund,
  useAllFundInvestees,
  type Fund,
} from "@/hooks/useFunds";

export default function FundList() {
  const navigate = useNavigate();
  const { data: funds, isLoading } = useFunds();
  const { data: allFundInvestees } = useAllFundInvestees();
  const createFund = useCreateFund();
  const updateFund = useUpdateFund();
  const deleteFund = useDeleteFund();

  const [formOpen, setFormOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [fundName, setFundName] = useState("");
  const [fundDesc, setFundDesc] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Fund | null>(null);

  const getInvesteeCountForFund = (fundId: string) =>
    allFundInvestees?.filter((fi) => fi.fund_id === fundId).length || 0;

  const handleOpenCreate = () => {
    setEditingFund(null);
    setFundName("");
    setFundDesc("");
    setFormOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, fund: Fund) => {
    e.stopPropagation();
    setEditingFund(fund);
    setFundName(fund.name);
    setFundDesc(fund.description || "");
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!fundName.trim()) return;
    if (editingFund) {
      await updateFund.mutateAsync({ id: editingFund.id, name: fundName, description: fundDesc });
    } else {
      await createFund.mutateAsync({ name: fundName, description: fundDesc });
    }
    setFormOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteFund.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
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
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setDeleteTarget(fund); }}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
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

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFund ? "펀드 수정" : "펀드 추가"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>펀드명 <span className="text-destructive">*</span></Label>
              <Input value={fundName} onChange={(e) => setFundName(e.target.value)} placeholder="펀드명을 입력하세요" />
            </div>
            <div className="space-y-2">
              <Label>설명</Label>
              <Textarea value={fundDesc} onChange={(e) => setFundDesc(e.target.value)} placeholder="펀드 설명 (선택)" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>취소</Button>
            <Button onClick={handleSave} disabled={!fundName.trim() || createFund.isPending || updateFund.isPending}>
              {editingFund ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>펀드 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" 펀드를 삭제하시겠습니까? 연결된 피투자사 매핑도 함께 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

import { useState } from "react";
import { Briefcase, Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  useAddInvesteeToFund,
  useRemoveInvesteeFromFund,
  type Fund,
} from "@/hooks/useFunds";
import { useInvestees } from "@/hooks/useInvestees";

export default function FundList() {
  const { data: funds, isLoading } = useFunds();
  const { data: investees } = useInvestees();
  const { data: allFundInvestees } = useAllFundInvestees();
  const createFund = useCreateFund();
  const updateFund = useUpdateFund();
  const deleteFund = useDeleteFund();
  const addInvestee = useAddInvesteeToFund();
  const removeInvestee = useRemoveInvesteeFromFund();

  const [formOpen, setFormOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [fundName, setFundName] = useState("");
  const [fundDesc, setFundDesc] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Fund | null>(null);
  const [mappingFund, setMappingFund] = useState<Fund | null>(null);

  const getInvesteeCountForFund = (fundId: string) =>
    allFundInvestees?.filter((fi) => fi.fund_id === fundId).length || 0;

  const getInvesteeIdsForFund = (fundId: string) =>
    new Set(allFundInvestees?.filter((fi) => fi.fund_id === fundId).map((fi) => fi.investee_id) || []);

  const handleOpenCreate = () => {
    setEditingFund(null);
    setFundName("");
    setFundDesc("");
    setFormOpen(true);
  };

  const handleOpenEdit = (fund: Fund) => {
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

  const handleToggleInvestee = async (fundId: string, investeeId: string, isChecked: boolean) => {
    if (isChecked) {
      await addInvestee.mutateAsync({ fund_id: fundId, investee_id: investeeId });
    } else {
      await removeInvestee.mutateAsync({ fund_id: fundId, investee_id: investeeId });
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="펀드 관리" icon={<Briefcase className="h-6 w-6" />} />

      <div className="mb-4 flex justify-end">
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          펀드 추가
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : funds && funds.length > 0 ? (
        <div className="space-y-4">
          {funds.map((fund) => {
            const count = getInvesteeCountForFund(fund.id);
            return (
              <Card key={fund.id} className="animate-fade-in border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold">{fund.name}</CardTitle>
                    {fund.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{fund.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{count}개 포트폴리오</Badge>
                    <Button variant="ghost" size="icon" onClick={() => setMappingFund(fund)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(fund)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(fund)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="animate-fade-in border-border shadow-sm">
          <CardContent className="p-6 text-center text-muted-foreground">
            등록된 펀드가 없습니다. 펀드를 추가해보세요.
          </CardContent>
        </Card>
      )}

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

      {/* Investee Mapping Dialog */}
      <Dialog open={!!mappingFund} onOpenChange={(open) => !open && setMappingFund(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>"{mappingFund?.name}" 피투자사 관리</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] space-y-2 overflow-y-auto py-4">
            {investees && investees.length > 0 ? (
              investees.map((inv) => {
                const checked = mappingFund ? getInvesteeIdsForFund(mappingFund.id).has(inv.id) : false;
                return (
                  <label key={inv.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(val) => mappingFund && handleToggleInvestee(mappingFund.id, inv.id, !!val)}
                    />
                    <span className="text-sm font-medium">{inv.company_name}</span>
                  </label>
                );
              })
            ) : (
              <p className="text-center text-sm text-muted-foreground">등록된 피투자사가 없습니다.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

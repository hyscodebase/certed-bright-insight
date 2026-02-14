import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { useCreateFund, useUpdateFund, type Fund } from "@/hooks/useFunds";

interface FundFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFund?: Fund | null;
  onSuccess?: (fund: Fund) => void;
}

export function FundFormDialog({ open, onOpenChange, editingFund, onSuccess }: FundFormDialogProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const createFund = useCreateFund();
  const updateFund = useUpdateFund();

  useEffect(() => {
    if (open) {
      setName(editingFund?.name || "");
      setDesc(editingFund?.description || "");
    }
  }, [open, editingFund]);

  const handleSave = async () => {
    if (!name.trim()) return;
    if (editingFund) {
      const result = await updateFund.mutateAsync({ id: editingFund.id, name, description: desc });
      onSuccess?.(result as Fund);
    } else {
      const result = await createFund.mutateAsync({ name, description: desc });
      onSuccess?.(result as Fund);
    }
    onOpenChange(false);
  };

  const isPending = createFund.isPending || updateFund.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingFund ? "펀드 수정" : "새 펀드 생성"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>펀드명 <span className="text-destructive">*</span></Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="펀드명을 입력하세요" />
          </div>
          <div className="space-y-2">
            <Label>설명</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="펀드 설명 (선택)" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
          <Button onClick={handleSave} disabled={!name.trim() || isPending}>
            {isPending ? "저장 중..." : editingFund ? "수정" : "생성"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

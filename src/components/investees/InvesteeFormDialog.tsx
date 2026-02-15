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
import { Button } from "@/components/ui/button";
import { useUpdateInvestee } from "@/hooks/useInvestees";

interface InvesteeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investee: {
    id: string;
    company_name: string;
    representative: string | null;
    contact_email: string | null;
  } | null;
}

export function InvesteeFormDialog({ open, onOpenChange, investee }: InvesteeFormDialogProps) {
  const [companyName, setCompanyName] = useState("");
  const [representative, setRepresentative] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const updateInvestee = useUpdateInvestee();

  useEffect(() => {
    if (open && investee) {
      setCompanyName(investee.company_name);
      setRepresentative(investee.representative || "");
      setContactEmail(investee.contact_email || "");
    }
  }, [open, investee]);

  const handleSave = async () => {
    if (!investee || !companyName.trim()) return;
    await updateInvestee.mutateAsync({
      id: investee.id,
      company_name: companyName,
      representative: representative || null,
      contact_email: contactEmail || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>피투자사 수정</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>기업명 <span className="text-destructive">*</span></Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="기업명을 입력하세요" />
          </div>
          <div className="space-y-2">
            <Label>대표자</Label>
            <Input value={representative} onChange={(e) => setRepresentative(e.target.value)} placeholder="대표자명 (선택)" />
          </div>
          <div className="space-y-2">
            <Label>담당자 이메일</Label>
            <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="이메일 (선택)" type="email" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
          <Button onClick={handleSave} disabled={!companyName.trim() || updateInvestee.isPending}>
            {updateInvestee.isPending ? "저장 중..." : "수정"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

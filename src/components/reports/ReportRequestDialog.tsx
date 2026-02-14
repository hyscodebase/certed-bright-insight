import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ReportRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  onConfirm: (reportPeriod: string) => Promise<void>;
  isLoading: boolean;
  reportFrequency?: string;
}

function generateMonthOptions(): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
    options.push({ value, label });
  }
  return options;
}

function generateQuarterOptions(): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  const now = new Date();
  const currentQ = Math.ceil((now.getMonth() + 1) / 3);
  const currentYear = now.getFullYear();
  for (let i = 0; i < 8; i++) {
    let q = currentQ - i;
    let y = currentYear;
    while (q <= 0) { q += 4; y--; }
    const endMonth = q * 3;
    const value = `${y}-Q${q}`;
    const label = `${y}년 ${q}분기`;
    options.push({ value, label });
  }
  return options;
}

function generateSemiAnnualOptions(): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  const now = new Date();
  const currentHalf = now.getMonth() < 6 ? 1 : 2;
  const currentYear = now.getFullYear();
  for (let i = 0; i < 6; i++) {
    let h = currentHalf - i;
    let y = currentYear;
    while (h <= 0) { h += 2; y--; }
    const value = `${y}-H${h}`;
    const label = `${y}년 ${h === 1 ? "상반기" : "하반기"}`;
    options.push({ value, label });
  }
  return options;
}

function generateAnnualOptions(): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 5; i++) {
    const y = currentYear - i;
    options.push({ value: `${y}`, label: `${y}년` });
  }
  return options;
}

function getOptionsForFrequency(frequency: string) {
  switch (frequency) {
    case "quarterly": return generateQuarterOptions();
    case "semi_annual": return generateSemiAnnualOptions();
    case "annual": return generateAnnualOptions();
    default: return generateMonthOptions();
  }
}

function getFrequencyLabel(frequency: string) {
  switch (frequency) {
    case "quarterly": return "분기";
    case "semi_annual": return "반기";
    case "annual": return "연도";
    default: return "월";
  }
}

export function ReportRequestDialog({
  open,
  onOpenChange,
  companyName,
  onConfirm,
  isLoading,
  reportFrequency = "monthly",
}: ReportRequestDialogProps) {
  const periodOptions = getOptionsForFrequency(reportFrequency);
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0].value);

  const handleConfirm = async () => {
    await onConfirm(selectedPeriod);
  };

  const frequencyLabel = getFrequencyLabel(reportFrequency);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>주주보고서 작성 요청</DialogTitle>
          <DialogDescription>
            {companyName}에게 주주보고서 작성을 요청합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="report-period">보고 {frequencyLabel} 선택</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger id="report-period" className="w-full">
                <SelectValue placeholder={`보고 ${frequencyLabel}을 선택하세요`} />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background">
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              피투자사가 작성할 보고서의 기준 {frequencyLabel}을 선택하세요.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                발송 중...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                요청 보내기
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const FREQUENCY_OPTIONS = [
  { key: "monthly", label: "월간" },
  { key: "quarterly", label: "분기" },
  { key: "semi_annual", label: "반기" },
  { key: "annual", label: "연간" },
] as const;

interface ReportRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  onConfirm: (periods: Array<{ period: string; reportFields: string[] }>) => Promise<void>;
  isLoading: boolean;
  enabledFrequencies: string[];
  reportFieldsConfig: Record<string, string[]>;
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
  enabledFrequencies,
  reportFieldsConfig,
}: ReportRequestDialogProps) {
  const availableFrequencies = useMemo(
    () => FREQUENCY_OPTIONS.filter(f => enabledFrequencies.includes(f.key)),
    [enabledFrequencies]
  );

  const [selectedFrequency, setSelectedFrequency] = useState<string>(availableFrequencies[0]?.key || "monthly");

  const periodOptions = useMemo(() => getOptionsForFrequency(selectedFrequency), [selectedFrequency]);
  const frequencyLabel = getFrequencyLabel(selectedFrequency);

  const [selectedPeriods, setSelectedPeriods] = useState<Set<string>>(new Set());

  // Reset selected periods when frequency changes
  const handleFrequencyChange = (freq: string) => {
    setSelectedFrequency(freq);
    const opts = getOptionsForFrequency(freq);
    setSelectedPeriods(new Set([opts[0]?.value].filter(Boolean)));
  };

  // Initialize on open
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      const freq = availableFrequencies[0]?.key || "monthly";
      setSelectedFrequency(freq);
      const opts = getOptionsForFrequency(freq);
      setSelectedPeriods(new Set([opts[0]?.value].filter(Boolean)));
    }
    onOpenChange(newOpen);
  };

  const handleTogglePeriod = (period: string) => {
    setSelectedPeriods(prev => {
      const next = new Set(prev);
      if (next.has(period)) {
        next.delete(period);
      } else {
        next.add(period);
      }
      return next;
    });
  };

  const handleConfirm = async () => {
    const fields = reportFieldsConfig[selectedFrequency] ?? [];
    const periods = Array.from(selectedPeriods).map(period => ({
      period,
      reportFields: fields,
    }));
    await onConfirm(periods);
  };

  const selectedCount = selectedPeriods.size;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>주주보고서 작성 요청</DialogTitle>
          <DialogDescription>
            {companyName}에게 주주보고서 작성을 요청합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Frequency selector */}
          {availableFrequencies.length > 1 && (
            <div className="space-y-2">
              <Label>보고 주기</Label>
              <div className="flex gap-1 rounded-lg border p-1">
                {availableFrequencies.map((freq) => (
                  <button
                    key={freq.key}
                    onClick={() => handleFrequencyChange(freq.key)}
                    className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      selectedFrequency === freq.key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Period selection */}
          <div className="space-y-2">
            <Label>보고 {frequencyLabel} 선택 ({selectedCount}개)</Label>
            <div className="space-y-1 max-h-[300px] overflow-y-auto rounded-md border p-2">
              {periodOptions.map((option) => {
                const isSelected = selectedPeriods.has(option.value);
                return (
                  <div
                    key={option.value}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer transition-colors hover:bg-muted/50 ${isSelected ? "bg-primary/5" : ""}`}
                    onClick={() => handleTogglePeriod(option.value)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleTogglePeriod(option.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              여러 {frequencyLabel}을 선택하여 한 번에 요청할 수 있습니다.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading || selectedCount === 0} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                발송 중...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {selectedCount}건 요청 보내기
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

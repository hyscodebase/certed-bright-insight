import { useState, useMemo, useCallback } from "react";
import { Settings2, Check, Save } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CategorizedFieldCheckboxes } from "@/components/reports/CategorizedFieldCheckboxes";
import { FREQUENCY_OPTIONS, ALL_FIELD_KEYS, type ReportFieldsConfig } from "@/constants/reportFields";

const DEFAULT_CONFIG: ReportFieldsConfig = {
  monthly: [...ALL_FIELD_KEYS],
  quarterly: [...ALL_FIELD_KEYS],
  semi_annual: [...ALL_FIELD_KEYS],
  annual: [...ALL_FIELD_KEYS],
};

export function useDefaultReportFields() {
  return useQuery({
    queryKey: ["default-report-fields"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return DEFAULT_CONFIG;
      const { data } = await supabase
        .from("profiles")
        .select("default_report_fields")
        .eq("user_id", user.user.id)
        .single();
      const raw = (data as any)?.default_report_fields;
      if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        return raw as ReportFieldsConfig;
      }
      return DEFAULT_CONFIG;
    },
  });
}

export default function ReportSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: savedConfig, isLoading } = useDefaultReportFields();

  const [draft, setDraft] = useState<ReportFieldsConfig | null>(null);
  const [selectedTab, setSelectedTab] = useState("monthly");

  const activeConfig = draft ?? savedConfig ?? DEFAULT_CONFIG;
  const enabledFrequencies = useMemo(() => new Set(Object.keys(activeConfig)), [activeConfig]);

  const activeTab = useMemo(() => {
    if (enabledFrequencies.has(selectedTab)) return selectedTab;
    return FREQUENCY_OPTIONS.find(f => enabledFrequencies.has(f.key))?.key || "monthly";
  }, [selectedTab, enabledFrequencies]);

  const currentFields = useMemo(
    () => new Set<string>(activeConfig[activeTab] ?? []),
    [activeTab, activeConfig]
  );

  const isDirty = draft !== null;

  const handleToggleFrequency = useCallback((freqKey: string) => {
    const current = { ...activeConfig };
    if (current[freqKey]) {
      if (Object.keys(current).length <= 1) {
        toast({ title: "최소 1개의 보고 주기를 선택해야 합니다.", variant: "destructive" });
        return;
      }
      delete current[freqKey];
      if (activeTab === freqKey) {
        setSelectedTab(Object.keys(current)[0] || "monthly");
      }
    } else {
      current[freqKey] = [...ALL_FIELD_KEYS];
    }
    setDraft(current);
  }, [activeConfig, activeTab, toast]);

  const handleToggleField = useCallback((fieldKey: string) => {
    const fields = new Set(activeConfig[activeTab] ?? []);
    if (fields.has(fieldKey)) fields.delete(fieldKey);
    else fields.add(fieldKey);
    setDraft({ ...activeConfig, [activeTab]: Array.from(fields) });
  }, [activeConfig, activeTab]);

  const saveMutation = useMutation({
    mutationFn: async (config: ReportFieldsConfig) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("로그인 필요");
      const { error } = await supabase
        .from("profiles")
        .update({ default_report_fields: config } as any)
        .eq("user_id", user.user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["default-report-fields"] });
      setDraft(null);
      toast({ title: "기본 보고서 설정이 저장되었습니다." });
    },
  });

  const handleSave = () => {
    if (draft) saveMutation.mutate(draft);
  };

  const handleReset = () => setDraft(null);

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeader title="기본 보고서 설정" icon={<Settings2 className="h-6 w-6" />} />
        <Card className="mx-auto max-w-xl"><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="기본 보고서 설정" icon={<Settings2 className="h-6 w-6" />} />

      <Card className="mx-auto max-w-xl animate-fade-in border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-medium">기본 보고 주기 및 수집 항목</CardTitle>
          {isDirty && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>취소</Button>
              <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saveMutation.isPending}>
                <Save className="h-3.5 w-3.5" />
                저장
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            여기서 설정한 기본값은 새로운 피투자사를 추가할 때 초기값으로 적용됩니다.
          </p>

          {/* Frequency toggles */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">보고 주기 선택</Label>
            <div className="flex flex-wrap gap-2">
              {FREQUENCY_OPTIONS.map((freq) => {
                const isEnabled = enabledFrequencies.has(freq.key);
                return (
                  <button
                    key={freq.key}
                    onClick={() => handleToggleFrequency(freq.key)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      isEnabled
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {freq.label}
                    {isEnabled && <Check className="ml-1.5 inline h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Per-frequency fields */}
          {enabledFrequencies.size > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">선택 항목 설정</Label>
              {enabledFrequencies.size > 1 && (
                <div className="flex gap-1 rounded-lg border p-1">
                  {FREQUENCY_OPTIONS.filter(f => enabledFrequencies.has(f.key)).map((freq) => (
                    <button
                      key={freq.key}
                      onClick={() => setSelectedTab(freq.key)}
                      className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        activeTab === freq.key
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              )}
              <CategorizedFieldCheckboxes
                selectedFields={currentFields}
                onToggle={handleToggleField}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

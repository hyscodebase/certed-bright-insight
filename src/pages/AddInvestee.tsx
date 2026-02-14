import { useState } from "react";
import { Building2, ChevronRight, ChevronLeft, Check, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateInvestee } from "@/hooks/useInvestees";
import { useFunds, useAddInvesteeToFund } from "@/hooks/useFunds";

const REPORT_FREQUENCY_OPTIONS = [
  { value: "monthly", label: "월간" },
  { value: "quarterly", label: "분기" },
  { value: "semi_annual", label: "반기" },
  { value: "annual", label: "연간" },
];

const STEPS = [
  { id: 1, title: "기업 정보" },
  { id: 2, title: "보고 설정" },
  { id: 3, title: "펀드 배정" },
];

export default function AddInvestee() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [representative, setRepresentative] = useState("");
  const [email, setEmail] = useState("");
  const [reportFrequency, setReportFrequency] = useState("monthly");
  const [selectedFundIds, setSelectedFundIds] = useState<string[]>([]);
  const [fundSearch, setFundSearch] = useState("");
  const createInvestee = useCreateInvestee();
  const { data: funds } = useFunds();
  const addInvesteeToFund = useAddInvesteeToFund();

  const isStep1Valid = companyName.trim() && email.trim();
  const totalSteps = funds && funds.length > 0 ? 3 : 2;

  const toggleFund = (fundId: string) => {
    setSelectedFundIds((prev) =>
      prev.includes(fundId) ? prev.filter((id) => id !== fundId) : [...prev, fundId]
    );
  };

  const filteredFunds = funds?.filter((f) =>
    !fundSearch.trim() ||
    f.name.toLowerCase().includes(fundSearch.toLowerCase()) ||
    f.description?.toLowerCase().includes(fundSearch.toLowerCase())
  );

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    createInvestee.mutate(
      {
        company_name: companyName,
        contact_email: email,
        representative: representative.trim() || null,
        report_frequency: reportFrequency,
      },
      {
        onSuccess: async (result) => {
          if (selectedFundIds.length > 0 && result?.id) {
            await Promise.all(
              selectedFundIds.map((fundId) =>
                addInvesteeToFund.mutateAsync({ fund_id: fundId, investee_id: result.id })
              )
            );
          }
          navigate("/investees");
        },
      }
    );
  };

  const activeSteps = STEPS.slice(0, totalSteps);

  return (
    <DashboardLayout>
      <PageHeader title="피투자사 추가" icon={<Building2 className="h-6 w-6" />} />

      {/* Stepper */}
      <div className="mx-auto mb-6 flex max-w-xl items-center justify-center gap-2">
        {activeSteps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (s.id === 1 || (s.id === 2 && isStep1Valid) || (s.id === 3 && isStep1Valid)) {
                  setStep(s.id);
                }
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                step === s.id
                  ? "bg-primary text-primary-foreground"
                  : step > s.id
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.id ? <Check className="h-4 w-4" /> : s.id}
            </button>
            <span
              className={`text-sm font-medium ${
                step === s.id ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.title}
            </span>
            {i < activeSteps.length - 1 && (
              <div className="mx-2 h-px w-8 bg-border" />
            )}
          </div>
        ))}
      </div>

      <Card className="mx-auto max-w-xl animate-fade-in border-border shadow-sm">
        <CardContent className="p-6">
          {/* Step 1: 기업 정보 */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">
                  기업명 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="companyName"
                  placeholder="피투자사의 기업명을 입력해주세요."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-11 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="representative" className="text-sm font-medium">
                  대표자명
                </Label>
                <Input
                  id="representative"
                  placeholder="피투자사의 대표자명을 입력해주세요."
                  value={representative}
                  onChange={(e) => setRepresentative(e.target.value)}
                  className="h-11 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  기업 담당자 이메일 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="피투자사의 담당자 이메일 주소를 입력해주세요."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Step 2: 보고 설정 */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">보고 주기</Label>
                <Select value={reportFrequency} onValueChange={setReportFrequency}>
                  <SelectTrigger className="h-11 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_FREQUENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  피투자사의 주주보고서 작성 주기를 설정합니다.
                </p>
              </div>

              {/* Summary of step 1 */}
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">입력된 기업 정보</p>
                <div className="space-y-1 text-sm">
                  <p><span className="text-muted-foreground">기업명:</span> {companyName}</p>
                  {representative && <p><span className="text-muted-foreground">대표자:</span> {representative}</p>}
                  <p><span className="text-muted-foreground">이메일:</span> {email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: 펀드 배정 */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  피투자사를 배정할 펀드를 선택하세요. 여러 펀드에 동시 배정 가능합니다.
                </p>
                {selectedFundIds.length > 0 && (
                  <Badge variant="secondary">{selectedFundIds.length}개 선택</Badge>
                )}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="펀드 검색..."
                  value={fundSearch}
                  onChange={(e) => setFundSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="max-h-[300px] space-y-2 overflow-y-auto">
                {filteredFunds && filteredFunds.length > 0 ? (
                  filteredFunds.map((fund) => (
                    <label
                      key={fund.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 ${
                        selectedFundIds.includes(fund.id)
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <Checkbox
                        checked={selectedFundIds.includes(fund.id)}
                        onCheckedChange={() => toggleFund(fund.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium">{fund.name}</span>
                        {fund.description && (
                          <p className="truncate text-xs text-muted-foreground">{fund.description}</p>
                        )}
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {fundSearch ? "검색 결과가 없습니다." : "등록된 펀드가 없습니다."}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={step === 1 && !isStep1Valid}
                className="gap-2"
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStep1Valid || createInvestee.isPending}
                className="gap-2"
              >
                {createInvestee.isPending ? "추가 중..." : "피투자사 추가"}
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

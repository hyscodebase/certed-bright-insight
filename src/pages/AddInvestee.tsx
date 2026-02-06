import { useState } from "react";
import { Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCreateInvestee } from "@/hooks/useInvestees";

export default function AddInvestee() {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [representative, setRepresentative] = useState("");
  const [email, setEmail] = useState("");
  const createInvestee = useCreateInvestee();

  const isFormValid = companyName.trim() && email.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    createInvestee.mutate(
      { 
        company_name: companyName, 
        contact_email: email,
        representative: representative.trim() || null,
      },
      {
        onSuccess: () => {
          navigate("/investees");
        },
      }
    );
  };

  return (
    <DashboardLayout>
      <PageHeader title="피투자사 추가" icon={<Building2 className="h-6 w-6" />} />

      <Card className="max-w-xl animate-fade-in border-border shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Button
              type="submit"
              disabled={!isFormValid || createInvestee.isPending}
              className="h-11 w-full rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground disabled:bg-muted disabled:text-muted-foreground"
            >
              {createInvestee.isPending ? "추가 중..." : "피투자사 추가"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

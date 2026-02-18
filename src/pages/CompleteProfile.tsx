import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Building2, TrendingUp, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Determine role from localStorage (set during Google signup) or user metadata
  const [role, setRole] = useState<"investor" | "investee" | null>(null);

  // Investor fields
  const [companyName, setCompanyName] = useState("");

  // Investee fields
  const [investeeCompanyName, setInvesteeCompanyName] = useState("");
  const [businessRegNumber, setBusinessRegNumber] = useState("");
  const [representative, setRepresentative] = useState("");
  const [industry, setIndustry] = useState("");
  const [establishedDate, setEstablishedDate] = useState("");
  const [capital, setCapital] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    // Check localStorage first (Google signup flow)
    const storedRole = localStorage.getItem("signup_role") as "investor" | "investee" | null;
    if (storedRole) {
      setRole(storedRole);
    } else {
      // Check user metadata
      const metaRole = user?.user_metadata?.role as "investor" | "investee" | undefined;
      setRole(metaRole || null);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !role) return;
    setLoading(true);

    try {
      // Assign role if not already assigned
      const { error: roleError } = await supabase.from("user_roles").upsert(
        { user_id: user.id, role },
        { onConflict: "user_id,role" }
      );
      if (roleError) {
        console.warn("Role upsert warning:", roleError.message);
      }

      // Ensure profile exists (upsert)
      const targetCompanyName = role === "investor" ? companyName.trim() : investeeCompanyName.trim();
      const displayName = user.user_metadata?.full_name || user.user_metadata?.name || "";
      await supabase.from("profiles").upsert(
        { user_id: user.id, company_name: targetCompanyName, display_name: displayName },
        { onConflict: "user_id" }
      );

      if (role !== "investor") {
        // Create investee profile
        const { error: profileError } = await supabase
          .from("investee_profiles")
          .upsert({
            user_id: user.id,
            company_name: investeeCompanyName.trim(),
            business_registration_number: businessRegNumber.trim() || null,
            representative: representative.trim() || null,
            industry: industry.trim() || null,
            established_date: establishedDate || null,
            capital: capital ? parseInt(capital) : 0,
            employee_count: employeeCount ? parseInt(employeeCount) : 0,
            address: address.trim() || null,
            contact_email: user.email,
          }, { onConflict: "user_id" });

        if (profileError) throw profileError;


        // Auto-link any existing investee records
        await supabase
          .from("investees")
          .update({ investee_user_id: user.id } as any)
          .eq("contact_email", user.email!)
          .is("investee_user_id", null);
      }

      localStorage.removeItem("signup_role");
      toast({ title: "프로필이 저장되었습니다." });
      
      // Navigate to the correct dashboard based on role
      if (role === "investee") {
        navigate("/investee", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      toast({ title: "저장 실패", description: error.message, variant: "destructive" });
    }

    setLoading(false);
  };

  const inputClass = "h-12 rounded-lg border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground">
              Certed<span className="text-primary">+</span>
            </h1>
          </div>

          <div className="mb-4 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login", { replace: true });
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="mr-1 h-4 w-4" />
              로그아웃
            </Button>
          </div>

          <div className="rounded-2xl bg-card p-8">
            {!role ? (
              <>
                <h2 className="mb-2 text-center text-2xl font-medium text-foreground">가입 유형 선택</h2>
                <p className="mb-8 text-center text-sm text-muted-foreground">가입 유형을 선택해주세요</p>
                <div className="space-y-4">
                  <button
                    onClick={() => setRole("investor")}
                    className="w-full rounded-xl border-2 border-border p-6 text-left hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">투자사</h3>
                        <p className="text-sm text-muted-foreground">피투자사를 관리하고 보고서를 수집합니다</p>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setRole("investee")}
                    className="w-full rounded-xl border-2 border-border p-6 text-left hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">피투자사</h3>
                        <p className="text-sm text-muted-foreground">투자사에게 주주보고서를 제출합니다</p>
                      </div>
                    </div>
                  </button>
                </div>
              </>
            ) : role === "investor" ? (
              <>
                <div className="mb-6 flex items-center gap-2">
                  <button onClick={() => setRole(null)} className="text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h2 className="text-xl font-medium text-foreground">투자사명 입력</h2>
                </div>
                <p className="mb-8 text-sm text-muted-foreground">서비스 이용을 위해 투자사명을 입력해주세요.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">투자사명 <span className="text-primary">*</span></Label>
                    <Input id="companyName" type="text" placeholder="투자사명을 입력하세요" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className={inputClass} />
                  </div>
                  <Button type="submit" disabled={loading || !companyName.trim()} className="h-12 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                    {loading ? "저장 중..." : "시작하기"}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6 flex items-center gap-2">
                  <button onClick={() => setRole(null)} className="text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h2 className="text-xl font-medium text-foreground">회사 정보 입력</h2>
                </div>
                <p className="mb-8 text-sm text-muted-foreground">피투자사 정보를 입력해주세요.</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="investeeCompanyName">회사명 <span className="text-primary">*</span></Label>
                    <Input id="investeeCompanyName" type="text" placeholder="회사명을 입력하세요" value={investeeCompanyName} onChange={(e) => setInvesteeCompanyName(e.target.value)} required className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessRegNumber">사업자등록번호</Label>
                    <Input id="businessRegNumber" type="text" placeholder="000-00-00000" value={businessRegNumber} onChange={(e) => setBusinessRegNumber(e.target.value)} className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="representative">대표자명</Label>
                    <Input id="representative" type="text" placeholder="대표자명" value={representative} onChange={(e) => setRepresentative(e.target.value)} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="industry">업종</Label>
                      <Input id="industry" type="text" placeholder="업종" value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClass} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="establishedDate">설립일</Label>
                      <Input id="establishedDate" type="date" value={establishedDate} onChange={(e) => setEstablishedDate(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="capital">자본금 (원)</Label>
                      <Input id="capital" type="number" placeholder="0" value={capital} onChange={(e) => setCapital(e.target.value)} className={inputClass} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employeeCount">직원 수</Label>
                      <Input id="employeeCount" type="number" placeholder="0" value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">주소</Label>
                    <Input id="address" type="text" placeholder="회사 주소" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
                  </div>
                  <Button type="submit" disabled={loading || !investeeCompanyName.trim()} className="h-12 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                    {loading ? "저장 중..." : "시작하기"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ChevronRight, ChevronLeft, TrendingUp, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type SelectedRole = "investor" | "investee" | null;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null);

  useEffect(() => {
    if (!authLoading && user) {
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.role === "investee") {
            navigate("/investee", { replace: true });
          } else {
            const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";
            navigate(from, { replace: true });
          }
        });
    }
  }, [user, authLoading, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "로그인 실패",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });

    if (result.error) {
      toast({
        title: "Google 로그인 실패",
        description: result.error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const roleLabel = selectedRole === "investor" ? "투자사" : "스타트업(피투자사)";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground">
              Certed<span className="text-primary">+</span>
            </h1>
          </div>

          <div className="rounded-2xl bg-card p-8">
            {!selectedRole ? (
              <RoleSelector onSelect={setSelectedRole} />
            ) : (
              <>
                <div className="mb-6 flex items-center gap-2">
                  <button onClick={() => setSelectedRole(null)} className="text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h2 className="text-xl font-medium text-muted-foreground">
                    {roleLabel} 로그인
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      아이디 <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="이메일 주소를 입력하세요"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-lg border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      비밀번호 <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="비밀번호를 입력하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 rounded-lg border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {loading ? "로그인 중..." : "로그인"}
                  </Button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-sm text-muted-foreground">또는</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Google Login Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="h-12 w-full rounded-lg border border-border bg-background hover:bg-secondary"
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google로 계속하기
                </Button>

                <div className="mt-6 text-center">
                  <span className="text-sm text-muted-foreground">
                    써티드 플러스 회원이 아니신가요?{" "}
                  </span>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
                  >
                    회원가입
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background px-8 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-6 text-xs text-muted-foreground">
          <div>
            <span className="text-lg font-bold text-primary">Certed</span>
          </div>
          <div className="space-y-0.5">
            <p>상호명 | 주식회사 지디피스튜디오</p>
            <p>대표자 | 이유</p>
          </div>
          <div className="space-y-0.5">
            <p>사업자 등록번호 | 146-87-02284</p>
          </div>
          <div className="space-y-0.5">
            <p>이메일 | help@certifie.io</p>
            <p>전화번호 | 010-6212-0225</p>
          </div>
          <div className="space-y-0.5">
            <p>주소 | 경기 성남시 분당구 대왕판교로645번길 12,8층 경기창조경제혁신센터 (13487)</p>
            <p>© 2026 GDP Studio Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function RoleSelector({ onSelect }: { onSelect: (role: SelectedRole) => void }) {
  return (
    <>
      <h2 className="mb-2 text-center text-2xl font-medium text-foreground">로그인</h2>
      <p className="mb-8 text-center text-sm text-muted-foreground">로그인 유형을 선택해주세요</p>
      <div className="space-y-4">
        <button
          onClick={() => onSelect("investor")}
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
          onClick={() => onSelect("investee")}
          className="w-full rounded-xl border-2 border-border p-6 text-left hover:border-primary hover:bg-primary/5 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">스타트업 (피투자사)</h3>
              <p className="text-sm text-muted-foreground">투자사에게 주주보고서를 제출합니다</p>
            </div>
          </div>
        </button>
      </div>
    </>
  );
}

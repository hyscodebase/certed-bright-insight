import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - navigate to dashboard
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground">
              Certed<span className="text-primary">+</span>
            </h1>
          </div>

          {/* Login Card */}
          <div className="rounded-2xl bg-card p-8">
            <h2 className="mb-8 text-center text-2xl font-medium text-muted-foreground">
              로그인
            </h2>

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
                  className="h-12 rounded-lg border-0 bg-highlight text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
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
                  className="h-12 rounded-lg border-0 bg-highlight text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                로그인
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-sm text-muted-foreground">
                써티드 플러스 회원이 아니신가요?{" "}
              </span>
              <button className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary">
                회원가입
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
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
            <p>통신판매업신고번호 | 2023-창원성산-0866</p>
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

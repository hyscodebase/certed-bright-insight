import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-foreground">Certed</span>
              <span className="text-primary">+</span>
            </h1>
          </div>

          {/* Login Title */}
          <h2 className="mb-10 text-center text-3xl font-light text-muted-foreground">
            로그인
          </h2>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                아이디 <span className="text-primary">*</span>
              </label>
              <input
                type="email"
                placeholder="pyoon98@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-lg border-0 bg-highlight px-4 text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                비밀번호 <span className="text-primary">*</span>
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full rounded-lg border-0 bg-highlight px-4 text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-lg bg-primary font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              로그인
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <span className="text-sm text-muted-foreground">
              써티드 플러스 회원이 아니신가요?{" "}
            </span>
            <button className="inline-flex items-center gap-0.5 text-sm font-semibold text-foreground hover:text-primary">
              회원가입
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background px-8 py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-5">
          {/* Logo */}
          <div>
            <span className="text-xl font-bold text-primary">Certed</span>
          </div>
          
          {/* Company Info */}
          <div className="space-y-1">
            <p>상호명 | 주식회사 지디피스튜디오</p>
            <p>대표자 | 이유</p>
          </div>
          
          {/* Business Info */}
          <div className="space-y-1">
            <p>사업자 등록번호 | 146-87-02284</p>
            <p>통신판매업신고번호 | 2023-창원성산-0866</p>
          </div>
          
          {/* Contact */}
          <div className="space-y-1">
            <p>이메일 | help@certifie.io</p>
            <p>전화번호 | 010-6212-0225</p>
          </div>
          
          {/* Address & Copyright */}
          <div className="space-y-1">
            <p>주소 | 경기 성남시 분당구 대왕판교로645번길 12,8층 경기창조경제혁신센터 (13487)</p>
            <p className="mt-2">© 2026 GDP Studio Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

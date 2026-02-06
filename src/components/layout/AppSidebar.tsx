import { Home, Building2, List, User, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "홈", url: "/", icon: Home },
  { title: "피투자사 추가", url: "/add-investee", icon: Building2 },
  { title: "피투자사 목록", url: "/investees", icon: List },
  { title: "프로필", url: "/profile", icon: User },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-sidebar border-r border-sidebar-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">
          Certed<span className="text-primary">+</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Logout */}
        <div className="mt-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="h-5 w-5" />
            <span>로그아웃</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-2">
          <span className="text-lg font-bold text-primary">Certed</span>
        </div>
        <div className="space-y-0.5 text-xs text-muted-foreground">
          <p>상호명 | 주식회사 지디피스튜디오</p>
          <p>대표자 | 이유</p>
          <p>사업자 등록번호 | 146-87-02284</p>
          <p>통신판매업신고번호 | 2023-창원성산-0866</p>
          <p className="leading-relaxed">
            주소 | 서울특별시 금천구 가산디지털1로 120 서울디지털산업단지 G벨리창업큐브 603 (08590)
          </p>
          <p>이메일 | help@certifie.io</p>
          <p>전화번호 | 010-6212-0225</p>
          <p className="mt-2">© 2024 GDP Studio Inc. All rights reserved.</p>
        </div>
      </div>
    </aside>
  );
}

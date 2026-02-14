import { Home, Building2, List, Briefcase, User, LogOut, Menu, X, Settings2 } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { title: "홈", url: "/", icon: Home },
  { title: "피투자사 추가", url: "/add-investee", icon: Building2 },
  { title: "피투자사 목록", url: "/investees", icon: List },
  { title: "펀드 관리", url: "/funds", icon: Briefcase },
  { title: "보고서 설정", url: "/report-settings", icon: Settings2 },
  { title: "프로필", url: "/profile", icon: User },
];

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "로그아웃 실패",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/login");
    }
  };

  return (
    <>
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
                  onClick={onItemClick}
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
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
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
          <p className="leading-relaxed">
            주소 | 경기도 성남시 대왕판교로 625번길 13 경기창조혁신센터 8층
          </p>
          <p>이메일 | help@certifie.io</p>
          <p>전화번호 | 010-6212-0225</p>
          <p className="mt-2">© 2026 GDP Studio Inc. All rights reserved.</p>
        </div>
      </div>
    </>
  );
}

// Desktop Sidebar
export function AppSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[250px] flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <SidebarContent />
    </aside>
  );
}

// Mobile Sidebar (Sheet)
export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">메뉴 열기</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 bg-sidebar border-sidebar-border">
        <div className="flex h-full flex-col">
          <SidebarContent onItemClick={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { ReactNode } from "react";
import { AppSidebar, MobileSidebar } from "./AppSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-secondary/30">
      {/* Desktop Sidebar */}
      <AppSidebar />
      
      {/* Main Content */}
      <main className="flex-1 min-h-screen md:ml-[250px]">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background px-4 md:hidden">
          <MobileSidebar />
          <h1 className="text-xl font-bold text-primary">
            Certed<span className="text-primary">+</span>
          </h1>
        </header>
        
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-secondary/30">
      <AppSidebar />
      <main className="flex-1 ml-[250px] min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

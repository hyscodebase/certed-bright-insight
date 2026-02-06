import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-secondary/30">
      <AppSidebar />
      <main className="ml-sidebar min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

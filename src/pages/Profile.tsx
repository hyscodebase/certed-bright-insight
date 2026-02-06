import { User } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function Profile() {
  return (
    <DashboardLayout>
      <PageHeader title="프로필" icon={<User className="h-6 w-6" />} />

      <Card className="max-w-xl animate-fade-in border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">관리자</h3>
              <p className="text-sm text-muted-foreground">admin@certifie.io</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted-foreground">회사</span>
              <span className="font-medium">GDP Studio Inc.</span>
            </div>
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted-foreground">직책</span>
              <span className="font-medium">투자 매니저</span>
            </div>
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted-foreground">가입일</span>
              <span className="font-medium">2024.01.15</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

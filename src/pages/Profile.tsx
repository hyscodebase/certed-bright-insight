import { User } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function Profile() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || "사용자";
  const companyName = profile?.company_name || "-";
  const createdAt = user?.created_at ? format(new Date(user.created_at), "yyyy.MM.dd") : "-";

  return (
    <DashboardLayout>
      <PageHeader title="프로필" icon={<User className="h-6 w-6" />} />

      <Card className="mx-auto max-w-xl animate-fade-in border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{displayName}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted-foreground">회사</span>
              <span className="font-medium">{companyName}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-4">
              <span className="text-muted-foreground">가입일</span>
              <span className="font-medium">{createdAt}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [profileChecked, setProfileChecked] = useState(false);
  const [hasCompanyName, setHasCompanyName] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfileChecked(true);
      return;
    }

    supabase
      .from("profiles")
      .select("company_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setHasCompanyName(!!data?.company_name);
        setProfileChecked(true);
      });
  }, [user]);

  if (loading || !profileChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasCompanyName && location.pathname !== "/complete-profile") {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
}

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: "investor" | "investee";
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [profileChecked, setProfileChecked] = useState(false);
  const [hasCompanyName, setHasCompanyName] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfileChecked(true);
      setRoleChecked(true);
      return;
    }

    // Fetch profile and role in parallel
    Promise.all([
      supabase
        .from("profiles")
        .select("company_name")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id),
    ]).then(([profileResult, roleResult]) => {
      setHasCompanyName(!!profileResult.data?.company_name);
      setProfileChecked(true);
      // Pick the first role found
      const roles = roleResult.data || [];
      setUserRole(roles.length > 0 ? roles[0].role : null);
      setRoleChecked(true);
    });
  }, [user]);

  if (loading || !profileChecked || !roleChecked) {
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

  // No role assigned yet → go to complete-profile
  if (!userRole && location.pathname !== "/complete-profile") {
    return <Navigate to="/complete-profile" replace />;
  }

  // Profile incomplete (no company name) → complete profile
  if (!hasCompanyName && location.pathname !== "/complete-profile") {
    return <Navigate to="/complete-profile" replace />;
  }

  // Role-based access control
  if (allowedRole && userRole && userRole !== allowedRole) {
    // Redirect to appropriate dashboard
    if (userRole === "investee") {
      return <Navigate to="/investee" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SubmitReport from "./SubmitReport";

/**
 * Wrapper for the SubmitReport page that resolves a report_request ID
 * to its token, allowing investee users to submit from their dashboard.
 */
export default function InvesteeSubmitReport() {
  const { requestId } = useParams<{ requestId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId || !user) return;

    supabase
      .from("report_requests")
      .select("request_token")
      .eq("id", requestId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.request_token) {
          setToken(data.request_token);
        }
        setLoading(false);
      });
  }, [requestId, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">유효하지 않은 요청입니다.</p>
      </div>
    );
  }

  // Render SubmitReport with the token as a query param
  // We'll use window.history to set the search param without navigating
  return <SubmitReportWithToken token={token} />;
}

function SubmitReportWithToken({ token }: { token: string }) {
  // Temporarily set the URL search params for SubmitReport to read
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("token", token);
    window.history.replaceState({}, "", url.toString());
    return () => {
      // Clean up
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("token");
      window.history.replaceState({}, "", cleanUrl.toString());
    };
  }, [token]);

  return <SubmitReport />;
}

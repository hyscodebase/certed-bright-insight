import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading");
  const [companyName, setCompanyName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("유효하지 않은 초대 링크입니다.");
      return;
    }

    acceptInvitation();
  }, [token]);

  const acceptInvitation = async () => {
    try {
      // Use the SECURITY DEFINER function to accept invitation
      const { data, error } = await supabase.rpc("accept_invitation", {
        p_invitation_token: token,
      });

      if (error) {
        throw error;
      }

      const result = data as {
        success: boolean;
        error?: string;
        company_name?: string;
        already_accepted?: boolean;
      };

      if (!result.success) {
        if (result.error === "invitation_not_found") {
          setStatus("error");
          setErrorMessage("초대를 찾을 수 없습니다.");
        } else if (result.error === "expired") {
          setStatus("expired");
        } else {
          setStatus("error");
          setErrorMessage("초대 수락 중 오류가 발생했습니다.");
        }
        return;
      }

      setCompanyName(result.company_name || "");
      setStatus("success");
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      setStatus("error");
      setErrorMessage(error.message || "초대 수락 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardContent className="p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin mb-4" />
              <h1 className="text-xl font-semibold text-foreground mb-2">
                초대 처리 중...
              </h1>
              <p className="text-muted-foreground">잠시만 기다려주세요.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="h-16 w-16 mx-auto text-primary mb-4" />
              <h1 className="text-xl font-semibold text-foreground mb-2">
                연동 완료!
              </h1>
              <p className="text-muted-foreground mb-6">
                <span className="font-medium text-foreground">{companyName}</span>이(가)
                성공적으로 등록되었습니다.
              </p>
              <Button onClick={() => navigate("/login")} className="w-full">
                로그인 페이지로 이동
              </Button>
            </>
          )}

          {status === "expired" && (
            <>
              <XCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h1 className="text-xl font-semibold text-foreground mb-2">
                초대가 만료되었습니다
              </h1>
              <p className="text-muted-foreground mb-6">
                이 초대 링크는 만료되었습니다. 투자사에 새로운 초대를 요청해주세요.
              </p>
              <Button variant="outline" onClick={() => navigate("/")}>
                홈으로 이동
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
              <h1 className="text-xl font-semibold text-foreground mb-2">
                오류가 발생했습니다
              </h1>
              <p className="text-muted-foreground mb-6">{errorMessage}</p>
              <Button variant="outline" onClick={() => navigate("/")}>
                홈으로 이동
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

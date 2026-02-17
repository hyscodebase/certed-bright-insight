import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !user) return;

    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ company_name: companyName.trim() })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "저장 실패",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "투자사명이 저장되었습니다." });
      navigate("/", { replace: true });
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground">
              Certed<span className="text-primary">+</span>
            </h1>
          </div>

          <div className="rounded-2xl bg-card p-8">
            <h2 className="mb-2 text-center text-2xl font-medium text-foreground">
              투자사명 입력
            </h2>
            <p className="mb-8 text-center text-sm text-muted-foreground">
              서비스 이용을 위해 투자사명을 입력해주세요.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">
                  투자사명 <span className="text-primary">*</span>
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="투자사명을 입력하세요"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="h-12 rounded-lg border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !companyName.trim()}
                className="h-12 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "저장 중..." : "시작하기"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

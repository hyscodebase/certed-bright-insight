import { useState } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  disabled?: boolean;
}

export function EmailVerification({ email, onVerified, disabled }: EmailVerificationProps) {
  const { toast } = useToast();
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) {
      toast({ title: "이메일을 먼저 입력해주세요.", variant: "destructive" });
      return;
    }

    setSending(true);
    const { error } = await supabase.functions.invoke("send-verification-code", {
      body: { email, purpose: "invite" },
    });

    if (error) {
      toast({ title: "인증코드 발송 실패", description: error.message, variant: "destructive" });
    } else {
      setCodeSent(true);
      toast({ title: "인증코드가 발송되었습니다.", description: "이메일을 확인해주세요." });
    }
    setSending(false);
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) return;

    setVerifying(true);
    // Check verification code in DB
    const { data, error } = await supabase
      .from("email_verifications")
      .select("*")
      .eq("email", email)
      .eq("code", code.trim())
      .eq("purpose", "invite")
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      toast({ title: "인증 실패", description: "인증코드가 올바르지 않거나 만료되었습니다.", variant: "destructive" });
    } else {
      // Mark as verified
      await supabase
        .from("email_verifications")
        .update({ verified: true })
        .eq("id", data.id);

      setVerified(true);
      toast({ title: "이메일 인증 완료" });
      onVerified();
    }
    setVerifying(false);
  };

  if (verified) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-primary">이메일 인증 완료</span>
      </div>
    );
  }

  if (codeSent) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-sm text-muted-foreground">
            <Mail className="mr-1.5 inline h-4 w-4" />
            <strong>{email}</strong>로 인증코드가 발송되었습니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="인증코드 6자리"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            className="h-11"
          />
          <Button onClick={handleVerifyCode} disabled={verifying || code.length < 6} className="shrink-0">
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "확인"}
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSendCode} disabled={sending} className="text-xs">
          인증코드 재발송
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSendCode}
      disabled={disabled || sending || !email.trim()}
      className="w-full gap-2"
    >
      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
      {sending ? "발송 중..." : "이메일 인증하기"}
    </Button>
  );
}

import { useState, useEffect } from "react";
import { TrendingUp, Search, Mail, Loader2, CheckCircle2, X, LinkIcon } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { EmailVerification } from "@/components/invitations/EmailVerification";

interface ConnectionRequest {
  id: string;
  target_email: string;
  status: string;
  created_at: string;
  requester_role: string;
}

export default function InvestorConnect() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;
    
    // Fetch connection requests where I'm the target (investee receiving from investor)
    const { data: received } = await supabase
      .from("connection_requests")
      .select("*")
      .eq("target_user_id", user.id)
      .eq("requester_role", "investor")
      .order("created_at", { ascending: false });

    // Fetch my sent requests (investee inviting investor)
    const { data: sent } = await supabase
      .from("connection_requests")
      .select("*")
      .eq("requester_user_id", user.id)
      .eq("requester_role", "investee")
      .order("created_at", { ascending: false });

    setReceivedRequests((received as ConnectionRequest[]) || []);
    setSentRequests((sent as ConnectionRequest[]) || []);
    setLoading(false);
  };

  const handleSendInvite = async () => {
    if (!user || !email.trim() || !emailVerified) return;
    setSending(true);

    try {
      const { error } = await supabase
        .from("connection_requests")
        .insert({
          requester_user_id: user.id,
          requester_role: "investee",
          target_email: email.trim(),
        });

      if (error) throw error;

      // Also send notification email
      await supabase.functions.invoke("send-invitation-email", {
        body: {
          company_name: "투자사",
          contact_email: email.trim(),
          invitation_token: crypto.randomUUID(),
          investor_company_name: "피투자사",
        },
      });

      toast({ title: "연동 요청이 발송되었습니다." });
      setEmail("");
      setEmailVerified(false);
      fetchRequests();
    } catch (error: any) {
      toast({ title: "요청 실패", description: error.message, variant: "destructive" });
    }
    setSending(false);
  };

  const handleAccept = async (requestId: string) => {
    const { error } = await supabase
      .from("connection_requests")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (error) {
      toast({ title: "수락 실패", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "연동 요청을 수락했습니다." });
      fetchRequests();
    }
  };

  const handleReject = async (requestId: string) => {
    const { error } = await supabase
      .from("connection_requests")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (error) {
      toast({ title: "거절 실패", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "연동 요청을 거절했습니다." });
      fetchRequests();
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="secondary">대기중</Badge>;
      case "accepted": return <Badge className="bg-primary/10 text-primary border-primary/30">수락됨</Badge>;
      case "rejected": return <Badge variant="destructive">거절됨</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="투자사 연동" icon={<LinkIcon className="h-6 w-6" />} />

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Send invite to investor */}
        <Card className="animate-fade-in border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              투자사 초대하기
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              투자사의 이메일 주소를 입력하여 연동을 요청하세요. 이메일 인증 후 초대가 발송됩니다.
            </p>
            <div className="space-y-2">
              <Label htmlFor="investorEmail">투자사 이메일</Label>
              <Input
                id="investorEmail"
                type="email"
                placeholder="투자사 담당자 이메일을 입력하세요"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailVerified(false); }}
                className="h-11"
              />
            </div>
            
            {email.trim() && !emailVerified && (
              <EmailVerification
                email={email}
                onVerified={() => setEmailVerified(true)}
              />
            )}

            {emailVerified && (
              <Button onClick={handleSendInvite} disabled={sending} className="w-full gap-2">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                {sending ? "발송 중..." : "연동 요청 보내기"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Received requests from investors */}
        {receivedRequests.length > 0 && (
          <Card className="animate-fade-in border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium">받은 연동 요청</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {receivedRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{req.target_email}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(req.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {req.status === "pending" ? (
                        <>
                          <Button size="sm" onClick={() => handleAccept(req.id)} className="gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            수락
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(req.id)} className="gap-1">
                            <X className="h-3.5 w-3.5" />
                            거절
                          </Button>
                        </>
                      ) : statusBadge(req.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sent requests */}
        {sentRequests.length > 0 && (
          <Card className="animate-fade-in border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-medium">보낸 연동 요청</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sentRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{req.target_email}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(req.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    {statusBadge(req.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

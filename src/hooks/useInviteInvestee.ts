import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useInviteInvestee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { company_name: string; contact_email: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("로그인이 필요합니다");

      // Generate unique invitation token
      const invitationToken = crypto.randomUUID();

      // Create invitation record
      const { data: invitation, error: insertError } = await supabase
        .from("investee_invitations")
        .insert({
          user_id: user.user.id,
          company_name: data.company_name,
          contact_email: data.contact_email,
          invitation_token: invitationToken,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Send invitation email via edge function
      const { error: emailError } = await supabase.functions.invoke(
        "send-invitation-email",
        {
          body: {
            company_name: data.company_name,
            contact_email: data.contact_email,
            invitation_token: invitationToken,
          },
        }
      );

      if (emailError) {
        // Delete the invitation if email fails
        await supabase
          .from("investee_invitations")
          .delete()
          .eq("id", invitation.id);
        throw new Error("이메일 발송에 실패했습니다. 다시 시도해주세요.");
      }

      return invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investee_invitations"] });
      toast({
        title: "초대 이메일 발송 완료",
        description: "피투자사 담당자에게 초대 이메일이 발송되었습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "초대 발송 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VerificationRequest {
  email: string;
  purpose: string; // 'invite'
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Authorization required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Invalid token");

    const { email, purpose }: VerificationRequest = await req.json();
    if (!email) throw new Error("Email is required");

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store verification code
    const { error: insertError } = await supabase
      .from("email_verifications")
      .insert({
        email,
        code,
        user_id: user.id,
        purpose: purpose || "invite",
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });

    if (insertError) throw insertError;

    // Send email
    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");
    if (!gmailUser || !gmailPassword) throw new Error("Gmail credentials not configured");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPassword },
    });

    const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <tr><td style="background-color:#3B5BDB;padding:24px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Certed</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 16px;font-size:18px;color:#1a1a1a;">이메일 인증 코드</h2>
          <p style="margin:0 0 24px;font-size:14px;color:#4a4a4a;line-height:1.6;">
            아래 인증 코드를 입력하여 이메일을 확인해주세요.<br>
            인증 코드는 10분간 유효합니다.
          </p>
          <div style="text-align:center;margin:24px 0;">
            <span style="display:inline-block;padding:16px 32px;background-color:#f4f4f4;border-radius:8px;font-size:32px;font-weight:700;letter-spacing:8px;color:#3B5BDB;">${code}</span>
          </div>
          <p style="margin:24px 0 0;font-size:12px;color:#888;">
            본 인증 코드를 요청하지 않았다면 이 이메일을 무시해주세요.
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #e5e5e5;">
          <p style="margin:0;font-size:11px;color:#aaa;">
            © 2026 GDP Studio Inc. All rights reserved.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: gmailUser,
      to: email,
      subject: "[Certed] 이메일 인증 코드",
      html: emailHtml,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

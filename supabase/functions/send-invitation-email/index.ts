import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface InvitationRequest {
  company_name: string;
  contact_email: string;
  invitation_token: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_name, contact_email, invitation_token }: InvitationRequest = await req.json();

    if (!company_name || !contact_email || !invitation_token) {
      throw new Error("Missing required fields");
    }

    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!gmailUser || !gmailPassword) {
      throw new Error("Gmail credentials not configured");
    }

    const acceptUrl = `https://plus.certed.io/accept-invitation?token=${invitation_token}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #3B5BDB; padding: 24px 32px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Certed</h1>
              <p style="margin: 4px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Request for cooperation</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px;">
              <div style="height: 4px; background: linear-gradient(90deg, #3B5BDB 0%, #748FFC 100%); margin-top: 0;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #1a1a1a;">
                <span style="font-weight: 400;">${company_name}</span> 담당자님,
              </h2>
              <p style="margin: 0 0 4px 0; font-size: 16px; color: #3B5BDB; font-weight: 600;">빅베이슨 캐피털</p>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #1a1a1a;">과 써티드 연동을 진행해주세요.</p>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #4a4a4a; line-height: 1.6;">
                안녕하세요. ${company_name} 담당자님,<br>
                투자사 빅베이슨 캐피털의 써티드 연동 요청이 있습니다.<br>
                써티드는 경력증명서 및 각종 HR 문서 작성 서비스로써<br>
                투자사와 피투자사 간의 주주보고서 공유 기능도 제공하고 있습니다.<br>
                써티드에 회원가입을 하시면 빅베이슨 캐피털과 연동되어<br>
                편리하게 주주보고서를 연동 시킬 수 있습니다.
              </p>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #4a4a4a; line-height: 1.6;">
                아래 '<span style="color: #3B5BDB; font-weight: 500;">써티드 투자사 연동하기</span>' 버튼을 클릭하여 빅베이슨 캐피털 과<br>
                써티드 연동을 진행하여 주시기 바랍니다.
              </p>
              <p style="margin: 0 0 32px 0; font-size: 12px; color: #888888;">
                ※ 약관은 본 메일의 첨부파일로 첨부되어있습니다.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top: 1px solid #e5e5e5; padding-top: 24px;" align="center">
                    <a href="${acceptUrl}" style="display: inline-block; background-color: #3B5BDB; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 600;">
                      써티드 투자사 연동하기
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #888888;">
                <a href="#" style="color: #888888; text-decoration: none;">개인정보 보호정책</a> | 
                <a href="#" style="color: #888888; text-decoration: none;">서비스 약관</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #aaaaaa; line-height: 1.5;">
                Home : www.certifie.io &nbsp;&nbsp; E-Mail : help@certifie.io<br>
                상호명 : 주식회사 지디피스튜디오 | 대표자 : 이유<br>
                사업자 등록번호 : 146-87-02284 | 전화번호 : 010-6212-0225<br>
                주소 : 경기도 성남시 대왕판교로 625번길 13 경기창조혁신센터 8층
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: gmailUser,
      to: contact_email,
      subject: `[빅베이슨 캐피털] ${company_name}님, 써티드 투자사 연동 요청`,
      html: emailHtml,
    });

    console.log("Invitation email sent successfully to:", contact_email);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending invitation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

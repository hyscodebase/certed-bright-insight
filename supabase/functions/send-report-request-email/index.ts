import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ReportRequestEmailParams {
  company_name: string;
  contact_email: string;
  request_token: string;
  report_period: string;
  investor_company_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_name, contact_email, request_token, report_period, investor_company_name }: ReportRequestEmailParams = await req.json();

    if (!company_name || !contact_email || !request_token) {
      throw new Error("Missing required fields");
    }

    const investorName = investor_company_name || "투자사";
    
    // Use provided report_period or fall back to current date
    const periodToUse = report_period || (() => {
      const currentDate = new Date();
      return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    })();

    // Format period for display based on format
    let reportMonth: string;
    if (/^\d{4}-Q\d$/.test(periodToUse)) {
      // Quarterly: "2026-Q1" -> "2026년 1분기"
      const [year, q] = periodToUse.split("-Q");
      reportMonth = `${year}년 ${q}분기`;
    } else if (/^\d{4}-H\d$/.test(periodToUse)) {
      // Semi-annual: "2026-H1" -> "2026년 상반기"
      const [year, h] = periodToUse.split("-H");
      reportMonth = `${year}년 ${h === "1" ? "상반기" : "하반기"}`;
    } else if (/^\d{4}$/.test(periodToUse)) {
      // Annual: "2026" -> "2026년"
      reportMonth = `${periodToUse}년`;
    } else {
      // Monthly: "2026-02" -> "2026년 02월"
      const [year, month] = periodToUse.split("-");
      reportMonth = `${year}년 ${month}월`;
    }

    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!gmailUser || !gmailPassword) {
      throw new Error("Gmail credentials not configured");
    }

    const reportUrl = `https://plus.certed.io/submit-report?token=${request_token}`;

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
              <p style="margin: 4px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">주주보고서 작성 요청</p>
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
              <p style="margin: 0 0 4px 0; font-size: 16px; color: #3B5BDB; font-weight: 600;">${reportMonth} 주주보고서 작성 요청</p>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #1a1a1a;">이 있습니다.</p>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #4a4a4a; line-height: 1.6;">
                안녕하세요. ${company_name} 담당자님,<br>
                ${investorName}에서 ${reportMonth} 주주보고서 작성을 요청하였습니다.<br><br>
                아래 버튼을 클릭하여 주주보고서를 작성해주시기 바랍니다.<br>
                작성이 완료되면 투자사에게 자동으로 공유됩니다.
              </p>
              <p style="margin: 0 0 32px 0; font-size: 12px; color: #888888;">
                ※ 이 링크는 14일 후에 만료됩니다.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top: 1px solid #e5e5e5; padding-top: 24px;" align="center">
                    <a href="${reportUrl}" style="display: inline-block; background-color: #3B5BDB; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 600;">
                      주주보고서 작성하기
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
      subject: `[${investorName}] ${company_name}님, ${reportMonth} 주주보고서 작성 요청`,
      html: emailHtml,
    });

    console.log("Report request email sent successfully to:", contact_email);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending report request email:", error);
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

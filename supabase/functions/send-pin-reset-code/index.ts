import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetCodeRequest {
  email: string;
}

// Generate a 6-digit verification code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email }: ResetCodeRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing PIN reset request for email: ${email}`);

    // Verify email exists in profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, user_id")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (profileError || !profile) {
      console.log("Profile not found for email:", email);
      // Return success anyway for security (don't reveal if email exists)
      return new Response(
        JSON.stringify({ success: true, message: "If your email exists, you will receive a verification code" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate verification code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log(`Generated code for user ${profile.user_id}, expires at ${expiresAt.toISOString()}`);

    // Store the code in app_settings (or a dedicated table)
    // Using user_id as key to prevent multiple codes
    const { error: settingsError } = await supabase
      .from("app_settings")
      .upsert({
        key: `pin_reset_${profile.user_id}`,
        value: { code, expires_at: expiresAt.toISOString(), attempts: 0 },
        description: "Transaction PIN reset verification code",
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (settingsError) {
      console.error("Failed to store verification code:", settingsError);
      return new Response(
        JSON.stringify({ error: "Failed to generate verification code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email with verification code
    const emailResponse = await resend.emails.send({
      from: "SM Data Sub <no-reply@smdatasub.com.ng>",
      to: [email],
      subject: "Transaction PIN Reset - Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Transaction PIN Reset</h1>
            </div>
            <div style="padding: 30px;">
              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                Hello ${profile.full_name || 'User'},
              </p>
              <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
                You requested to reset your transaction PIN. Use the verification code below:
              </p>
              <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">${code}</span>
              </div>
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                This code expires in <strong>10 minutes</strong>.
              </p>
              <p style="color: #6b7280; font-size: 14px;">
                If you didn't request this, please ignore this email or contact support if you're concerned about your account security.
              </p>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} SM Data. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Verification code sent to your email" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in send-pin-reset-code:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
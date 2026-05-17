import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyCodeRequest {
  email: string;
  code: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, code }: VerifyCodeRequest = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email and code are required" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Verifying PIN reset code for email: ${email}`);

    // Get profile by email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, user_id")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (profileError || !profile) {
      console.log("Profile not found for email:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email or code" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get stored verification code
    const { data: settings, error: settingsError } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", `pin_reset_${profile.user_id}`)
      .single();

    if (settingsError || !settings) {
      console.log("No verification code found for user");
      return new Response(
        JSON.stringify({ error: "No verification code found. Please request a new one." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const storedData = settings.value as { code: string; expires_at: string; attempts: number };

    // Check if code has expired
    if (new Date(storedData.expires_at) < new Date()) {
      // Delete expired code
      await supabase.from("app_settings").delete().eq("key", `pin_reset_${profile.user_id}`);
      return new Response(
        JSON.stringify({ error: "Verification code has expired. Please request a new one." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check max attempts (5 attempts max)
    if (storedData.attempts >= 5) {
      // Delete code after too many attempts
      await supabase.from("app_settings").delete().eq("key", `pin_reset_${profile.user_id}`);
      return new Response(
        JSON.stringify({ error: "Too many failed attempts. Please request a new code." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify code
    if (storedData.code !== code) {
      // Increment attempts
      await supabase
        .from("app_settings")
        .update({ 
          value: { ...storedData, attempts: storedData.attempts + 1 },
          updated_at: new Date().toISOString()
        })
        .eq("key", `pin_reset_${profile.user_id}`);

      const remainingAttempts = 5 - (storedData.attempts + 1);
      return new Response(
        JSON.stringify({ 
          error: `Invalid code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.` 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Code is valid - delete it so it can't be reused
    await supabase.from("app_settings").delete().eq("key", `pin_reset_${profile.user_id}`);

    console.log("PIN reset code verified successfully for user:", profile.user_id);

    // Return a reset token (just a flag for the frontend to proceed)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Code verified successfully",
        resetToken: `reset_${profile.user_id}_${Date.now()}`
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in verify-pin-reset-code:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return new Response(
        JSON.stringify({ error: "Email, code, and new password are required" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find user via profiles (reliable for any number of users)
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Invalid email or code" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const user = { id: profile.user_id };

    // Get stored code
    const { data: settings } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", `pwd_reset_${user.id}`)
      .single();

    if (!settings) {
      return new Response(
        JSON.stringify({ error: "No verification code found. Please request a new one." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const storedData = settings.value as { code: string; expires_at: string; attempts: number };

    // Check expiry
    if (new Date(storedData.expires_at) < new Date()) {
      await supabase.from("app_settings").delete().eq("key", `pwd_reset_${user.id}`);
      return new Response(
        JSON.stringify({ error: "Code has expired. Please request a new one." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check attempts
    if (storedData.attempts >= 5) {
      await supabase.from("app_settings").delete().eq("key", `pwd_reset_${user.id}`);
      return new Response(
        JSON.stringify({ error: "Too many failed attempts. Please request a new code." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify code
    if (storedData.code !== code) {
      await supabase
        .from("app_settings")
        .update({
          value: { ...storedData, attempts: storedData.attempts + 1 },
          updated_at: new Date().toISOString()
        })
        .eq("key", `pwd_reset_${user.id}`);

      const remaining = 5 - (storedData.attempts + 1);
      return new Response(
        JSON.stringify({ error: `Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Code valid — update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateError) {
      console.error("Password update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update password. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete used code
    await supabase.from("app_settings").delete().eq("key", `pwd_reset_${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: "Password updated successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

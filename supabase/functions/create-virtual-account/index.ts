import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateVirtualAccountRequest {
  userId: string;
  email: string;
  name: string;
  phoneNumber: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const paymentPointApiSecret = Deno.env.get("PAYMENTPOINT_API_SECRET")!;
    const paymentPointApiKey = Deno.env.get("PAYMENTPOINT_API_KEY")!;
    const paymentPointBusinessId = Deno.env.get("PAYMENTPOINT_BUSINESS_ID")!;

    // Validate JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      console.error("Invalid JWT:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authenticatedUserId = claimsData.user.id;
    console.log("Authenticated user:", authenticatedUserId);

    // Use service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, email, name, phoneNumber: rawPhone }: CreateVirtualAccountRequest = await req.json();

    // Verify the request is for the authenticated user
    if (userId !== authenticatedUserId) {
      console.error("User ID mismatch:", userId, authenticatedUserId);
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize phone number: strip spaces, dashes, and convert +234 prefix to 0
    let phoneNumber = (rawPhone || "").replace(/[\s\-()]/g, "");
    if (phoneNumber.startsWith("+234")) {
      phoneNumber = "0" + phoneNumber.slice(4);
    } else if (phoneNumber.startsWith("234") && phoneNumber.length === 13) {
      phoneNumber = "0" + phoneNumber.slice(3);
    }

    // Validate: must be exactly 11 digits
    if (!/^\d{11}$/.test(phoneNumber)) {
      console.error("Invalid phone number:", phoneNumber, "from raw:", rawPhone);
      return new Response(
        JSON.stringify({ error: "Invalid phone number", details: { status: "fail", message: "Phone number must be 11 digits (e.g. 08012345678)" } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Creating virtual account for user: ${userId}, email: ${email}, phone: ${phoneNumber}`);

    // Call PaymentPoint API to create virtual account
    const paymentPointResponse = await fetch("https://api.paymentpoint.co/api/v1/createVirtualAccount", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paymentPointApiSecret}`,
        "Content-Type": "application/json",
        "api-key": paymentPointApiKey,
      },
      body: JSON.stringify({
        email: email,
        name: name,
        phoneNumber: phoneNumber,
        bankCode: ["20946"], // PalmPay
        businessId: paymentPointBusinessId,
      }),
    });

    const paymentPointData = await paymentPointResponse.json();
    console.log("PaymentPoint response:", JSON.stringify(paymentPointData));

    if (paymentPointData.status !== "success") {
      console.error("PaymentPoint error:", paymentPointData);
      return new Response(
        JSON.stringify({ error: "Failed to create virtual account", details: paymentPointData }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the first bank account from the response
    const bankAccount = paymentPointData.bankAccounts?.[0];
    if (!bankAccount) {
      console.error("No bank account in response");
      return new Response(
        JSON.stringify({ error: "No bank account returned from PaymentPoint" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the user's profile with the virtual account number and name
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        account_number: bankAccount.accountNumber,
        virtual_account_name: bankAccount.accountName,
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update profile", details: updateError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully created virtual account: ${bankAccount.accountNumber} for user: ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        accountNumber: bankAccount.accountNumber,
        bankName: bankAccount.bankName,
        accountName: bankAccount.accountName,
        customerId: paymentPointData.customer?.customer_id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error creating virtual account:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

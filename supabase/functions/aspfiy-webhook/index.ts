import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHash } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-wiaxy-signature",
};

interface AspfiyWebhook {
  event: string;
  data: {
    type?: string;
    reference?: string;
    merchant_reference?: string;
    aspfiy_ref?: string;
    amount?: string | number;
    created_at?: string;
    account?: {
      account_number?: string;
      account_name?: string;
      bank_name?: string;
      created_at?: string;
    };
    payer?: {
      account_number?: string;
      first_name?: string;
      last_name?: string;
      createdAt?: string;
    };
  };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const aspfiySecretKey = Deno.env.get("ASPFIY_SECRET_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const rawBody = await req.text();
    console.log("Aspfiy webhook payload:", rawBody);

    // Verify x-wiaxy-signature = MD5(secret key)
    const signature = req.headers.get("x-wiaxy-signature");
    const expected = createHash("md5").update(aspfiySecretKey).digest("hex");
    if (signature && signature.toLowerCase() !== expected.toLowerCase()) {
      console.error("Invalid Aspfiy webhook signature");
      return json({ error: "Invalid signature" }, 401);
    }

    const payload: AspfiyWebhook = JSON.parse(rawBody);

    if (payload.event !== "PAYMENT_NOTIFIFICATION" && payload.event !== "PAYMENT_NOTIFICATION") {
      console.log("Ignoring non-payment event:", payload.event);
      return json({ message: "ignored" });
    }
    if (payload.data?.type !== "RESERVED_ACCOUNT_TRANSACTION") {
      console.log("Ignoring non-reserved-account event:", payload.data?.type);
      return json({ message: "ignored" });
    }

    const merchantRef = payload.data.merchant_reference; // we set this to user_id
    const accountNumber = payload.data.account?.account_number;
    const transactionRef = payload.data.reference || payload.data.aspfiy_ref;
    const amount = Number(payload.data.amount || 0);

    if (!transactionRef || !amount || amount <= 0) {
      return json({ error: "Invalid payload" }, 400);
    }

    // Locate profile by merchant_reference (user_id) first, fall back to account_number
    let profile: { user_id: string; full_name: string } | null = null;

    if (merchantRef) {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .eq("user_id", merchantRef)
        .maybeSingle();
      if (data) profile = data as any;
    }
    if (!profile && accountNumber) {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .eq("account_number", accountNumber)
        .maybeSingle();
      if (data) profile = data as any;
    }

    if (!profile) {
      console.error("Profile not found for payload", { merchantRef, accountNumber });
      return json({ error: "User not found" }, 404);
    }

    // If profile is missing the account details (created post-webhook), persist them now
    if (accountNumber) {
      await supabase
        .from("profiles")
        .update({
          account_number: accountNumber,
          virtual_account_name: payload.data.account?.account_name || profile.full_name,
        })
        .eq("user_id", profile.user_id)
        .is("virtual_account_name", null);
    }

    // Duplicate-guard
    const { data: existingTxn } = await supabase
      .from("transactions")
      .select("id")
      .eq("reference", transactionRef)
      .maybeSingle();
    if (existingTxn) {
      console.log("Already processed:", transactionRef);
      return json({ message: "duplicate" });
    }

    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id, balance")
      .eq("user_id", profile.user_id)
      .single();
    if (walletError || !wallet) return json({ error: "Wallet not found" }, 404);

    const newBalance = Number(wallet.balance) + amount;
    const { error: updateError } = await supabase
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);
    if (updateError) return json({ error: "Failed to update wallet" }, 500);

    const payerName = [payload.data.payer?.first_name, payload.data.payer?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || "Unknown Sender";

    await supabase.from("transactions").insert({
      user_id: profile.user_id,
      type: "credit",
      category: "deposit",
      amount,
      description: `Deposit from ${payerName}`,
      reference: transactionRef,
      status: "completed",
      metadata: {
        sender_name: payerName,
        sender_account: payload.data.payer?.account_number,
        aspfiy_ref: payload.data.aspfiy_ref,
        timestamp: payload.data.created_at,
      },
    });

    await supabase.from("notifications").insert({
      user_id: profile.user_id,
      title: "Deposit Successful",
      message: `₦${amount.toLocaleString()} has been credited to your wallet from ${payerName}`,
      type: "transaction",
    });

    // Push notification
    try {
      const { data: pushSubs } = await supabase
        .from("push_subscriptions")
        .select("endpoint")
        .eq("user_id", profile.user_id);
      for (const sub of pushSubs || []) {
        await supabase.functions.invoke("send-push-notification", {
          body: {
            token: sub.endpoint,
            title: "💰 Deposit Received!",
            body: `₦${amount.toLocaleString()} credited from ${payerName}`,
            data: { type: "deposit", amount: String(amount), reference: transactionRef, route: "/history" },
          },
        });
      }
    } catch (e) {
      console.error("Push error:", e);
    }

    return json({ success: true, newBalance });
  } catch (e: unknown) {
    console.error("Aspfiy webhook error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return json({ error: msg }, 500);
  }
});
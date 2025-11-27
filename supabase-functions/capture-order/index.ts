// Supabase Edge Function: capture-order
// Deploy this to: supabase/functions/capture-order/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID")!;
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET")!;
const PAYPAL_API_BASE = Deno.env.get("PAYPAL_API_BASE") || "https://api-m.sandbox.paypal.com";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? ""
        );

        const { orderId, paymentId, captureInfo, payer_email, payer_name } = await req.json();

        // Get PayPal access token
        const authResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
            },
            body: "grant_type=client_credentials",
        });

        const authData = await authResponse.json();
        const accessToken = authData.access_token;

        // Capture the PayPal order (if not already captured)
        let captureData = captureInfo;
        if (!captureInfo) {
            const captureResponse = await fetch(
                `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            captureData = await captureResponse.json();
        }

        // Extract payment information
        const capture = captureData?.purchase_units?.[0]?.payments?.captures?.[0];
        const captureId = capture?.id;
        const amountPaidUSD = parseFloat(capture?.amount?.value || "0");
        const payerEmailFinal = payer_email || captureData?.payer?.email_address;

        // Update payment record in database
        const { data: paymentRecord, error: updateError } = await supabaseClient
            .from("payment_details")
            .update({
                status: "completed",
                paypal_capture_id: captureId,
                transaction_id: captureId,
                amount_paid_usd: amountPaidUSD,
                payer_email: payerEmailFinal,
                payer_name: payer_name,
                finished_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq("id", paymentId)
            .select()
            .single();

        if (updateError) {
            console.error("Payment update error:", updateError);
            return new Response(
                JSON.stringify({ ok: false, error: "update_failed", details: updateError }),
                {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // Update user's profile with premium plan
        const { error: profileUpdateError } = await supabaseClient
            .from("profiles")
            .update({
                plan_tier: "premium",
                plan_status: "active",
                plan_started_at: paymentRecord.plan_started_at,
                plan_renews_at: paymentRecord.plan_ends_at,
                updated_at: new Date().toISOString(),
            })
            .eq("id", paymentRecord.user_id);

        if (profileUpdateError) {
            console.error("Profile update error:", profileUpdateError);
        }

        return new Response(
            JSON.stringify({
                ok: true,
                captureId: captureId,
                paymentRecord: paymentRecord,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Capture error:", error);
        return new Response(
            JSON.stringify({
                ok: false,
                error: "capture_failed",
                message: error.message,
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});

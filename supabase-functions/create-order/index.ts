// Supabase Edge Function: create-order
// Deploy this to: supabase/functions/create-order/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID")!;
const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET")!;
const PAYPAL_API_BASE = Deno.env.get("PAYPAL_API_BASE") || "https://api-m.sandbox.paypal.com";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-token",
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Get Supabase client
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: {
                    headers: { Authorization: req.headers.get("Authorization")! },
                },
            }
        );

        // Get user token from header
        const userToken = req.headers.get("x-user-token");

        // Verify user exists in auth.users
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(userToken || undefined);

        if (authError || !user) {
            return new Response(
                JSON.stringify({
                    ok: false,
                    error: "unauthorized",
                    message: "You must be logged in to make a payment. Please sign in first.",
                }),
                {
                    status: 401,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // Parse request body
        const { amount, currency, user_id, email, metadata } = await req.json();

        // Validate user_id matches authenticated user
        if (user_id !== user.id) {
            return new Response(
                JSON.stringify({
                    ok: false,
                    error: "forbidden",
                    message: "User ID mismatch. Cannot process payment for another user.",
                }),
                {
                    status: 403,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // Ensure profile exists in profiles table
        const { data: existingProfile } = await supabaseClient
            .from("profiles")
            .select("id, email")
            .eq("id", user.id)
            .maybeSingle();

        if (!existingProfile) {
            console.log("Creating profile for user:", user.email);
            const { error: profileError } = await supabaseClient
                .from("profiles")
                .insert([
                    {
                        id: user.id,
                        email: user.email,
                        plan_tier: "free",
                        plan_status: "active",
                        plan_started_at: new Date().toISOString(),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                ]);

            if (profileError) {
                console.error("Failed to create profile:", profileError);
            }
        }

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

        // Create PayPal order
        const orderResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: currency,
                            value: amount.toFixed(2),
                        },
                        description: `Premium Monthly Plan - ${metadata?.plan || "premium_monthly"}`,
                    },
                ],
            }),
        });

        const orderData = await orderResponse.json();

        if (!orderResponse.ok) {
            throw new Error(`PayPal order creation failed: ${JSON.stringify(orderData)}`);
        }

        // Calculate plan dates (monthly subscription)
        const planStartDate = new Date();
        const planEndDate = new Date();
        planEndDate.setMonth(planEndDate.getMonth() + 1); // Add 1 month

        // Insert payment record into database
        const { data: paymentRecord, error: paymentError } = await supabaseClient
            .from("payment_details")
            .insert([
                {
                    user_id: user.id,
                    email: user.email,
                    amount: amount,
                    currency: currency,
                    status: "created",
                    paypal_order_id: orderData.id,
                    payment_mode: metadata?.source || "paypal",
                    plan_type: "premium_monthly",
                    plan_started_at: planStartDate.toISOString(),
                    plan_ends_at: planEndDate.toISOString(),
                    created_at: new Date().toISOString(),
                },
            ])
            .select()
            .single();

        if (paymentError) {
            console.error("Payment insert error:", paymentError);
            return new Response(
                JSON.stringify({
                    ok: false,
                    error: "supabase_insert_failed",
                    details: JSON.stringify(paymentError),
                }),
                {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        return new Response(
            JSON.stringify({
                ok: true,
                orderId: orderData.id,
                paymentId: paymentRecord.id,
                planStartDate: planStartDate.toISOString(),
                planEndDate: planEndDate.toISOString(),
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({
                ok: false,
                error: "internal_error",
                message: error.message,
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { CreditCard, Check, Menu, Zap } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../integrations/supabase/client";
import { showToast } from "../components/ui/toast";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// ───────────────── CONFIG ─────────────────
const PREMIUM_PRICE = 9.99;
const CREDITS_PER_PURCHASE = 3;
const USAGE_TABLE_NAME = "job_requests"; // Changed from careercasts to match our schema

type CountryCode = "US" | "GB" | "OTHER";

interface PaymentMetadata {
  plan?: string;
  source?: string;
  plan_started_at?: string;
  plan_renews_at?: string;
  raw_paypal?: any;
  [key: string]: any;
}

interface PaymentDetail {
  id: string;
  user_id: string | null;
  email: string | null;
  amount: number;
  currency: string;
  amount_paid_usd?: number | null;
  created_at: string;
  finished_at?: string | null;
  status: "created" | "pending" | "completed" | "failed";
  capture_status: string | null;
  paypal_order_id?: string | null;
  paypal_capture_id?: string | null;
  transaction_id: string | null;
  payer_name: string | null;
  payer_email: string | null;
  payment_mode: string | null;
  card_brand?: string | null;
  card_type?: string | null;
  card_last4?: string | null;
  card_holder_name?: string | null;
  addr_name?: string | null;
  addr_line1?: string | null;
  addr_line2?: string | null;
  addr_city?: string | null;
  addr_state?: string | null;
  addr_postal?: string | null;
  addr_country?: string | null;
  metadata?: PaymentMetadata | null;
}

const addOneMonth = (d: Date) => {
  const copy = new Date(d);
  copy.setMonth(copy.getMonth() + 1);
  return copy;
};

export default function Billing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentDetail[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [refreshPaymentsFlag, setRefreshPaymentsFlag] = useState(0);

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successTransaction, setSuccessTransaction] =
    useState<PaymentDetail | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [usageCount, setUsageCount] = useState<number>(0);
  const [loadingUsage, setLoadingUsage] = useState<boolean>(true);
  const [credits, setCredits] = useState<number>(0);

  const [userCountry, setUserCountry] = useState<CountryCode>("OTHER");

  // Use environment variable or fallback for dev
  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "test";

  const handleLogout = () => navigate("/");

  // ───────────────── Country Detection ─────────────────
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data?.country_code === "US") {
          setUserCountry("US");
        } else if (data?.country_code === "GB") {
          setUserCountry("GB");
        } else {
          setUserCountry("OTHER");
        }
      } catch (err) {
        console.warn("Country detection failed:", err);
        setUserCountry("OTHER");
      }
    };

    detectCountry();
  }, []);

  const isUK = userCountry === "GB";
  const activeCurrency = isUK ? "GBP" : "USD";
  const priceLabel = `${isUK ? "£" : "$"}${PREMIUM_PRICE.toFixed(2)}`;

  // ───────────────── Payment history ─────────────────
  const fetchPaymentHistory = useCallback(async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("payment_details")
        .select(
          "id,user_id,email,amount,amount_paid_usd,currency,created_at,finished_at,status,capture_status,paypal_order_id,paypal_capture_id,transaction_id,payer_name,payer_email,payment_mode,card_brand,card_type,card_last4,card_holder_name,addr_name,addr_line1,addr_line2,addr_city,addr_state,addr_postal,addr_country,metadata"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        // If table doesn't exist, this will error. We'll just show empty history.
        console.warn("fetchPaymentHistory error (table might not exist yet):", error);
        setPaymentHistory([]);
      } else {
        setPaymentHistory((data as PaymentDetail[]) || []);
      }
    } catch (err) {
      console.error("Error fetching payment history:", err);
      setPaymentHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory, refreshPaymentsFlag]);

  // ───────────────── Usage & Credits ─────────────────
  const fetchUsageAndCredits = useCallback(async () => {
    if (!user) return;
    setLoadingUsage(true);
    try {
      // Fetch credits
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('credits_remaining')
        .eq('id', user.id)
        .single();

      if (!profileError && profileData) {
        setCredits(profileData.credits_remaining || 0);
      }

      // Fetch usage count (optional, for display)
      const { count, error } = await supabase
        .from(USAGE_TABLE_NAME)
        .select("*", { head: true, count: "exact" })
        .eq("user_id", user.id); // Assuming job_requests has user_id, if not we might need to join or skip

      if (error) {
        console.error("fetchUsageCount error:", error);
        setUsageCount(0);
      } else {
        setUsageCount(count ?? 0);
      }
    } catch (err) {
      console.error("Error fetching usage/credits:", err);
    } finally {
      setLoadingUsage(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsageAndCredits();

    // Subscribe to credit updates
    const channel = supabase
      .channel('billing-credits')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user?.id}` },
        (payload) => {
          setCredits(payload.new.credits_remaining || 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUsageAndCredits, user]);

  // ───────────────── Helpers ─────────────────
  const renderMethod = (mode?: string | null) =>
    !mode
      ? "PayPal"
      : mode === "paypal"
        ? "Wallet (PayPal)"
        : mode === "card"
          ? "Card"
          : mode;

  const renderDate = (p: PaymentDetail) =>
    new Date(p.finished_at || p.created_at).toLocaleDateString();

  const renderAmount = (p: PaymentDetail) => {
    const cur = p.currency === "GBP" ? "£" : "$";
    const val = Number(p.amount_paid_usd ?? p.amount).toFixed(2);
    return `${cur}${val}`;
  };

  // ───────────────── Premium State ─────────────────
  // We define "Premium Active" as having credits > 0
  const isPremiumActive = credits > 0;

  const latestCompleted = paymentHistory.find((p) => p.status === "completed");
  const nextBillingDate = latestCompleted?.metadata?.plan_renews_at
    ? new Date(latestCompleted.metadata.plan_renews_at).toLocaleDateString()
    : null;

  // 👉 NEW: use latestCompleted as fallback when successTransaction is null
  const effectiveTransaction: PaymentDetail | null =
    successTransaction || latestCompleted || null;

  // ───────────────── Payment success ─────────────────
  const onPaymentSuccess = useCallback(
    async (storedPayment: PaymentDetail | null) => {
      setPaymentSuccess(true);
      setProcessingPayment(false);
      if (storedPayment) setSuccessTransaction(storedPayment);
      setRefreshPaymentsFlag((n) => n + 1);
      showToast("Payment successful! Credits added. 🎉", "success");
      // Force refresh credits
      fetchUsageAndCredits();
    },
    [fetchUsageAndCredits]
  );

  // show card if we either just paid, or have an active premium (which implies a latestCompleted)
  const shouldShowSuccessCard = !!(paymentSuccess || isPremiumActive) && !!effectiveTransaction;

  const closeSuccessCard = () => {
    setPaymentSuccess(false);
    setSuccessTransaction(null);
  };

  // ───────────────── PayPal createOrder (client-side) ─────────────────
  const createOrder = async (_data: any, actions: any): Promise<string> => {
    if (!user) {
      showToast("You can't pay here. Please log in first.", "error");
      throw new Error("not_logged_in");
    }

    setProcessingPayment(true);

    const orderId = await actions.order.create({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            value: PREMIUM_PRICE.toFixed(2),
            currency_code: activeCurrency,
          },
          description: `CareerCast Premium – ${CREDITS_PER_PURCHASE} Credits`,
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
      },
    });

    return orderId;
  };

  // ───────────────── PayPal onApprove (capture + direct DB insert) ─────────────────
  const onApprove = async (data: any, actions: any) => {
    try {
      if (!actions.order) {
        throw new Error("PayPal order action is not available");
      }

      const captureResult = await actions.order.capture();

      if (!user) {
        showToast(
          "Payment captured, but user session was lost. Contact support.",
          "error"
        );
        setProcessingPayment(false);
        return;
      }

      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.error("auth.getUser error:", authError);
        showToast("You can't pay here. Please log in again.", "error");
        setProcessingPayment(false);
        return;
      }

      const authedUser = authData.user;

      const payerEmail =
        captureResult?.payer?.email_address ??
        captureResult?.payment_source?.paypal?.email_address ??
        null;

      const payerName =
        `${captureResult?.payer?.name?.given_name || ""} ${captureResult?.payer?.name?.surname || ""
          }`.trim() || null;

      const capture =
        captureResult?.purchase_units?.[0]?.payments?.captures?.[0] ?? null;

      const captureId = capture?.id ?? captureResult?.id ?? null;
      const captureStatus = capture?.status ?? captureResult?.status ?? null;

      const now = new Date();
      const nowIso = now.toISOString();
      const renewIso = addOneMonth(now).toISOString();

      // 1. Insert into payment_details
      const { data: inserted, error: insertErr } = await supabase
        .from("payment_details")
        .insert([
          {
            user_id: authedUser.id,
            email: authedUser.email,
            amount: PREMIUM_PRICE,
            currency: activeCurrency,
            amount_paid_usd: activeCurrency === "USD" ? PREMIUM_PRICE : null,
            status: "completed", // Matches payment_status enum
            capture_status: captureStatus || "COMPLETED",
            paypal_order_id: data.orderID,
            paypal_capture_id: captureId,
            transaction_id: captureId,
            payer_name: payerName,
            payer_email: payerEmail,
            payment_mode: "paypal",
            paypal_capture_raw: captureResult, // Store raw capture data
            paypal_order_raw: data, // Store raw order data
            metadata: {
              plan: "premium_credits",
              source: "wallet",
              plan_started_at: nowIso,
              plan_renews_at: renewIso,
              credits_added: CREDITS_PER_PURCHASE,
            },
            created_at: nowIso,
            finished_at: nowIso,
          },
        ])
        .select()
        .single();

      if (insertErr) {
        console.error("payment_details insert error:", insertErr);
        showToast("Payment recorded but database update failed. Please contact support.", "error");
        setProcessingPayment(false);
        return;
      }

      // NOTE: Credits are now handled by the 'payment_completed_grant_credits' database trigger.
      // We do NOT manually call 'add_credits' here to avoid double-crediting.

      await onPaymentSuccess(inserted as PaymentDetail);
      return captureResult;
    } catch (error: any) {
      console.error("Payment approval error:", error);
      setProcessingPayment(false);
      showToast(
        error?.message || "Payment processing failed. Please try again.",
        "error"
      );
      throw error;
    }
  };

  // ───────────────── Plans ─────────────────
  const plans = [
    {
      key: "free",
      name: "Base Plan",
      price: "$12.99",
      period: "forever",
      features: [
        "3 CareerCast Credits",
        "Basic video recording",
        "Standard resume upload",
      ],
      current: !isPremiumActive,
    },
    {
      key: "premium",
      name: "Premium Top-Up",
      price: priceLabel,
      period: "3 credits",
      features: [
        "3 Additional Credits",
        "HD video recording",
        "Advanced analytics",
        "Priority support",
      ],
      current: isPremiumActive,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay for sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <Sidebar userEmail={user?.email || ""} onLogout={handleLogout} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-slate-700 hover:bg-slate-50 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-3">
            <div className="font-semibold text-slate-900">CareerCast</div>
          </div>

          <div className="w-10" />
        </div>

        {/* Toast container */}
        <div id="toast-container" className="fixed top-4 right-4 z-50" />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="w-full px-8 lg:px-16">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  Billing & Payment
                </h1>
                <p className="text-slate-600 text-sm sm:text-base">
                  Manage your subscription, payment methods, and billing history
                </p>
              </div>

              {/* Credits Status Banner */}
              <div className="mb-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Credits Remaining</h2>
                  <p className="text-slate-600">Use credits to create new CareerCasts</p>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className={`h-6 w-6 ${credits > 0 ? 'text-emerald-500' : 'text-red-500'}`} />
                  <span className={`text-2xl font-bold ${credits > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {credits}
                  </span>
                </div>
              </div>

              {/* Success / Active Premium Card */}
              {shouldShowSuccessCard && effectiveTransaction && (
                <div className="mb-8 bg-white rounded-xl shadow-lg border border-cyan-100 overflow-hidden">
                  <div className="bg-cyan-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white">
                        {paymentSuccess ? "Payment Successful" : "Active Premium Plan"}
                      </h2>
                      <Check className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Transaction details */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                          Transaction Details
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Transaction ID:</span>
                            <span className="font-mono text-slate-900">
                              {effectiveTransaction.transaction_id ??
                                effectiveTransaction.paypal_order_id ??
                                effectiveTransaction.id ??
                                "N/A"}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-600">Date:</span>
                            <span className="text-slate-900">
                              {new Date(
                                effectiveTransaction.finished_at ||
                                effectiveTransaction.created_at
                              ).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-600">Amount:</span>
                            <span className="text-slate-900 font-semibold">
                              {renderAmount(effectiveTransaction)}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-600">Payment Method:</span>
                            <span className="text-slate-900">
                              {renderMethod(effectiveTransaction.payment_mode)}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-slate-600">Status:</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              {effectiveTransaction.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Subscription details */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                          Plan Details
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Plan:</span>
                            <span className="font-semibold text-slate-900">Premium Top-Up</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Credits Added:</span>
                            <span className="text-slate-900">+{CREDITS_PER_PURCHASE}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Total Credits:</span>
                            <span className="text-slate-900 font-bold">{credits}</span>
                          </div>
                          {isPremiumActive && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Status:</span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                Active
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3">
                      <button
                        onClick={closeSuccessCard}
                        className="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                      >
                        Close
                      </button>

                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800"
                      >
                        Print Receipt
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PayPal setup */}
              {!PAYPAL_CLIENT_ID ? (
                <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium text-yellow-800">Payment System Not Configured</h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    PayPal integration is not configured. Set{" "}
                    <code className="font-mono">VITE_PAYPAL_CLIENT_ID</code> in your{" "}
                    <code>.env</code> file.
                  </p>
                </div>
              ) : (
                <PayPalScriptProvider
                  options={{
                    clientId: PAYPAL_CLIENT_ID,
                    intent: "capture",
                    currency: activeCurrency,
                    components: "buttons",
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
                    {plans.map((plan) => {
                      const isPremiumPlan = plan.key === "premium";
                      const isCurrent = plan.current;

                      return (
                        <div
                          key={plan.key}
                          className={`bg-white rounded-lg sm:rounded-xl shadow-sm border-2 ${isCurrent ? "border-cyan-600" : "border-slate-200"
                            } overflow-hidden hover:shadow-lg transition-all duration-300`}
                        >
                          {isCurrent && (
                            <div className="bg-cyan-600 text-white text-center py-2 text-xs sm:text-sm font-semibold">
                              Current Plan
                            </div>
                          )}

                          <div className="p-4 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                                {plan.name}
                              </h3>

                              {plan.key === "free" && (
                                <div className={`text-xs sm:text-sm px-3 py-1 rounded-full font-semibold ${credits > 0 ? "bg-orange-100 text-orange-800" : "bg-red-100 text-red-800"
                                  }`}>
                                  {credits > 0 ? `${credits} Credits` : "No Credits"}
                                </div>
                              )}

                              {plan.key === "premium" && (
                                <div className="bg-cyan-100 text-cyan-800 text-xs sm:text-sm px-3 py-1 rounded-full font-semibold">
                                  +3 Credits
                                </div>
                              )}
                            </div>

                            <div className="mb-2 sm:mb-4">
                              <span className="text-3xl sm:text-4xl font-bold text-slate-900">
                                {plan.price}
                              </span>
                              <span className="text-slate-600 text-sm sm:text-base">
                                /{plan.period}
                              </span>
                            </div>

                            <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                              {plan.features.map((f) => (
                                <li
                                  key={f}
                                  className="flex items-start gap-2 text-xs sm:text-sm text-slate-600"
                                >
                                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>

                            {isPremiumPlan ? (
                              <div className="space-y-3">
                                <div className="p-3 border rounded-lg">
                                  <PayPalButtons
                                    fundingSource="paypal"
                                    style={{
                                      layout: "vertical",
                                      color: "gold",
                                      shape: "rect",
                                    }}
                                    disabled={!user || processingPayment}
                                    createOrder={createOrder}
                                    onApprove={onApprove}
                                    onError={(err) => {
                                      console.error("PayPal Button Error:", err);
                                      setProcessingPayment(false);
                                      showToast(
                                        "Payment failed. Please try again.",
                                        "error"
                                      );
                                    }}
                                    onCancel={() => {
                                      setProcessingPayment(false);
                                      showToast("Payment cancelled", "info");
                                    }}
                                  />
                                </div>

                                {processingPayment && (
                                  <p className="text-xs text-slate-500">
                                    Processing payment… please don’t close this tab.
                                  </p>
                                )}
                              </div>
                            ) : (
                              <button
                                className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-slate-100 text-slate-500 cursor-not-allowed"
                                disabled
                              >
                                {plan.current ? "Current Plan" : "Base Plan"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </PayPalScriptProvider>
              )}

              {/* Info about secure processing */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Secure Payment Processing
                </h3>
                <p className="text-slate-600 text-sm sm:text-base mb-3">
                  All payments are processed securely through PayPal. You don't need
                  to share your credit card information with us.
                </p>
                <div className="flex items-center gap-2">
                  <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                    <span className="text-slate-900 font-medium text-sm">PayPal</span>
                  </div>
                  <span className="text-slate-500 text-xs">SSL Encrypted</span>
                </div>
              </div>

              {/* Payment history */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
                  Payment History
                </h2>

                {loadingHistory ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-600" />
                    <p className="mt-2 text-slate-600">Loading payment history...</p>
                  </div>
                ) : paymentHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Transaction
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Method
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {paymentHistory.map((p) => (
                          <tr key={p.id}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                              {(p.transaction_id ?? p.paypal_order_id ?? p.id)
                                .toString()
                                .slice(0, 12)}
                              …
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                              {renderDate(p)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                              {renderAmount(p)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                              {renderMethod(p.payment_mode)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : p.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                  }`}
                              >
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900">
                      No payment history
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      You haven't made any payments yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// // src/pages/Billing.tsx
// import React, { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import { CreditCard, Check, Menu } from "lucide-react";
// import { useAuth } from "../contexts/AuthContext";
// import { supabase } from "../integrations/supabase/client";
// import { showToast } from "../components/ui/toast";
// import {
//   PayPalScriptProvider,
//   PayPalButtons,
//   PayPalHostedFieldsProvider,
//   PayPalHostedField,
//   usePayPalHostedFields,
// } from "@paypal/react-paypal-js";

// // ---------- CONFIG / TOGGLES ----------
// /**
//  * Toggle location-based pricing:
//  *  - true = detect user country and use GBP for GB, USD for US (default)
//  *  - false = always use USD
//  */
// const ENABLE_LOCATION_PRICING = true;

// // Local asset path (uploaded by you) - use this as a URL in the page if needed
// const ASSET_IMAGE_PATH = "/mnt/data/ba866d83-dfcd-42fc-a5c0-f6581a9a459e.png";
// // ---------------------------------------

// interface PaymentDetail {
//   id: string;
//   user_id: string;
//   amount: number;
//   amount_paid_usd?: number | null;
//   currency: string;
//   status: "created" | "pending" | "completed" | "failed";
//   transaction_id: string | null;
//   paypal_order_id?: string | null;
//   paypal_capture_id?: string | null;
//   payer_email?: string | null;
//   payment_mode?: string | null;
//   created_at: string;
//   finished_at?: string | null;
// }

// type ProfilePlan = {
//   plan_tier: string | null;
//   plan_status: string | null;
//   plan_started_at: string | null;
//   plan_renews_at: string | null;
// };

// export default function Billing() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [paymentHistory, setPaymentHistory] = useState<PaymentDetail[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshPaymentsFlag, setRefreshPaymentsFlag] = useState(0);
//   const [userCountry, setUserCountry] = useState<"US" | "GB" | "OTHER">(
//     "OTHER"
//   );

//   const [clientToken, setClientToken] = useState<string | null>(null);
//   const [hfEligible, setHfEligible] = useState<boolean | null>(null);

//   const [profilePlan, setProfilePlan] = useState<ProfilePlan | null>(null);

//   // Success state for payment
//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   const [successTransaction, setSuccessTransaction] =
//     useState<PaymentDetail | null>(null);

//   const FUNCTIONS_URL = import.meta.env
//     .VITE_SUPABASE_FUNCTIONS_URL as string | undefined;
//   const PAYPAL_CLIENT_ID = import.meta.env
//     .VITE_PAYPAL_CLIENT_ID as string | undefined;
//   const SUPABASE_ANON_KEY = import.meta.env
//     .VITE_SUPABASE_ANON_KEY as string | undefined;

//   const handleLogout = () => navigate("/");

//   // ===== Fetch profile plan (to compute current plan + expiry) =====
//   useEffect(() => {
//     (async () => {
//       if (!user) return;
//       const { data, error } = await supabase
//         .from("profiles")
//         .select("plan_tier, plan_status, plan_started_at, plan_renews_at")
//         .eq("id", user.id)
//         .single();
//       if (!error) {
//         setProfilePlan(data as ProfilePlan);
//         // If user has an active premium plan, find the most recent completed payment
//         if (
//           data?.plan_tier === "premium" &&
//           data?.plan_status === "active" &&
//           !paymentSuccess
//         ) {
//           const recentPayment = paymentHistory.find((p) => p.status === "completed");
//           if (recentPayment) {
//             setSuccessTransaction(recentPayment);
//           }
//         }
//       }
//     })();
//   }, [user, refreshPaymentsFlag, paymentHistory, paymentSuccess]);

//   const isPremiumActive =
//     profilePlan?.plan_tier === "premium" &&
//     profilePlan?.plan_status === "active" &&
//     !!profilePlan?.plan_renews_at &&
//     new Date(profilePlan.plan_renews_at) > new Date();

//   // ===== Fetch client token for Hosted Fields =====
//   useEffect(() => {
//     (async () => {
//       console.log("Attempting to fetch client token...");
//       console.log("FUNCTIONS_URL:", FUNCTIONS_URL);
//       console.log("SUPABASE_ANON_KEY exists:", !!SUPABASE_ANON_KEY);
//       if (!FUNCTIONS_URL || !SUPABASE_ANON_KEY) {
//         console.log("Missing FUNCTIONS_URL or SUPABASE_ANON_KEY");
//         return;
//       }
//       try {
//         const res = await fetch(`${FUNCTIONS_URL}/generate-client-token`, {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
//             apikey: SUPABASE_ANON_KEY,
//           },
//         });
//         const json = await res.json();
//         console.log("Client token response:", res.status, json);
//         if (res.ok && json.clientToken) {
//           setClientToken(json.clientToken);
//           console.log("Client token set successfully");
//         } else {
//           console.error("Failed to get client token:", json);
//         }
//       } catch (e) {
//         console.error("Client token fetch error:", e);
//       }
//     })();
//   }, [FUNCTIONS_URL, SUPABASE_ANON_KEY]);

//   // Determine Hosted Fields eligibility once SDK present
//   useEffect(() => {
//     if (!clientToken) return;

//     const checkEligibility = () => {
//       try {
//         console.log("Checking hosted fields eligibility...");
//         const paypal = (window as any)?.paypal;
//         console.log("PayPal SDK loaded:", !!paypal);
//         if (!paypal) {
//           console.log("PayPal SDK not loaded yet, retrying...");
//           setTimeout(checkEligibility, 500);
//           return;
//         }

//         console.log("HostedFields available:", !!paypal.HostedFields);
//         if (!paypal.HostedFields) {
//           console.log("HostedFields not available yet, retrying...");
//           setTimeout(checkEligibility, 500);
//           return;
//         }

//         const isEligible =
//           typeof paypal.HostedFields.isEligible === "function"
//             ? paypal.HostedFields.isEligible()
//             : false;

//         console.log("Hosted Fields eligible:", isEligible);
//         setHfEligible(!!isEligible);
//       } catch (error) {
//         console.error("Error checking Hosted Fields eligibility:", error);
//         setHfEligible(false);
//       }
//     };

//     checkEligibility();
//     const timeoutId = setTimeout(checkEligibility, 1000);
//     return () => clearTimeout(timeoutId);
//   }, [clientToken]);

//   // ===== Payment history =====
//   const fetchPaymentHistory = useCallback(async () => {
//     if (!user) return;
//     setLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from("payment_details")
//         .select(
//           "id,user_id,amount,amount_paid_usd,currency,status,transaction_id,paypal_order_id,paypal_capture_id,payer_email,payment_mode,created_at,finished_at"
//         )
//         .eq("user_id", user.id)
//         .order("created_at", { ascending: false });

//       if (error) console.error(error);
//       setPaymentHistory((data as PaymentDetail[]) || []);
//     } catch (err) {
//       console.error("Error fetching payment history:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchPaymentHistory();
//   }, [fetchPaymentHistory, refreshPaymentsFlag]);

//   // Detect user country (respects ENABLE_LOCATION_PRICING)
//   useEffect(() => {
//     const detectCountry = async () => {
//       try {
//         if (!ENABLE_LOCATION_PRICING) {
//           // Force USD (US) when location pricing is disabled
//           setUserCountry("US");
//           return;
//         }

//         const response = await fetch("https://ipapi.co/json/");
//         const data = await response.json();
//         if (data.country_code === "US") {
//           setUserCountry("US");
//         } else if (data.country_code === "GB") {
//           setUserCountry("GB");
//         } else {
//           setUserCountry("US"); // default to USD for other countries
//         }
//       } catch (error) {
//         console.log("Could not detect country, defaulting to US");
//         setUserCountry("US");
//       }
//     };

//     detectCountry();
//   }, []);

//   // ===== Plans =====
//   const plans = [
//     {
//       key: "free",
//       name: "Free",
//       price: "$0",
//       period: "forever",
//       features: [
//         "3 careercasts per month",
//         "Basic video recording",
//         "Standard resume upload",
//         "Community support",
//       ],
//       current: !isPremiumActive,
//     },
//     {
//       key: "premium",
//       name: "Premium",
//       // price changes based on toggle + detected country
//       price:
//         ENABLE_LOCATION_PRICING && userCountry === "GB" ? "£9.99" : "$9.99",
//       period: "month",
//       features: [
//         "Unlimited careercasts",
//         "HD video recording",
//         "Advanced analytics",
//         "Priority support",
//         "Custom branding",
//       ],
//       current: isPremiumActive,
//     },
//   ];

//   const renderMethod = (mode?: string | null) =>
//     !mode ? "PayPal" : mode === "paypal" ? "Wallet (PayPal)" : mode === "card" ? "Card" : mode;
//   const renderDate = (p: PaymentDetail) =>
//     new Date(p.finished_at || p.created_at).toLocaleDateString();
//   const renderAmount = (p: PaymentDetail) =>
//     `${p.currency === "GBP" ? "£" : "$"}${Number(
//       (p.status === "completed" && p.amount_paid_usd != null) ? p.amount_paid_usd : p.amount
//     ).toFixed(2)}`;

//   // helper to submit hosted fields reliably (tries several API shapes)
//   async function submitHostedFields(hostedFields: any, payload: any) {
//     try {
//       console.log("submitHostedFields: hostedFields object:", hostedFields);
//       if (hostedFields && typeof hostedFields.submit === "function") {
//         console.log("Using hostedFields.submit(payload)");
//         return await hostedFields.submit(payload);
//       }
//       if (hostedFields?.cardFields && typeof hostedFields.cardFields.submit === "function") {
//         console.log("Using hostedFields.cardFields.submit(payload)");
//         return await hostedFields.cardFields.submit(payload);
//       }
//       if (hostedFields?.instance && typeof hostedFields.instance.submit === "function") {
//         console.log("Using hostedFields.instance.submit(payload)");
//         return await hostedFields.instance.submit(payload);
//       }
//       if (typeof hostedFields.submitCard === "function") {
//         console.log("Using hostedFields.submitCard(payload)");
//         return await hostedFields.submitCard(payload);
//       }
//       console.error(
//         "No supported hostedFields.submit method found. HostedFields:",
//         hostedFields
//       );
//       throw new Error("HostedFields API not available (check console logs).");
//     } catch (err) {
//       console.error("submitHostedFields error:", err);
//       throw err;
//     }
//   }

//   // ===== Hosted Fields card form =====
//   function CardForm({ onApproved }: { onApproved: () => void }) {
//     const hostedFields: any = usePayPalHostedFields();
//     const [submitting, setSubmitting] = useState(false);

//     const payWithCard = async () => {
//       try {
//         if (!user) throw new Error("Not signed in");
//         if (!FUNCTIONS_URL) throw new Error("Functions URL missing");
//         if (!SUPABASE_ANON_KEY) throw new Error("Missing anon key");
//         const isEligible = (window as any)?.paypal?.HostedFields?.isEligible?.() ?? false;
//         if (!isEligible) {
//           showToast("Card fields not eligible for this buyer.", "error");
//           return;
//         }

//         setSubmitting(true);

//         const { data: { session } = {} as any } = await supabase.auth.getSession();
//         const accessToken = session?.access_token || "";

//         // Determine currency and amount (respects toggle)
//         const isUK = ENABLE_LOCATION_PRICING && userCountry === "GB";
//         const amountToCharge = isUK ? 9.99 : 9.99;
//         const currency = isUK ? "GBP" : "USD";

//         const createRes = await fetch(`${FUNCTIONS_URL}/create-order`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
//             apikey: SUPABASE_ANON_KEY,
//             ...(accessToken ? { "X-User-Token": accessToken } : {}),
//           },
//           body: JSON.stringify({
//             amount: amountToCharge,
//             currency: currency,
//             user_id: user.id,
//             metadata: { plan: "premium_monthly", source: "hosted-fields" },
//           }),
//         });

//         const createJson = await createRes.json();
//         if (!createRes.ok) {
//           console.error("Create order error:", createJson);
//           throw new Error(createJson.error || "Create order failed");
//         }
//         const orderId = createJson.orderId as string;
//         (window as any).__paymentId = createJson.paymentId as string;

//         const cardholderName =
//           (document.getElementById("hf-card-holder") as HTMLInputElement)
//             ?.value || undefined;
//         const billingAddress = {
//           streetAddress:
//             (document.getElementById("hf-addr1") as HTMLInputElement)
//               ?.value || undefined,
//           extendedAddress:
//             (document.getElementById("hf-addr2") as HTMLInputElement)
//               ?.value || undefined,
//           locality:
//             (document.getElementById("hf-city") as HTMLInputElement)
//               ?.value || undefined,
//           region:
//             (document.getElementById("hf-state") as HTMLInputElement)
//               ?.value || undefined,
//           postalCode:
//             (document.getElementById("hf-postal") as HTMLInputElement)
//               ?.value || undefined,
//           countryCodeAlpha2:
//             (document.getElementById("hf-country") as HTMLInputElement)
//               ?.value || undefined,
//         };

//         if (!hostedFields) {
//           console.error("HostedFields hook returned falsy:", hostedFields);
//           throw new Error("Hosted fields not ready");
//         }

//         await submitHostedFields(hostedFields, {
//           orderId,
//           contingencies: ["3D_SECURE"],
//           cardholderName,
//           billingAddress,
//         });

//         const capRes = await fetch(`${FUNCTIONS_URL}/capture-order`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
//             apikey: SUPABASE_ANON_KEY,
//           },
//           body: JSON.stringify({
//             orderId,
//             paymentId: (window as any).__paymentId,
//             card_holder_name_input: cardholderName,
//             billing_address_input: billingAddress,
//           }),
//         });

//         const capJson = await capRes.json();
//         if (!capRes.ok || !capJson.ok) {
//           console.error("Capture error:", capJson);
//           showToast(
//             `Payment capture failed.${capJson?.debug_id ? ` Debug ID: ${capJson.debug_id}` : ""}`,
//             "error"
//           );
//           return;
//         }

//         // Set success transaction details
//         if (capJson?.payment) {
//           setSuccessTransaction(capJson.payment);
//         }

//         showToast("Card payment successful! 🎉", "success");
//         onApproved();
//       } catch (e: any) {
//         console.error(e);
//         showToast(e?.message || "Card payment failed.", "error");
//       } finally {
//         setSubmitting(false);
//       }
//     };

//     return (
//       <div className="space-y-3">
//         <input id="hf-card-holder" placeholder="Name on card" className="w-full border rounded px-3 py-2" />
//         <input id="hf-addr1" placeholder="Billing address line 1" className="w-full border rounded px-3 py-2" />
//         <input id="hf-addr2" placeholder="Address line 2 (optional)" className="w-full border rounded px-3 py-2" />
//         <div className="grid grid-cols-2 gap-2">
//           <input id="hf-city" placeholder="City" className="border rounded px-3 py-2" />
//           <input id="hf-state" placeholder="State" className="border rounded px-3 py-2" />
//         </div>
//         <div className="grid grid-cols-2 gap-2">
//           <input id="hf-postal" placeholder="Postal code" className="border rounded px-3 py-2" />
//           <input id="hf-country" placeholder="Country (e.g., US)" className="border rounded px-3 py-2" />
//         </div>

//         <button
//           onClick={payWithCard}
//           disabled={submitting}
//           className="w-full py-3 rounded-lg font-semibold bg-[#01796F] text-white disabled:opacity-60"
//         >
//           {submitting ? "Processing…" : "Pay with Card"}
//         </button>
//       </div>
//     );
//   }

//   // Refresh after success
//   const onPaymentSuccess = () => {
//     setRefreshPaymentsFlag((n) => n + 1);
//     // Set payment success state
//     setPaymentSuccess(true);
//     // Find the most recent completed payment and set it as the success transaction
//     const recentPayment = paymentHistory.find((p) => p.status === "completed");
//     if (recentPayment) {
//       setSuccessTransaction(recentPayment);
//     }
//   };

//   // Check if we should show the success card based on active premium plan
//   const shouldShowSuccessCard = paymentSuccess || isPremiumActive;

//   // Close success card
//   const closeSuccessCard = () => {
//     // Only close if it was opened due to a recent payment, not due to active plan
//     if (paymentSuccess) {
//       setPaymentSuccess(false);
//       setSuccessTransaction(null);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white flex">
//       {sidebarOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
//       )}

//       <div className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
//         <Sidebar userEmail={user?.email || ""} onLogout={handleLogout} />
//       </div>

//       <div className="flex-1 flex flex-col overflow-hidden">
//         <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
//           <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none">
//             <Menu className="h-6 w-6" />
//           </button>
//           <div className="font-bold text-xl text-[#0B4F6C]">careercast</div>
//           <div className="w-10" />
//         </div>

//         {/* Toast Container */}
//         <div id="toast-container" className="fixed top-4 right-4 z-50"></div>

//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50">
//           <div className="max-w-6xl mx-auto">
//             <div className="mb-6 sm:mb-8">
//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Billing & Payment</h1>
//               <p className="text-gray-600 text-sm sm:text-base">Manage your subscription, payment methods, and billing history</p>
//             </div>

//             {/* Payment Success Card */}
//             {shouldShowSuccessCard && successTransaction && (
//               <div className="mb-8 bg-white rounded-xl shadow-lg border border-green-200 overflow-hidden">
//                 <div className="bg-green-600 px-6 py-4">
//                   <div className="flex items-center justify-between">
//                     <h2 className="text-xl font-bold text-white">
//                       {paymentSuccess ? "Payment Successful" : "Active Premium Plan"}
//                     </h2>
//                     <Check className="h-8 w-8 text-white" />
//                   </div>
//                 </div>
//                 <div className="p-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
//                       <div className="space-y-3">
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Transaction ID:</span>
//                           <span className="font-mono text-gray-900">{successTransaction.transaction_id ?? successTransaction.paypal_order_id ?? successTransaction.id}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Date:</span>
//                           <span className="text-gray-900">{new Date(successTransaction.finished_at || successTransaction.created_at).toLocaleString()}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Amount:</span>
//                           <span className="text-gray-900 font-semibold">{renderAmount(successTransaction)}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Payment Method:</span>
//                           <span className="text-gray-900">{renderMethod(successTransaction.payment_mode)}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Status:</span>
//                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                             {successTransaction.status}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
//                       <div className="space-y-3">
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Plan:</span>
//                           <span className="font-semibold text-gray-900">Premium</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Billing Cycle:</span>
//                           <span className="text-gray-900">Monthly</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Next Billing Date:</span>
//                           <span className="text-gray-900">
//                             {profilePlan?.plan_renews_at ? new Date(profilePlan.plan_renews_at).toLocaleDateString() : "N/A"}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Features:</span>
//                           <span className="text-gray-900">Unlimited careercasts</span>
//                         </div>
//                         {profilePlan?.plan_renews_at && (
//                           <div className="flex justify-between">
//                             <span className="text-gray-600">Plan Status:</span>
//                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
//                     <button
//                       onClick={closeSuccessCard}
//                       className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01796F]"
//                     >
//                       Close
//                     </button>
//                     <button
//                       onClick={() => window.print()}
//                       className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#01796F] hover:bg-[#0B4F6C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01796F]"
//                     >
//                       Print Receipt
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {!PAYPAL_CLIENT_ID ? (
//               <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <h3 className="font-medium text-yellow-800">Payment System Not Configured</h3>
//                 <p className="text-yellow-700 text-sm mt-1">PayPal integration is not properly configured. Please contact support or check your environment variables.</p>
//               </div>
//             ) : !clientToken ? (
//               <div className="mb-8 text-sm text-gray-600">Initializing secure payment system…</div>
//             ) : (
//               <PayPalScriptProvider
//                 key={clientToken}
//                 options={{
//                   clientId: PAYPAL_CLIENT_ID || "",
//                   intent: "capture",
//                   components: "buttons,hosted-fields",
//                   // dynamically set currency based on toggle + detected country
//                   currency: ENABLE_LOCATION_PRICING && userCountry === "GB" ? "GBP" : "USD",
//                   dataClientToken: clientToken || undefined,
//                 }}
//               >
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
//                   {plans.map((plan) => {
//                     const isPremium = plan.key === "premium";
//                     const isCurrent = plan.current;

//                     return (
//                       <div key={plan.key} className={`bg-white rounded-lg sm:rounded-xl shadow-sm border-2 ${isCurrent ? "border-[#01796F]" : "border-gray-200"} overflow-hidden hover:shadow-lg transition-all duration-300`}>
//                         {isCurrent && <div className="bg-[#01796F] text-white text-center py-2 text-xs sm:text-sm font-semibold">Current Plan</div>}
//                         <div className="p-4 sm:p-6">
//                           <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
//                           <div className="mb-4 sm:mb-6">
//                             <span className="text-3xl sm:text-4xl font-bold text-gray-900">{plan.price}</span>
//                             <span className="text-gray-600 text-sm sm:text-base">/{plan.period}</span>
//                           </div>
//                           <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
//                             {plan.features.map((f) => (
//                               <li key={f} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
//                                 <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#01796F] flex-shrink-0 mt-0.5" />
//                                 <span>{f}</span>
//                               </li>
//                             ))}
//                           </ul>

//                           {isPremium ? (
//                             isCurrent ? (
//                               <button className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-gray-100 text-gray-500 cursor-not-allowed" disabled>Current Plan</button>
//                             ) : (
//                               <div className="space-y-6">
//                                 <div className="p-3 border rounded-lg">
//                                   <PayPalButtons
//                                     fundingSource="paypal"
//                                     style={{ layout: "vertical" }}
//                                     disabled={!user || !FUNCTIONS_URL || !SUPABASE_ANON_KEY}
//                                     createOrder={async () => {
//                                       if (!user) throw new Error("Not signed in");
//                                       // Determine currency + amount (respects toggle)
//                                       const isUK = ENABLE_LOCATION_PRICING && userCountry === "GB";
//                                       const amountToCharge = isUK ? 9.99 : 9.99;
//                                       const currency = isUK ? "GBP" : "USD";
//                                       const { data: { session } = {} as any } = await supabase.auth.getSession();
//                                       const accessToken = session?.access_token || "";

//                                       const res = await fetch(`${FUNCTIONS_URL}/create-order`, {
//                                         method: "POST",
//                                         headers: {
//                                           "Content-Type": "application/json",
//                                           Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
//                                           ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY } : {}),
//                                           ...(accessToken ? { "X-User-Token": accessToken } : {}),
//                                         },
//                                         body: JSON.stringify({
//                                           amount: amountToCharge,
//                                           currency: currency,
//                                           user_id: user.id,
//                                           email: user.email,
//                                           metadata: { plan: "premium_monthly", source: "wallet" },
//                                         }),
//                                       });

//                                       const json = await res.json();
//                                       if (!res.ok) {
//                                         console.error("Create order error:", json);
//                                         throw new Error(json.error || "Create order failed");
//                                       }

//                                       (window as any).__paymentId = json.paymentId;
//                                       return json.orderId;
//                                     }}
//                                     onApprove={async (data, actions) => {
//                                       if (!actions.order) {
//                                         console.error("PayPal actions.order is undefined");
//                                         throw new Error("PayPal order action is not available");
//                                       }

//                                       return actions.order.capture().then(async (captureResult: any) => {
//                                         try {
//                                           const captureId =
//                                             captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id ??
//                                             captureResult?.id ??
//                                             null;
//                                           const payerEmail = captureResult?.payer?.email_address ?? null;
//                                           const paymentId = (window as any).__paymentId;

//                                           let updatedPaymentData = null;
//                                           if (paymentId) {
//                                             const response = await fetch(`${FUNCTIONS_URL}/capture-order`, {
//                                               method: "POST",
//                                               headers: {
//                                                 "Content-Type": "application/json",
//                                                 Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
//                                                 ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY } : {}),
//                                               },
//                                               body: JSON.stringify({
//                                                 paymentId,
//                                                 orderId: data.orderID,
//                                                 captureInfo: captureResult,
//                                                 payer_email: payerEmail,
//                                                 payer_name: `${captureResult?.payer?.name?.given_name ?? ""} ${captureResult?.payer?.name?.surname ?? ""}`.trim() || null,
//                                               }),
//                                             });

//                                             updatedPaymentData = await response.json();
//                                           } else {
//                                             console.warn("No paymentId stored; server update skipped.");
//                                           }

//                                           setTimeout(() => {
//                                             onPaymentSuccess();
//                                             if (updatedPaymentData?.payment) {
//                                               setSuccessTransaction(updatedPaymentData.payment);
//                                             }
//                                             showToast("Payment successful! 🎉", "success");
//                                           }, 300);

//                                           return captureResult;
//                                         } catch (err) {
//                                           console.error("onApprove client-side error:", err);
//                                           return Promise.reject(err);
//                                         }
//                                       });
//                                     }}
//                                   />
//                                 </div>

//                                 {hfEligible === false && <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">Card fields aren’t eligible for this browser/region/app.</div>}

//                                 {hfEligible && (
//                                   <PayPalHostedFieldsProvider
//                                     styles={{
//                                       input: { "font-size": "16px" },
//                                       ":focus": { outline: "none" },
//                                       ".invalid": { color: "#ef4444" },
//                                     }}
//                                     createOrder={async () => {
//                                       if (!user) throw new Error("Not signed in");
//                                       const isUK = ENABLE_LOCATION_PRICING && userCountry === "GB";
//                                       const amountToCharge = isUK ? 9.99 : 9.99;
//                                       const currency = isUK ? "GBP" : "USD";
//                                       const { data: { session } = {} as any } = await supabase.auth.getSession();
//                                       const accessToken = session?.access_token || "";

//                                       const res = await fetch(`${FUNCTIONS_URL}/create-order`, {
//                                         method: "POST",
//                                         headers: {
//                                           "Content-Type": "application/json",
//                                           Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
//                                           ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY } : {}),
//                                           ...(accessToken ? { "X-User-Token": accessToken } : {}),
//                                         },
//                                         body: JSON.stringify({
//                                           amount: amountToCharge,
//                                           currency: currency,
//                                           user_id: user.id,
//                                           email: user.email,
//                                           metadata: { plan: "premium_monthly", source: "wallet" },
//                                         }),
//                                       });

//                                       const json = await res.json();
//                                       if (!res.ok) {
//                                         console.error("Create order error:", json);
//                                         throw new Error(json.error || "Create order failed");
//                                       }

//                                       (window as any).__paymentId = json.paymentId;
//                                       return json.orderId;
//                                     }}
//                                   >
//                                     <div className="p-4 border rounded-lg">
//                                       <h4 className="font-semibold mb-3">Pay with debit/credit card</h4>

//                                       <div id="hf-number" className="border rounded px-3 py-2 mb-2 min-h-[44px]" />
//                                       <div className="grid grid-cols-2 gap-2">
//                                         <div id="hf-cvv" className="border rounded px-3 py-2 min-h-[44px]" />
//                                         <div id="hf-exp" className="border rounded px-3 py-2 min-h-[44px]" />
//                                       </div>

//                                       <PayPalHostedField hostedFieldType="number" options={{ selector: "#hf-number", placeholder: "4111 1111 1111 1111" }} />
//                                       <PayPalHostedField hostedFieldType="cvv" options={{ selector: "#hf-cvv", placeholder: "123" }} />
//                                       <PayPalHostedField hostedFieldType="expirationDate" options={{ selector: "#hf-exp", placeholder: "MM/YY" }} />

//                                       <div className="mt-3">
//                                         <CardForm onApproved={onPaymentSuccess} />
//                                       </div>
//                                     </div>
//                                   </PayPalHostedFieldsProvider>
//                                 )}
//                               </div>
//                             )
//                           ) : (
//                             <button className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-gray-100 text-gray-500 cursor-not-allowed" disabled>{plan.current ? "Current Plan" : "Free Plan"}</button>
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </PayPalScriptProvider>
//             )}

//             <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-8">
//               <h3 className="text-lg font-semibold text-blue-800 mb-2">Secure Payment Processing</h3>
//               <p className="text-blue-700 text-sm sm:text-base mb-3">All payments are processed securely through PayPal. You don't need to share your credit card information with us.</p>
//               <div className="flex items-center gap-2">
//                 <div className="bg-white px-3 py-1 rounded-full border border-blue-300"><span className="text-blue-800 font-medium text-sm">PayPal</span></div>
//                 <span className="text-blue-600 text-xs">SSL Encrypted</span>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
//               <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Payment History</h2>

//               {loading ? (
//                 <div className="text-center py-8">
//                   <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#01796F]" />
//                   <p className="mt-2 text-gray-600">Loading payment history...</p>
//                 </div>
//               ) : paymentHistory.length > 0 ? (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50"><tr>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                     </tr></thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {paymentHistory.map((p) => (
//                         <tr key={p.id}>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{(p.transaction_id ?? p.paypal_order_id ?? p.id).toString().slice(0, 12)}…</td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{renderDate(p)}</td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{renderAmount(p)}</td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{renderMethod(p.payment_mode)}</td>
//                           <td className="px-4 py-4 whitespace-nowrap">
//                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'completed' ? 'bg-green-100 text-green-800' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
//                               {p.status}
//                             </span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <div className="text-center py-8">
//                   <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
//                   <h3 className="mt-2 text-sm font-medium text-gray-900">No payment history</h3>
//                   <p className="mt-1 text-sm text-gray-500">You haven't made any payments yet.</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }







// // src/pages/Billing.tsx
// import React, { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import { CreditCard, Check, Menu } from "lucide-react";
// import { useAuth } from "../contexts/AuthContext";
// import { supabase } from "../integrations/supabase/client";
// import { showToast } from "../components/ui/toast";
// import {
//   PayPalScriptProvider,
//   PayPalButtons,
//   PayPalHostedFieldsProvider,
//   PayPalHostedField,
//   usePayPalHostedFields,
// } from "@paypal/react-paypal-js";

// // ---------- CONFIG / TOGGLES ----------
// // Toggle location-based pricing:
// //  - true = detect user country and use GBP for GB, USD for US (default)
// //  - false = always use USD
// const ENABLE_LOCATION_PRICING = true; // <<--- Change this to false to force USD globally
// // ---------------------------------------

// interface PaymentDetail {
//   id: string;
//   user_id: string;
//   amount: number;
//   amount_paid_usd?: number | null;
//   currency: string;
//   status: "created" | "pending" | "completed" | "failed";
//   transaction_id: string | null;
//   paypal_order_id?: string | null;
//   paypal_capture_id?: string | null;
//   payer_email?: string | null;
//   payment_mode?: string | null;
//   created_at: string;
//   finished_at?: string | null;
// }

// type ProfilePlan = {
//   plan_tier: string | null;
//   plan_status: string | null;
//   plan_started_at: string | null;
//   plan_renews_at: string | null;
// };

// export default function Billing() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [paymentHistory, setPaymentHistory] = useState<PaymentDetail[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshPaymentsFlag, setRefreshPaymentsFlag] = useState(0);
//   const [userCountry, setUserCountry] = useState<"US" | "GB" | "OTHER">(
//     "OTHER"
//   );
//   const [detected, setDetected] = useState(false); // ensure country detection finished before rendering provider

//   const [clientToken, setClientToken] = useState<string | null>(null);
//   const [hfEligible, setHfEligible] = useState<boolean | null>(null);

//   const [profilePlan, setProfilePlan] = useState<ProfilePlan | null>(null);

//   // Success state for payment
//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   const [successTransaction, setSuccessTransaction] =
//     useState<PaymentDetail | null>(null);

//   const FUNCTIONS_URL = import.meta.env
//     .VITE_SUPABASE_FUNCTIONS_URL as string | undefined;
//   const PAYPAL_CLIENT_ID = import.meta.env
//     .VITE_PAYPAL_CLIENT_ID as string | undefined;
//   const SUPABASE_ANON_KEY = import.meta.env
//     .VITE_SUPABASE_ANON_KEY as string | undefined;

//   const handleLogout = () => navigate("/");

//   // ===== Fetch profile plan (to compute current plan + expiry) =====
//   useEffect(() => {
//     (async () => {
//       if (!user) return;
//       const { data, error } = await supabase
//         .from("profiles")
//         .select("plan_tier, plan_status, plan_started_at, plan_renews_at")
//         .eq("id", user.id)
//         .single();
//       if (!error) {
//         setProfilePlan(data as ProfilePlan);
//         if (
//           data?.plan_tier === "premium" &&
//           data?.plan_status === "active" &&
//           !paymentSuccess
//         ) {
//           const recentPayment = paymentHistory.find((p) => p.status === "completed");
//           if (recentPayment) {
//             setSuccessTransaction(recentPayment);
//           }
//         }
//       }
//     })();
//   }, [user, refreshPaymentsFlag, paymentHistory, paymentSuccess]);

//   const isPremiumActive =
//     profilePlan?.plan_tier === "premium" &&
//     profilePlan?.plan_status === "active" &&
//     !!profilePlan?.plan_renews_at &&
//     new Date(profilePlan.plan_renews_at) > new Date();

//   // ===== Fetch client token for Hosted Fields =====
//   useEffect(() => {
//     (async () => {
//       if (!FUNCTIONS_URL || !SUPABASE_ANON_KEY) return;
//       try {
//         const res = await fetch(`${FUNCTIONS_URL}/generate-client-token`, {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
//             apikey: SUPABASE_ANON_KEY,
//           },
//         });
//         const json = await res.json();
//         if (res.ok && json.clientToken) {
//           setClientToken(json.clientToken);
//         } else {
//           console.error("Failed to get client token:", json);
//         }
//       } catch (e) {
//         console.error("Client token fetch error:", e);
//       }
//     })();
//   }, [FUNCTIONS_URL, SUPABASE_ANON_KEY]);

//   // Determine Hosted Fields eligibility once SDK present
//   useEffect(() => {
//     if (!clientToken) return;
//     const checkEligibility = () => {
//       try {
//         const paypal = (window as any)?.paypal;
//         if (!paypal) {
//           setTimeout(checkEligibility, 500);
//           return;
//         }
//         if (!paypal.HostedFields) {
//           setTimeout(checkEligibility, 500);
//           return;
//         }
//         const isEligible =
//           typeof paypal.HostedFields.isEligible === "function"
//             ? paypal.HostedFields.isEligible()
//             : false;
//         setHfEligible(!!isEligible);
//       } catch (error) {
//         console.error("Error checking Hosted Fields eligibility:", error);
//         setHfEligible(false);
//       }
//     };
//     checkEligibility();
//     const timeoutId = setTimeout(checkEligibility, 1000);
//     return () => clearTimeout(timeoutId);
//   }, [clientToken]);

//   // ===== Payment history =====
//   const fetchPaymentHistory = useCallback(async () => {
//     if (!user) return;
//     setLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from("payment_details")
//         .select(
//           "id,user_id,amount,amount_paid_usd,currency,status,transaction_id,paypal_order_id,paypal_capture_id,payer_email,payment_mode,created_at,finished_at"
//         )
//         .eq("user_id", user.id)
//         .order("created_at", { ascending: false });

//       if (error) console.error(error);
//       setPaymentHistory((data as PaymentDetail[]) || []);
//     } catch (err) {
//       console.error("Error fetching payment history:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchPaymentHistory();
//   }, [fetchPaymentHistory, refreshPaymentsFlag]);

//   // Detect user country (respects ENABLE_LOCATION_PRICING)
//   useEffect(() => {
//     const detectCountry = async () => {
//       try {
//         if (!ENABLE_LOCATION_PRICING) {
//           setUserCountry("US");
//           setDetected(true);
//           return;
//         }
//         const response = await fetch("https://ipapi.co/json/");
//         const data = await response.json();
//         if (data.country_code === "US") {
//           setUserCountry("US");
//         } else if (data.country_code === "GB") {
//           setUserCountry("GB");
//         } else {
//           setUserCountry("US"); // default USD for others
//         }
//       } catch (error) {
//         console.log("Could not detect country, defaulting to US");
//         setUserCountry("US");
//       } finally {
//         setDetected(true);
//       }
//     };
//     detectCountry();
//   }, []);

//   // ===== Plans =====
//   const plans = [
//     {
//       key: "free",
//       name: "Free",
//       price: "$0",
//       period: "forever",
//       features: [
//         "3 careercasts per month",
//         "Basic video recording",
//         "Standard resume upload",
//         "Community support",
//       ],
//       current: !isPremiumActive,
//     },
//     {
//       key: "premium",
//       name: "Premium",
//       // price changes based on toggle + detected country
//       price:
//         ENABLE_LOCATION_PRICING && userCountry === "GB" ? "£9.99" : "$9.99",
//       period: "month",
//       features: [
//         "Unlimited careercasts",
//         "HD video recording",
//         "Advanced analytics",
//         "Priority support",
//         "Custom branding",
//       ],
//       current: isPremiumActive,
//     },
//   ];

//   const renderMethod = (mode?: string | null) =>
//     !mode ? "PayPal" : mode === "paypal" ? "Wallet (PayPal)" : mode === "card" ? "Card" : mode;
//   const renderDate = (p: PaymentDetail) =>
//     new Date(p.finished_at || p.created_at).toLocaleDateString();
//   const renderAmount = (p: PaymentDetail) =>
//     `${p.currency === "GBP" ? "£" : "$"}${Number(
//       (p.status === "completed" && p.amount_paid_usd != null) ? p.amount_paid_usd : p.amount
//     ).toFixed(2)}`;

//   // helper to submit hosted fields reliably (tries several API shapes)
//   async function submitHostedFields(hostedFields: any, payload: any) {
//     try {
//       if (hostedFields && typeof hostedFields.submit === "function") {
//         return await hostedFields.submit(payload);
//       }
//       if (hostedFields?.cardFields && typeof hostedFields.cardFields.submit === "function") {
//         return await hostedFields.cardFields.submit(payload);
//       }
//       if (hostedFields?.instance && typeof hostedFields.instance.submit === "function") {
//         return await hostedFields.instance.submit(payload);
//       }
//       if (typeof hostedFields.submitCard === "function") {
//         return await hostedFields.submitCard(payload);
//       }
//       throw new Error("HostedFields API not available (check console logs).");
//     } catch (err) {
//       console.error("submitHostedFields error:", err);
//       throw err;
//     }
//   }

//   // ===== Hosted Fields card form =====
//   function CardForm({ onApproved }: { onApproved: () => void }) {
//     const hostedFields: any = usePayPalHostedFields();
//     const [submitting, setSubmitting] = useState(false);

//     const payWithCard = async () => {
//       try {
//         if (!user) throw new Error("Not signed in");
//         if (!FUNCTIONS_URL) throw new Error("Functions URL missing");
//         if (!SUPABASE_ANON_KEY) throw new Error("Missing anon key");
//         const isEligible = (window as any)?.paypal?.HostedFields?.isEligible?.() ?? false;
//         if (!isEligible) {
//           showToast("Card fields not eligible for this buyer.", "error");
//           return;
//         }

//         setSubmitting(true);

//         const { data: { session } = {} as any } = await supabase.auth.getSession();
//         const accessToken = session?.access_token || "";

//         // Determine currency and amount (respects toggle)
//         const isUK = ENABLE_LOCATION_PRICING && userCountry === "GB";
//         const amountToCharge = isUK ? 9.99 : 9.99;
//         const currency = isUK ? "GBP" : "USD";

//         const createRes = await fetch(`${FUNCTIONS_URL}/create-order`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
//             apikey: SUPABASE_ANON_KEY,
//             ...(accessToken ? { "X-User-Token": accessToken } : {}),
//           },
//           body: JSON.stringify({
//             amount: amountToCharge,
//             currency: currency,
//             user_id: user.id,
//             metadata: { plan: "premium_monthly", source: "hosted-fields" },
//           }),
//         });

//         const createJson = await createRes.json();
//         if (!createRes.ok) {
//           console.error("Create order error:", createJson);
//           throw new Error(createJson.error || "Create order failed");
//         }
//         const orderId = createJson.orderId as string;
//         (window as any).__paymentId = createJson.paymentId as string;

//         const cardholderName =
//           (document.getElementById("hf-card-holder") as HTMLInputElement)
//             ?.value || undefined;
//         const billingAddress = {
//           streetAddress:
//             (document.getElementById("hf-addr1") as HTMLInputElement)
//               ?.value || undefined,
//           extendedAddress:
//             (document.getElementById("hf-addr2") as HTMLInputElement)
//               ?.value || undefined,
//           locality:
//             (document.getElementById("hf-city") as HTMLInputElement)
//               ?.value || undefined,
//           region:
//             (document.getElementById("hf-state") as HTMLInputElement)
//               ?.value || undefined,
//           postalCode:
//             (document.getElementById("hf-postal") as HTMLInputElement)
//               ?.value || undefined,
//           countryCodeAlpha2:
//             (document.getElementById("hf-country") as HTMLInputElement)
//               ?.value || undefined,
//         };

//         if (!hostedFields) {
//           throw new Error("Hosted fields not ready");
//         }

//         await submitHostedFields(hostedFields, {
//           orderId,
//           contingencies: ["3D_SECURE"],
//           cardholderName,
//           billingAddress,
//         });

//         const capRes = await fetch(`${FUNCTIONS_URL}/capture-order`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
//             apikey: SUPABASE_ANON_KEY,
//           },
//           body: JSON.stringify({
//             orderId,
//             paymentId: (window as any).__paymentId,
//             card_holder_name_input: cardholderName,
//             billing_address_input: billingAddress,
//           }),
//         });

//         const capJson = await capRes.json();
//         if (!capRes.ok || !capJson.ok) {
//           console.error("Capture error:", capJson);
//           showToast(
//             `Payment capture failed.${capJson?.debug_id ? ` Debug ID: ${capJson.debug_id}` : ""}`,
//             "error"
//           );
//           return;
//         }

//         if (capJson?.payment) {
//           setSuccessTransaction(capJson.payment);
//         }

//         showToast("Card payment successful! 🎉", "success");
//         onApproved();
//       } catch (e: any) {
//         console.error(e);
//         showToast(e?.message || "Card payment failed.", "error");
//       } finally {
//         setSubmitting(false);
//       }
//     };

//     return (
//       <div className="space-y-3">
//         <input id="hf-card-holder" placeholder="Name on card" className="w-full border rounded px-3 py-2" />
//         <input id="hf-addr1" placeholder="Billing address line 1" className="w-full border rounded px-3 py-2" />
//         <input id="hf-addr2" placeholder="Address line 2 (optional)" className="w-full border rounded px-3 py-2" />
//         <div className="grid grid-cols-2 gap-2">
//           <input id="hf-city" placeholder="City" className="border rounded px-3 py-2" />
//           <input id="hf-state" placeholder="State" className="border rounded px-3 py-2" />
//         </div>
//         <div className="grid grid-cols-2 gap-2">
//           <input id="hf-postal" placeholder="Postal code" className="border rounded px-3 py-2" />
//           <input id="hf-country" placeholder="Country (e.g., US)" className="border rounded px-3 py-2" />
//         </div>

//         <button
//           onClick={payWithCard}
//           disabled={submitting}
//           className="w-full py-3 rounded-lg font-semibold bg-[#01796F] text-white disabled:opacity-60"
//         >
//           {submitting ? "Processing…" : "Pay with Card"}
//         </button>
//       </div>
//     );
//   }

//   // Refresh after success
//   const onPaymentSuccess = () => {
//     setRefreshPaymentsFlag((n) => n + 1);
//     setPaymentSuccess(true);
//     const recentPayment = paymentHistory.find((p) => p.status === "completed");
//     if (recentPayment) {
//       setSuccessTransaction(recentPayment);
//     }
//   };

//   const shouldShowSuccessCard = paymentSuccess || isPremiumActive;

//   const closeSuccessCard = () => {
//     if (paymentSuccess) {
//       setPaymentSuccess(false);
//       setSuccessTransaction(null);
//     }
//   };

//   // Derived/current currency (centralized)
//   const currentCurrency = ENABLE_LOCATION_PRICING && userCountry === "GB" ? "GBP" : "USD";
//   const currentLocale = currentCurrency === "GBP" ? "en_GB" : "en_US";

//   return (
//     <div className="min-h-screen bg-white flex">
//       {sidebarOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
//       )}

//       <div className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
//         <Sidebar userEmail={user?.email || ""} onLogout={handleLogout} />
//       </div>

//       <div className="flex-1 flex flex-col overflow-hidden">
//         <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
//           <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none">
//             <Menu className="h-6 w-6" />
//           </button>
//           <div className="font-bold text-xl text-[#0B4F6C]">careercast</div>
//           <div className="w-10" />
//         </div>

//         {/* Toast Container */}
//         <div id="toast-container" className="fixed top-4 right-4 z-50"></div>

//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50">
//           <div className="max-w-6xl mx-auto">
//             <div className="mb-6 sm:mb-8">
//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Billing & Payment</h1>
//               <p className="text-gray-600 text-sm sm:text-base">Manage your subscription, payment methods, and billing history</p>
//             </div>

//             {/* Payment Success Card */}
//             {shouldShowSuccessCard && successTransaction && (
//               <div className="mb-8 bg-white rounded-xl shadow-lg border border-green-200 overflow-hidden">
//                 <div className="bg-green-600 px-6 py-4">
//                   <div className="flex items-center justify-between">
//                     <h2 className="text-xl font-bold text-white">
//                       {paymentSuccess ? "Payment Successful" : "Active Premium Plan"}
//                     </h2>
//                     <Check className="h-8 w-8 text-white" />
//                   </div>
//                 </div>
//                 <div className="p-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
//                       <div className="space-y-3">
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Transaction ID:</span>
//                           <span className="font-mono text-gray-900">{successTransaction.transaction_id ?? successTransaction.paypal_order_id ?? successTransaction.id}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Date:</span>
//                           <span className="text-gray-900">{new Date(successTransaction.finished_at || successTransaction.created_at).toLocaleString()}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Amount:</span>
//                           <span className="text-gray-900 font-semibold">{renderAmount(successTransaction)}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Payment Method:</span>
//                           <span className="text-gray-900">{renderMethod(successTransaction.payment_mode)}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Status:</span>
//                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                             {successTransaction.status}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
//                       <div className="space-y-3">
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Plan:</span>
//                           <span className="font-semibold text-gray-900">Premium</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Billing Cycle:</span>
//                           <span className="text-gray-900">Monthly</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Next Billing Date:</span>
//                           <span className="text-gray-900">
//                             {profilePlan?.plan_renews_at ? new Date(profilePlan.plan_renews_at).toLocaleDateString() : "N/A"}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Features:</span>
//                           <span className="text-gray-900">Unlimited careercasts</span>
//                         </div>
//                         {profilePlan?.plan_renews_at && (
//                           <div className="flex justify-between">
//                             <span className="text-gray-600">Plan Status:</span>
//                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
//                     <button
//                       onClick={closeSuccessCard}
//                       className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01796F]"
//                     >
//                       Close
//                     </button>
//                     <button
//                       onClick={() => window.print()}
//                       className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#01796F] hover:bg-[#0B4F6C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01796F]"
//                     >
//                       Print Receipt
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {!PAYPAL_CLIENT_ID ? (
//               <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <h3 className="font-medium text-yellow-800">Payment System Not Configured</h3>
//                 <p className="text-yellow-700 text-sm mt-1">PayPal integration is not properly configured. Please contact support or check your environment variables.</p>
//               </div>
//             ) : !clientToken ? (
//               <div className="mb-8 text-sm text-gray-600">Initializing secure payment system…</div>
//             ) : (
//               // Wait for detection to complete so currency choice is stable
//               detected && (
//                 <PayPalScriptProvider
//                   // include currency in key so SDK reloads when currency changes
//                   key={`${clientToken}-${currentCurrency}`}
//                   options={{
//                     clientId: PAYPAL_CLIENT_ID || "",
//                     intent: "capture",
//                     components: "buttons,hosted-fields",
//                     currency: currentCurrency, // IMPORTANT: tells PayPal which currency to use
//                     locale: currentLocale,     // helps with formatting
//                     dataClientToken: clientToken || undefined,
//                   }}
//                 >
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
//                     {plans.map((plan) => {
//                       const isPremium = plan.key === "premium";
//                       const isCurrent = plan.current;

//                       return (
//                         <div key={plan.key} className={`bg-white rounded-lg sm:rounded-xl shadow-sm border-2 ${isCurrent ? "border-[#01796F]" : "border-gray-200"} overflow-hidden hover:shadow-lg transition-all duration-300`}>
//                           {isCurrent && <div className="bg-[#01796F] text-white text-center py-2 text-xs sm:text-sm font-semibold">Current Plan</div>}
//                           <div className="p-4 sm:p-6">
//                             <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
//                             <div className="mb-4 sm:mb-6">
//                               <span className="text-3xl sm:text-4xl font-bold text-gray-900">{plan.price}</span>
//                               <span className="text-gray-600 text-sm sm:text-base">/{plan.period}</span>
//                             </div>
//                             <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
//                               {plan.features.map((f) => (
//                                 <li key={f} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
//                                   <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#01796F] flex-shrink-0 mt-0.5" />
//                                   <span>{f}</span>
//                                 </li>
//                               ))}
//                             </ul>

//                             {isPremium ? (
//                               isCurrent ? (
//                                 <button className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-gray-100 text-gray-500 cursor-not-allowed" disabled>Current Plan</button>
//                               ) : (
//                                 <div className="space-y-6">
//                                   <div className="p-3 border rounded-lg">
//                                     <PayPalButtons
//                                       fundingSource="paypal"
//                                       style={{ layout: "vertical" }}
//                                       disabled={!user || !FUNCTIONS_URL || !SUPABASE_ANON_KEY}
//                                       createOrder={async () => {
//                                         if (!user) throw new Error("Not signed in");
//                                         const isUK = ENABLE_LOCATION_PRICING && userCountry === "GB";
//                                         const amountToCharge = isUK ? 9.99 : 9.99;
//                                         const currency = isUK ? "GBP" : "USD";
//                                         const { data: { session } = {} as any } = await supabase.auth.getSession();
//                                         const accessToken = session?.access_token || "";

//                                         const res = await fetch(`${FUNCTIONS_URL}/create-order`, {
//                                           method: "POST",
//                                           headers: {
//                                             "Content-Type": "application/json",
//                                             Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
//                                             ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY } : {}),
//                                             ...(accessToken ? { "X-User-Token": accessToken } : {}),
//                                           },
//                                           body: JSON.stringify({
//                                             amount: amountToCharge,
//                                             currency: currency,
//                                             user_id: user.id,
//                                             email: user.email,
//                                             metadata: { plan: "premium_monthly", source: "wallet" },
//                                           }),
//                                         });

//                                         const json = await res.json();
//                                         if (!res.ok) {
//                                           console.error("Create order error:", json);
//                                           throw new Error(json.error || "Create order failed");
//                                         }

//                                         (window as any).__paymentId = json.paymentId;
//                                         return json.orderId;
//                                       }}
//                                       onApprove={async (data, actions) => {
//                                         if (!actions.order) {
//                                           throw new Error("PayPal order action is not available");
//                                         }

//                                         return actions.order.capture().then(async (captureResult: any) => {
//                                           try {
//                                             const payerEmail = captureResult?.payer?.email_address ?? null;
//                                             const paymentId = (window as any).__paymentId;
//                                             let updatedPaymentData = null;
//                                             if (paymentId) {
//                                               const response = await fetch(`${FUNCTIONS_URL}/capture-order`, {
//                                                 method: "POST",
//                                                 headers: {
//                                                   "Content-Type": "application/json",
//                                                   Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
//                                                   ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY } : {}),
//                                                 },
//                                                 body: JSON.stringify({
//                                                   paymentId,
//                                                   orderId: data.orderID,
//                                                   captureInfo: captureResult,
//                                                   payer_email: payerEmail,
//                                                   payer_name: `${captureResult?.payer?.name?.given_name ?? ""} ${captureResult?.payer?.name?.surname ?? ""}`.trim() || null,
//                                                 }),
//                                               });
//                                               updatedPaymentData = await response.json();
//                                             }

//                                             setTimeout(() => {
//                                               onPaymentSuccess();
//                                               if (updatedPaymentData?.payment) {
//                                                 setSuccessTransaction(updatedPaymentData.payment);
//                                               }
//                                               showToast("Payment successful! 🎉", "success");
//                                             }, 300);

//                                             return captureResult;
//                                           } catch (err) {
//                                             console.error("onApprove client-side error:", err);
//                                             return Promise.reject(err);
//                                           }
//                                         });
//                                       }}
//                                     />
//                                   </div>

//                                   {hfEligible === false && <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">Card fields aren’t eligible for this browser/region/app.</div>}

//                                   {hfEligible && (
//                                     <PayPalHostedFieldsProvider
//                                       styles={{
//                                         input: { "font-size": "16px" },
//                                         ":focus": { outline: "none" },
//                                         ".invalid": { color: "#ef4444" },
//                                       }}
//                                       createOrder={async () => {
//                                         if (!user) throw new Error("Not signed in");
//                                         const isUK = ENABLE_LOCATION_PRICING && userCountry === "GB";
//                                         const amountToCharge = isUK ? 9.99 : 9.99;
//                                         const currency = isUK ? "GBP" : "USD";
//                                         const { data: { session } = {} as any } = await supabase.auth.getSession();
//                                         const accessToken = session?.access_token || "";

//                                         const res = await fetch(`${FUNCTIONS_URL}/create-order`, {
//                                           method: "POST",
//                                           headers: {
//                                             "Content-Type": "application/json",
//                                             Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
//                                             ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY } : {}),
//                                             ...(accessToken ? { "X-User-Token": accessToken } : {}),
//                                           },
//                                           body: JSON.stringify({
//                                             amount: amountToCharge,
//                                             currency: currency,
//                                             user_id: user.id,
//                                             email: user.email,
//                                             metadata: { plan: "premium_monthly", source: "wallet" },
//                                           }),
//                                         });

//                                         const json = await res.json();
//                                         if (!res.ok) {
//                                           console.error("Create order error:", json);
//                                           throw new Error(json.error || "Create order failed");
//                                         }

//                                         (window as any).__paymentId = json.paymentId;
//                                         return json.orderId;
//                                       }}
//                                     >
//                                       <div className="p-4 border rounded-lg">
//                                         <h4 className="font-semibold mb-3">Pay with debit/credit card</h4>

//                                         <div id="hf-number" className="border rounded px-3 py-2 mb-2 min-h-[44px]" />
//                                         <div className="grid grid-cols-2 gap-2">
//                                           <div id="hf-cvv" className="border rounded px-3 py-2 min-h-[44px]" />
//                                           <div id="hf-exp" className="border rounded px-3 py-2 min-h-[44px]" />
//                                         </div>

//                                         <PayPalHostedField hostedFieldType="number" options={{ selector: "#hf-number", placeholder: "4111 1111 1111 1111" }} />
//                                         <PayPalHostedField hostedFieldType="cvv" options={{ selector: "#hf-cvv", placeholder: "123" }} />
//                                         <PayPalHostedField hostedFieldType="expirationDate" options={{ selector: "#hf-exp", placeholder: "MM/YY" }} />

//                                         <div className="mt-3">
//                                           <CardForm onApproved={onPaymentSuccess} />
//                                         </div>
//                                       </div>
//                                     </PayPalHostedFieldsProvider>
//                                   )}
//                                 </div>
//                               )
//                             ) : (
//                               <button className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-gray-100 text-gray-500 cursor-not-allowed" disabled>{plan.current ? "Current Plan" : "Free Plan"}</button>
//                             )}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {/* Notice to user about PayPal behaviour */}
//                   <div className="text-sm text-gray-600 mb-6">
//                     <strong>Note:</strong> the checkout is created in <span className="font-semibold">{currentCurrency}</span>. PayPal may still show a converted amount in the buyer’s own funding/currency for their convenience; that display is controlled by PayPal and depends on the buyer’s account/funding currency.
//                   </div>
//                 </PayPalScriptProvider>
//               )
//             )}

//             <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-8">
//               <h3 className="text-lg font-semibold text-blue-800 mb-2">Secure Payment Processing</h3>
//               <p className="text-blue-700 text-sm sm:text-base mb-3">All payments are processed securely through PayPal. You don't need to share your credit card information with us.</p>
//               <div className="flex items-center gap-2">
//                 <div className="bg-white px-3 py-1 rounded-full border border-blue-300"><span className="text-blue-800 font-medium text-sm">PayPal</span></div>
//                 <span className="text-blue-600 text-xs">SSL Encrypted</span>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
//               <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Payment History</h2>

//               {loading ? (
//                 <div className="text-center py-8">
//                   <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#01796F]" />
//                   <p className="mt-2 text-gray-600">Loading payment history...</p>
//                 </div>
//               ) : paymentHistory.length > 0 ? (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50"><tr>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                     </tr></thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {paymentHistory.map((p) => (
//                         <tr key={p.id}>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{(p.transaction_id ?? p.paypal_order_id ?? p.id).toString().slice(0, 12)}…</td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{renderDate(p)}</td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{renderAmount(p)}</td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{renderMethod(p.payment_mode)}</td>
//                           <td className="px-4 py-4 whitespace-nowrap">
//                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'completed' ? 'bg-green-100 text-green-800' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
//                               {p.status}
//                             </span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <div className="text-center py-8">
//                   <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
//                   <h3 className="mt-2 text-sm font-medium text-gray-900">No payment history</h3>
//                   <p className="mt-1 text-sm text-gray-500">You haven't made any payments yet.</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }















// // src/pages/Billing.tsx
// import React, { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import { CreditCard, Check, Menu } from "lucide-react";
// import { useAuth } from "../contexts/AuthContext";
// import { supabase } from "../integrations/supabase/client";
// import { showToast } from "../components/ui/toast";
// import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// // Toggle: if true, GB users pay in GBP; others pay USD.
// // If you don't care, just leave as false and everything is in USD.
// const ENABLE_LOCATION_PRICING = false;

// interface PaymentDetail {
//   id: string;
//   user_id: string;
//   amount: number;
//   amount_paid_usd?: number | null;
//   currency: string;
//   status: "created" | "pending" | "completed" | "failed";
//   transaction_id: string | null;
//   paypal_order_id?: string | null;
//   paypal_capture_id?: string | null;
//   payer_email?: string | null;
//   payment_mode?: string | null;
//   created_at: string;
//   finished_at?: string | null;
// }

// type ProfilePlan = {
//   plan_tier: string | null;
//   plan_status: string | null;
//   plan_started_at: string | null;
//   plan_renews_at: string | null;
// };

// export default function Billing() {
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [paymentHistory, setPaymentHistory] = useState<PaymentDetail[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [profilePlan, setProfilePlan] = useState<ProfilePlan | null>(null);
//   const [profileLoading, setProfileLoading] = useState(true);
//   const [refreshPaymentsFlag, setRefreshPaymentsFlag] = useState(0);

//   const [userCountry, setUserCountry] = useState<"US" | "GB" | "OTHER">("US");
//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   const [successTransaction, setSuccessTransaction] =
//     useState<PaymentDetail | null>(null);
//   const [processingPayment, setProcessingPayment] = useState(false);

//   const PAYPAL_CLIENT_ID = import.meta.env
//     .VITE_PAYPAL_CLIENT_ID as string | undefined;

//   const handleLogout = () => navigate("/");

//   // ───────────────── Profile: fetch OR create default free profile ─────────────────
//   const ensureUserProfile = useCallback(async () => {
//     if (!user) return;

//     try {
//       const { data, error } = await supabase
//         .from("profiles")
//         .select("plan_tier, plan_status, plan_started_at, plan_renews_at")
//         .eq("id", user.id)
//         .single();

//       if (error) {
//         console.warn("Profile fetch error:", error);

//         // If no profile row, create default free profile
//         if (
//           error.code === "PGRST116" ||
//           error.message?.includes("404") ||
//           error.message?.includes("No rows found")
//         ) {
//           const nowIso = new Date().toISOString();
//           const { data: newProfile, error: createErr } = await supabase
//             .from("profiles")
//             .insert([
//               {
//                 id: user.id,
//                 email: user.email,
//                 plan_tier: "free",
//                 plan_status: "active",
//                 plan_started_at: null,
//                 plan_renews_at: null,
//                 created_at: nowIso,
//                 updated_at: nowIso,
//               },
//             ])
//             .select("plan_tier, plan_status, plan_started_at, plan_renews_at")
//             .single();

//           if (createErr) {
//             console.error("Failed to create profile:", createErr);
//             setProfilePlan({
//               plan_tier: "free",
//               plan_status: "active",
//               plan_started_at: null,
//               plan_renews_at: null,
//             });
//           } else {
//             setProfilePlan(newProfile as ProfilePlan);
//           }
//         } else {
//           // Other error → fallback to free
//           setProfilePlan({
//             plan_tier: "free",
//             plan_status: "active",
//             plan_started_at: null,
//             plan_renews_at: null,
//           });
//         }
//       } else {
//         setProfilePlan(data as ProfilePlan);
//       }
//     } catch (err) {
//       console.error("Profile ensure error:", err);
//       setProfilePlan({
//         plan_tier: "free",
//         plan_status: "active",
//         plan_started_at: null,
//         plan_renews_at: null,
//       });
//     } finally {
//       setProfileLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     ensureUserProfile();
//   }, [ensureUserProfile, refreshPaymentsFlag, paymentSuccess]);

//   const isPremiumActive =
//     profilePlan?.plan_tier === "premium" &&
//     profilePlan?.plan_status === "active" &&
//     !!profilePlan?.plan_renews_at &&
//     new Date(profilePlan.plan_renews_at) > new Date();

//   // ───────────────── Payment history ─────────────────
//   const fetchPaymentHistory = useCallback(async () => {
//     if (!user) return;
//     setLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from("payment_details")
//         .select(
//           "id,user_id,amount,amount_paid_usd,currency,status,transaction_id,paypal_order_id,paypal_capture_id,payer_email,payment_mode,created_at,finished_at"
//         )
//         .eq("user_id", user.id)
//         .order("created_at", { ascending: false });

//       if (error) {
//         console.error("fetchPaymentHistory error:", error);
//         setPaymentHistory([]);
//       } else {
//         setPaymentHistory((data as PaymentDetail[]) || []);
//       }
//     } catch (err) {
//       console.error("Error fetching payment history:", err);
//       setPaymentHistory([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchPaymentHistory();
//   }, [fetchPaymentHistory, refreshPaymentsFlag]);

//   // ───────────────── Country detection (simple) ─────────────────
//   useEffect(() => {
//     // To avoid CORS/IP API issues, just set a default.
//     if (ENABLE_LOCATION_PRICING) {
//       setUserCountry("US"); // you can change to "GB" manually for testing GBP
//     } else {
//       setUserCountry("US");
//     }
//   }, []);

//   // ───────────────── Plans & helpers ─────────────────
//   const plans = [
//     {
//       key: "free",
//       name: "Free",
//       price: "$0",
//       period: "forever",
//       features: [
//         "3 careercasts per month",
//         "Basic video recording",
//         "Standard resume upload",
//         "Community support",
//       ],
//       current: !isPremiumActive,
//     },
//     {
//       key: "premium",
//       name: "Premium",
//       price: ENABLE_LOCATION_PRICING && userCountry === "GB" ? "£9.99" : "$9.99",
//       period: "month",
//       features: [
//         "Unlimited careercasts",
//         "HD video recording",
//         "Advanced analytics",
//         "Priority support",
//         "Custom branding",
//       ],
//       current: isPremiumActive,
//     },
//   ];

//   const renderMethod = (mode?: string | null) =>
//     !mode ? "PayPal" : mode === "paypal" ? "Wallet (PayPal)" : mode === "card" ? "Card" : mode;

//   const renderDate = (p: PaymentDetail) =>
//     new Date(p.finished_at || p.created_at).toLocaleDateString();

//   const renderAmount = (p: PaymentDetail) =>
//     `${p.currency === "GBP" ? "£" : "$"}${Number(
//       p.status === "completed" && p.amount_paid_usd != null
//         ? p.amount_paid_usd
//         : p.amount
//     ).toFixed(2)}`;

//   // Free trials left: based on completed payments
//   const completedCount = paymentHistory.filter(
//     (p) => p.status === "completed"
//   ).length;
//   const freeRemaining = Math.max(3 - completedCount, 0);

//   const currentCurrency =
//     ENABLE_LOCATION_PRICING && userCountry === "GB" ? "GBP" : "USD";
//   const currentLocale = currentCurrency === "GBP" ? "en_GB" : "en_US";
//   const premiumAmount = 9.99; // same number; currency changes label only

//   // ───────────────── Payment success handler ─────────────────
//   const onPaymentSuccess = useCallback(
//     async (paymentRow: PaymentDetail | null) => {
//       setPaymentSuccess(true);
//       setProcessingPayment(false);
//       if (paymentRow) setSuccessTransaction(paymentRow);

//       // Mark plan as premium active and set start/end in profiles
//       if (user) {
//         try {
//           const now = new Date();
//           const renew = new Date(now);
//           renew.setMonth(now.getMonth() + 1);

//           const { error } = await supabase.from("profiles").upsert(
//             [
//               {
//                 id: user.id,
//                 email: user.email,
//                 plan_tier: "premium",
//                 plan_status: "active",
//                 plan_started_at: now.toISOString(),
//                 plan_renews_at: renew.toISOString(),
//                 updated_at: now.toISOString(),
//               },
//             ],
//             { onConflict: "id" }
//           );

//           if (error) {
//             console.error("Failed to update profile plan:", error);
//           }
//         } catch (err) {
//           console.error("Error updating profile plan:", err);
//         }
//       }

//       setRefreshPaymentsFlag((n) => n + 1);
//       showToast("Payment successful! 🎉", "success");
//     },
//     [user]
//   );

//   const shouldShowSuccessCard = paymentSuccess || isPremiumActive;

//   const closeSuccessCard = () => {
//     setPaymentSuccess(false);
//     setSuccessTransaction(null);
//   };

//   // ───────────────── createOrder: check auth.users before starting payment ─────────────────
//   const createOrder = async (
//     _data: any,
//     actions: any
//   ): Promise<string> => {
//     if (!user) {
//       showToast("You can't pay here. Please sign in first.", "error");
//       throw new Error("user_not_logged_in");
//     }

//     // 🔒 Check Supabase Auth (auth.users) via supabase.auth.getUser
//     const {
//       data: authData,
//       error: authError,
//     } = await supabase.auth.getUser();

//     if (authError || !authData?.user) {
//       console.error("Auth getUser error or no user:", authError);
//       showToast("You can't pay here. Please log in again.", "error");
//       throw new Error("auth_user_not_found");
//     }

//     // At this point, user definitely exists in auth.users.
//     setProcessingPayment(true);

//     const isUK = ENABLE_LOCATION_PRICING && userCountry === "GB";
//     const currency = isUK ? "GBP" : "USD";

//     // Use PayPal JS SDK to create order (no edge function)
//     return actions.order.create({
//       purchase_units: [
//         {
//           amount: {
//             value: premiumAmount.toFixed(2),
//             currency_code: currency,
//           },
//         },
//       ],
//       application_context: {
//         shipping_preference: "NO_SHIPPING",
//       },
//     });
//   };

//   // ───────────────── onApprove: capture + store in payment_details + update profiles ─────────────────
//   // const onApprove = async (data: any, actions: any) => {
//   //   try {
//   //     if (!actions.order) {
//   //       throw new Error("PayPal order action is not available");
//   //     }

//   //     const captureResult = await actions.order.capture();

//   //     if (!user) {
//   //       showToast(
//   //         "Payment captured, but user session was lost. Contact support.",
//   //         "error"
//   //       );
//   //       setProcessingPayment(false);
//   //       return;
//   //     }

//   //     const isUK = ENABLE_LOCATION_PRICING && userCountry === "GB";
//   //     const currency = isUK ? "GBP" : "USD";

//   //     const payerEmail = captureResult?.payer?.email_address ?? null;
//   //     const captureId =
//   //       captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id ??
//   //       captureResult?.id ??
//   //       null;

//   //     // Insert payment record into payment_details
//   //     const nowIso = new Date().toISOString();

//   //     const { data: inserted, error: insertErr } = await supabase
//   //       .from("payment_details")
//   //       .insert([
//   //         {
//   //           user_id: user.id,
//   //           amount: premiumAmount,
//   //           amount_paid_usd: currency === "USD" ? premiumAmount : null,
//   //           currency,
//   //           status: "completed",
//   //           transaction_id: captureId,
//   //           paypal_order_id: data.orderID,
//   //           paypal_capture_id: captureId,
//   //           payer_email: payerEmail,
//   //           payment_mode: "paypal",
//   //           finished_at: nowIso,
//   //         },
//   //       ])
//   //       .select()
//   //       .single();

//   //     if (insertErr) {
//   //       console.error("payment_details insert error:", insertErr);
//   //       showToast(
//   //         "Payment captured, but we couldn't store it. Contact support.",
//   //         "error"
//   //       );
//   //       setProcessingPayment(false);
//   //       return;
//   //     }

//   //     await onPaymentSuccess(inserted as PaymentDetail);
//   //     return captureResult;
//   //   } catch (error: any) {
//   //     console.error("Payment approval error:", error);
//   //     setProcessingPayment(false);
//   //     showToast(
//   //       error?.message || "Payment processing failed. Please try again.",
//   //       "error"
//   //     );
//   //     throw error;
//   //   }
//   // };

//   // ───────────────── onApprove: capture + store in payment_details + update profiles ─────────────────
// const onApprove = async (data: any, actions: any) => {
//   try {
//     if (!actions.order) {
//       throw new Error("PayPal order action is not available");
//     }

//     const captureResult = await actions.order.capture();

//     if (!user) {
//       showToast(
//         "Payment captured, but user session was lost. Contact support.",
//         "error"
//       );
//       setProcessingPayment(false);
//       return;
//     }

//     const isUK = ENABLE_LOCATION_PRICING && userCountry === "GB";
//     const currency = isUK ? "GBP" : "USD";

//     const payerEmail = captureResult?.payer?.email_address ?? null;
//     const captureId =
//       captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id ??
//       captureResult?.id ??
//       null;

//     const nowIso = new Date().toISOString();

//     // 👇 IMPORTANT: include created_at so NOT NULL constraints won't fail
//     const { data: inserted, error: insertErr } = await supabase
//       .from("payment_details")
//       .insert([
//         {
//           user_id: user.id,
//           amount: premiumAmount,
//           amount_paid_usd: currency === "USD" ? premiumAmount : null,
//           currency,
//           status: "completed",
//           transaction_id: captureId,
//           paypal_order_id: data.orderID,
//           paypal_capture_id: captureId,
//           payer_email: payerEmail,
//           payment_mode: "paypal",
//           created_at: nowIso,
//           finished_at: nowIso,
//         },
//       ])
//       .select()
//       .single();

//     if (insertErr) {
//       console.error("payment_details insert error:", insertErr);
//       // 🔍 show actual DB error to you
//       showToast(
//         `DB error: ${insertErr.message || "payment_details insert failed"}`,
//         "error"
//       );
//       setProcessingPayment(false);
//       return;
//     }

//     await onPaymentSuccess(inserted as PaymentDetail);
//     return captureResult;
//   } catch (error: any) {
//     console.error("Payment approval error:", error);
//     setProcessingPayment(false);
//     showToast(
//       error?.message || "Payment processing failed. Please try again.",
//       "error"
//     );
//     throw error;
//   }
// };

//   if (profileLoading) {
//     return (
//       <div className="min-h-screen bg-white flex">
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#01796F]" />
//             <p className="mt-2 text-gray-600">Loading billing information...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white flex">
//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <div
//         className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
//       >
//         <Sidebar userEmail={user?.email || ""} onLogout={handleLogout} />
//       </div>

//       {/* Main content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Mobile top bar */}
//         <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
//           <button
//             onClick={() => setSidebarOpen(true)}
//             className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
//           >
//             <Menu className="h-6 w-6" />
//           </button>
//           <div className="font-bold text-xl text-[#0B4F6C]">careercast</div>
//           <div className="w-10" />
//         </div>

//         {/* Toast container */}
//         <div id="toast-container" className="fixed top-4 right-4 z-50" />

//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50">
//           <div className="max-w-6xl mx-auto">
//             <div className="mb-6 sm:mb-8">
//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
//                 Billing & Payment
//               </h1>
//               <p className="text-gray-600 text-sm sm:text-base">
//                 Manage your subscription, payment methods, and billing history
//               </p>
//             </div>

//             {/* Success / Active Premium card */}
//             {shouldShowSuccessCard && successTransaction && (
//               <div className="mb-8 bg-white rounded-xl shadow-lg border border-green-200 overflow-hidden">
//                 <div className="bg-green-600 px-6 py-4">
//                   <div className="flex items-center justify-between">
//                     <h2 className="text-xl font-bold text-white">
//                       {paymentSuccess ? "Payment Successful" : "Active Premium Plan"}
//                     </h2>
//                     <Check className="h-8 w-8 text-white" />
//                   </div>
//                 </div>
//                 <div className="p-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                         Transaction Details
//                       </h3>
//                       <div className="space-y-3">
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Transaction ID:</span>
//                           <span className="font-mono text-gray-900">
//                             {successTransaction.transaction_id ??
//                               successTransaction.paypal_order_id ??
//                               successTransaction.id}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Date:</span>
//                           <span className="text-gray-900">
//                             {new Date(
//                               successTransaction.finished_at ||
//                                 successTransaction.created_at
//                             ).toLocaleString()}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Amount:</span>
//                           <span className="text-gray-900 font-semibold">
//                             {renderAmount(successTransaction)}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Payment Method:</span>
//                           <span className="text-gray-900">
//                             {renderMethod(successTransaction.payment_mode)}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Status:</span>
//                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                             {successTransaction.status}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                         Subscription Details
//                       </h3>
//                       <div className="space-y-3">
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Plan:</span>
//                           <span className="font-semibold text-gray-900">
//                             Premium
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Billing Cycle:</span>
//                           <span className="text-gray-900">Monthly</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">
//                             Next Billing Date:
//                           </span>
//                           <span className="text-gray-900">
//                             {profilePlan?.plan_renews_at
//                               ? new Date(
//                                   profilePlan.plan_renews_at
//                                 ).toLocaleDateString()
//                               : "N/A"}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Features:</span>
//                           <span className="text-gray-900">
//                             Unlimited careercasts
//                           </span>
//                         </div>
//                         {profilePlan?.plan_renews_at && (
//                           <div className="flex justify-between">
//                             <span className="text-gray-600">Plan Status:</span>
//                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                               Active
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
//                     <button
//                       onClick={closeSuccessCard}
//                       className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01796F]"
//                     >
//                       Close
//                     </button>
//                     <button
//                       onClick={() => window.print()}
//                       className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#01796F] hover:bg-[#0B4F6C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01796F]"
//                     >
//                       Print Receipt
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* PayPal section */}
//             {!PAYPAL_CLIENT_ID ? (
//               <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <h3 className="font-medium text-yellow-800">
//                   Payment System Not Configured
//                 </h3>
//                 <p className="text-yellow-700 text-sm mt-1">
//                   PayPal integration is not configured. Set
//                   {" "}
//                   <code>VITE_PAYPAL_CLIENT_ID</code> in your <code>.env</code>.
//                 </p>
//               </div>
//             ) : (
//               <PayPalScriptProvider
//                 options={{
//                   clientId: PAYPAL_CLIENT_ID,
//                   intent: "capture",
//                   components: "buttons",
//                   currency: currentCurrency,
//                   locale: currentLocale,
//                 }}
//               >
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
//                   {plans.map((plan) => {
//                     const isPremium = plan.key === "premium";
//                     const isCurrent = plan.current;

//                     return (
//                       <div
//                         key={plan.key}
//                         className={`bg-white rounded-lg sm:rounded-xl shadow-sm border-2 ${
//                           isCurrent ? "border-[#01796F]" : "border-gray-200"
//                         } overflow-hidden hover:shadow-lg transition-all duration-300`}
//                       >
//                         {isCurrent && (
//                           <div className="bg-[#01796F] text-white text-center py-2 text-xs sm:text-sm font-semibold">
//                             Current Plan
//                           </div>
//                         )}
//                         <div className="p-4 sm:p-6">
//                           <div className="flex items-center justify-between mb-2">
//                             <h3 className="text-lg sm:text-xl font-bold text-gray-900">
//                               {plan.name}
//                             </h3>

//                             {/* 🔶 Free plan badge */}
//                             {plan.key === "free" && (
//                               <div className="bg-orange-100 text-orange-800 text-xs sm:text-sm px-3 py-1 rounded-full font-semibold">
//                                 Your {freeRemaining}/3 free trials left
//                               </div>
//                             )}
//                           </div>

//                           <div className="mb-4 sm:mb-6">
//                             <span className="text-3xl sm:text-4xl font-bold text-gray-900">
//                               {plan.price}
//                             </span>
//                             <span className="text-gray-600 text-sm sm:text-base">
//                               /{plan.period}
//                             </span>
//                           </div>
//                           <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
//                             {plan.features.map((f) => (
//                               <li
//                                 key={f}
//                                 className="flex items-start gap-2 text-xs sm:text-sm text-gray-600"
//                               >
//                                 <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#01796F] flex-shrink-0 mt-0.5" />
//                                 <span>{f}</span>
//                               </li>
//                             ))}
//                           </ul>

//                           {isPremium ? (
//                             isCurrent ? (
//                               <button
//                                 className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-gray-100 text-gray-500 cursor-not-allowed"
//                                 disabled
//                               >
//                                 Current Plan
//                               </button>
//                             ) : (
//                               <div className="space-y-6">
//                                 <div className="p-3 border rounded-lg">
//                                   <PayPalButtons
//                                     style={{
//                                       layout: "vertical",
//                                       color: "gold",
//                                       shape: "rect",
//                                       label: "checkout",
//                                     }}
//                                     disabled={processingPayment}
//                                     createOrder={createOrder}
//                                     onApprove={onApprove}
//                                     onError={(err) => {
//                                       console.error(
//                                         "PayPal Button Error:",
//                                         err
//                                       );
//                                       setProcessingPayment(false);
//                                       showToast(
//                                         "Payment failed. Please try again.",
//                                         "error"
//                                       );
//                                     }}
//                                     onCancel={() => {
//                                       setProcessingPayment(false);
//                                       showToast(
//                                         "Payment cancelled",
//                                         "info"
//                                       );
//                                     }}
//                                   />
//                                 </div>
//                               </div>
//                             )
//                           ) : (
//                             <button
//                               className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-gray-100 text-gray-500 cursor-not-allowed"
//                               disabled
//                             >
//                               {plan.current ? "Current Plan" : "Free Plan"}
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>

//                 <div className="text-sm text-gray-600 mb-6">
//                   <strong>Note:</strong> checkout is created in{" "}
//                   <span className="font-semibold">{currentCurrency}</span>.
//                   PayPal may still show a converted amount in the buyer’s own
//                   currency.
//                 </div>
//               </PayPalScriptProvider>
//             )}

//             {/* Security note */}
//             <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-8">
//               <h3 className="text-lg font-semibold text-blue-800 mb-2">
//                 Secure Payment Processing
//               </h3>
//               <p className="text-blue-700 text-sm sm:text-base mb-3">
//                 All payments are processed securely through PayPal. You don't
//                 need to share your credit card information with us.
//               </p>
//               <div className="flex items-center gap-2">
//                 <div className="bg-white px-3 py-1 rounded-full border border-blue-300">
//                   <span className="text-blue-800 font-medium text-sm">
//                     PayPal
//                   </span>
//                 </div>
//                 <span className="text-blue-600 text-xs">SSL Encrypted</span>
//               </div>
//             </div>

//             {/* Payment history */}
//             <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
//               <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
//                 Payment History
//               </h2>

//               {loading ? (
//                 <div className="text-center py-8">
//                   <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#01796F]" />
//                   <p className="mt-2 text-gray-600">
//                     Loading payment history...
//                   </p>
//                 </div>
//               ) : paymentHistory.length > 0 ? (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Transaction
//                         </th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Date
//                         </th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Amount
//                         </th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Method
//                         </th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Status
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {paymentHistory.map((p) => (
//                         <tr key={p.id}>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                             {(p.transaction_id ??
//                               p.paypal_order_id ??
//                               p.id
//                             ).toString().slice(0, 12)}
//                             …
//                           </td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {renderDate(p)}
//                           </td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {renderAmount(p)}
//                           </td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {renderMethod(p.payment_mode)}
//                           </td>
//                           <td className="px-4 py-4 whitespace-nowrap">
//                             <span
//                               className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                                 p.status === "completed"
//                                   ? "bg-green-100 text-green-800"
//                                   : p.status === "pending"
//                                   ? "bg-yellow-100 text-yellow-800"
//                                   : "bg-red-100 text-red-800"
//                               }`}
//                             >
//                               {p.status}
//                             </span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <div className="text-center py-8">
//                   <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
//                   <h3 className="mt-2 text-sm font-medium text-gray-900">
//                     No payment history
//                   </h3>
//                   <p className="mt-1 text-sm text-gray-500">
//                     You haven't made any payments yet.
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Free trials summary */}
//             <div className="mb-8">
//               <div className="flex items-center gap-3">
//                 <div className="text-sm text-gray-700">
//                   Free plan trials left:
//                 </div>
//                 <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-md font-semibold text-sm">
//                   {freeRemaining}/3 free trials left
//                 </div>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }











// // src/pages/Billing.tsx
// import React, { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import { CreditCard, Check, Menu } from "lucide-react";
// import { useAuth } from "../contexts/AuthContext";
// import { supabase } from "../integrations/supabase/client";
// import { showToast } from "../components/ui/toast";
// import {
//   PayPalScriptProvider,
//   PayPalButtons,
// } from "@paypal/react-paypal-js";

// // ───────────────── CONFIG ─────────────────
// // We’ll stick to simple pricing: always USD 9.99 for now.
// // (If you later want GBP as well, you can reintroduce detection.)
// const PREMIUM_PRICE_USD = 9.99;

// // ───────────────── TYPES ─────────────────
// interface PaymentDetail {
//   id: string;
//   user_id: string | null;
//   email: string | null;
//   amount: number;
//   currency: string;
//   amount_paid_usd?: number | null;
//   created_at: string;
//   finished_at?: string | null;
//   status: "created" | "pending" | "completed" | "failed";
//   capture_status: string | null;
//   paypal_order_id?: string | null;
//   paypal_capture_id?: string | null;
//   transaction_id: string | null;
//   payer_name: string | null;
//   payer_email: string | null;
//   payment_mode: string | null;
//   card_brand?: string | null;
//   card_type?: string | null;
//   card_last4?: string | null;
//   card_holder_name?: string | null;
//   addr_name?: string | null;
//   addr_line1?: string | null;
//   addr_line2?: string | null;
//   addr_city?: string | null;
//   addr_state?: string | null;
//   addr_postal?: string | null;
//   addr_country?: string | null;
//   metadata?: any;
// }

// type ProfilePlan = {
//   plan_tier: string | null;
//   plan_status: string | null;
//   plan_started_at: string | null;
//   plan_renews_at: string | null;
// };

// // ───────────────── COMPONENT ─────────────────
// export default function Billing() {
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [paymentHistory, setPaymentHistory] = useState<PaymentDetail[]>([]);
//   const [loadingHistory, setLoadingHistory] = useState(true);
//   const [refreshPaymentsFlag, setRefreshPaymentsFlag] = useState(0);

//   const [profilePlan, setProfilePlan] = useState<ProfilePlan | null>(null);
//   const [profileLoading, setProfileLoading] = useState(true);

//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   const [successTransaction, setSuccessTransaction] =
//     useState<PaymentDetail | null>(null);
//   const [processingPayment, setProcessingPayment] = useState(false);

//   const PAYPAL_CLIENT_ID = import.meta.env
//     .VITE_PAYPAL_CLIENT_ID as string | undefined;

//   const handleLogout = () => navigate("/");

//   // ───────────────── Ensure profile row exists ─────────────────
//   const ensureUserProfile = useCallback(async () => {
//     if (!user) return;

//     try {
//       const { data, error } = await supabase
//         .from("profiles")
//         .select("plan_tier, plan_status, plan_started_at, plan_renews_at")
//         .eq("id", user.id)
//         .single();

//       if (error) {
//         console.warn("Profile fetch error:", error);

//         // If profile missing, create a basic free one
//         if (
//           error.code === "PGRST116" ||
//           error.message?.includes("404") ||
//           error.message?.toLowerCase().includes("no rows")
//         ) {
//           const nowIso = new Date().toISOString();
//           const { data: newProfile, error: createError } = await supabase
//             .from("profiles")
//             .insert([
//               {
//                 id: user.id,
//                 email: user.email,
//                 plan_tier: "free",
//                 plan_status: "active",
//                 plan_started_at: null,
//                 plan_renews_at: null,
//                 created_at: nowIso,
//                 updated_at: nowIso,
//               },
//             ])
//             .select("plan_tier, plan_status, plan_started_at, plan_renews_at")
//             .single();

//           if (createError) {
//             console.error("Failed to create profile:", createError);
//             setProfilePlan({
//               plan_tier: "free",
//               plan_status: "active",
//               plan_started_at: null,
//               plan_renews_at: null,
//             });
//           } else {
//             setProfilePlan(newProfile as ProfilePlan);
//           }
//         } else {
//           setProfilePlan({
//             plan_tier: "free",
//             plan_status: "active",
//             plan_started_at: null,
//             plan_renews_at: null,
//           });
//         }
//       } else {
//         setProfilePlan(data as ProfilePlan);
//       }
//     } catch (err) {
//       console.error("ensureUserProfile error:", err);
//       setProfilePlan({
//         plan_tier: "free",
//         plan_status: "active",
//         plan_started_at: null,
//         plan_renews_at: null,
//       });
//     } finally {
//       setProfileLoading(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     ensureUserProfile();
//   }, [ensureUserProfile, refreshPaymentsFlag, paymentSuccess]);

//   const isPremiumActive =
//     profilePlan?.plan_tier === "premium" &&
//     profilePlan?.plan_status === "active" &&
//     !!profilePlan?.plan_renews_at &&
//     new Date(profilePlan.plan_renews_at) > new Date();

//   // ───────────────── Payment history ─────────────────
//   const fetchPaymentHistory = useCallback(async () => {
//     if (!user) return;
//     setLoadingHistory(true);
//     try {
//       const { data, error } = await supabase
//         .from("payment_details")
//         .select(
//           "id,user_id,email,amount,amount_paid_usd,currency,created_at,finished_at,status,capture_status,paypal_order_id,paypal_capture_id,transaction_id,payer_name,payer_email,payment_mode,card_brand,card_type,card_last4,card_holder_name,addr_name,addr_line1,addr_line2,addr_city,addr_state,addr_postal,addr_country,metadata"
//         )
//         .eq("user_id", user.id)
//         .order("created_at", { ascending: false });

//       if (error) {
//         console.error("fetchPaymentHistory error:", error);
//         setPaymentHistory([]);
//       } else {
//         setPaymentHistory((data as PaymentDetail[]) || []);
//       }
//     } catch (err) {
//       console.error("Error fetching payment history:", err);
//       setPaymentHistory([]);
//     } finally {
//       setLoadingHistory(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchPaymentHistory();
//   }, [fetchPaymentHistory, refreshPaymentsFlag]);

//   // ───────────────── Helpers ─────────────────
//   const renderMethod = (mode?: string | null) =>
//     !mode
//       ? "PayPal"
//       : mode === "paypal"
//       ? "Wallet (PayPal)"
//       : mode === "card"
//       ? "Card"
//       : mode;

//   const renderDate = (p: PaymentDetail) =>
//     new Date(p.finished_at || p.created_at).toLocaleDateString();

//   const renderAmount = (p: PaymentDetail) =>
//     `${p.currency === "GBP" ? "£" : "$"}${Number(
//       p.amount_paid_usd ?? p.amount
//     ).toFixed(2)}`;

//   // Free trials: based on completed payments
//   const completedCount = paymentHistory.filter(
//     (p) => p.status === "completed"
//   ).length;
//   const freeRemaining = Math.max(3 - completedCount, 0);

//   // ───────────────── onPaymentSuccess ─────────────────
//   // const onPaymentSuccess = useCallback(
//   //   async (storedPayment: PaymentDetail | null) => {
//   //     try {
//   //       // Mark UI
//   //       setPaymentSuccess(true);
//   //       setProcessingPayment(false);
//   //       if (storedPayment) setSuccessTransaction(storedPayment);

//   //       // Refresh history + plan
//   //       setRefreshPaymentsFlag((n) => n + 1);

//   //       // Update profile to premium monthly
//   //       if (user) {
//   //         const now = new Date();
//   //         const renew = new Date(now);
//   //         renew.setMonth(now.getMonth() + 1);

//   //         const nowIso = now.toISOString();
//   //         const renewIso = renew.toISOString();

//   //         const { error: upsertErr } = await supabase
//   //           .from("profiles")
//   //           .upsert(
//   //             [
//   //               {
//   //                 id: user.id,
//   //                 email: user.email,
//   //                 plan_tier: "premium",
//   //                 plan_status: "active",
//   //                 plan_started_at: nowIso,
//   //                 plan_renews_at: renewIso,
//   //                 updated_at: nowIso,
//   //               },
//   //             ],
//   //             { onConflict: "id" }
//   //           );

//   //         if (upsertErr) {
//   //           console.error("profiles upsert error:", upsertErr);
//   //         }
//   //       }

//   //       showToast("Payment successful! 🎉", "success");
//   //     } catch (err) {
//   //       console.error("onPaymentSuccess error:", err);
//   //     }
//   //   },
//   //   [user]
//   // );
//   // onPaymentSuccess -> only UI + refresh now
// const onPaymentSuccess = useCallback(
//   async (storedPayment: PaymentDetail | null) => {
//     try {
//       setPaymentSuccess(true);
//       setProcessingPayment(false);
//       if (storedPayment) setSuccessTransaction(storedPayment);

//       // Refresh history (which also recomputes free trials)
//       setRefreshPaymentsFlag((n) => n + 1);

//       showToast("Payment successful! 🎉", "success");
//     } catch (err) {
//       console.error("onPaymentSuccess error:", err);
//     }
//   },
//   []
// );


//   const shouldShowSuccessCard = paymentSuccess || isPremiumActive;

//   const closeSuccessCard = () => {
//     setPaymentSuccess(false);
//     setSuccessTransaction(null);
//   };

//   // ───────────────── PayPal createOrder & onApprove ─────────────────
//   const createOrder = async (
//     _data: any,
//     actions: any
//   ): Promise<string> => {
//     if (!user) {
//       showToast("You can't pay here. Please log in first.", "error");
//       throw new Error("not_logged_in");
//     }

//     // Extra safety: confirm user exists in auth.users
//     const { data: authData, error: authError } = await supabase.auth.getUser();
//     if (authError || !authData?.user) {
//       console.error("auth.getUser error:", authError);
//       showToast("You can't pay here. Please log in again.", "error");
//       throw new Error("auth_user_not_found");
//     }

//     setProcessingPayment(true);

//     const orderId = await actions.order.create({
//       purchase_units: [
//         {
//           amount: {
//             value: PREMIUM_PRICE_USD.toFixed(2),
//             currency_code: "USD",
//           },
//           description: "CareerCast Premium – Monthly",
//         },
//       ],
//       application_context: {
//         shipping_preference: "NO_SHIPPING",
//       },
//     });

//     return orderId;
//   };

//   // const onApprove = async (data: any, actions: any) => {
//   //   try {
//   //     if (!actions.order) {
//   //       throw new Error("PayPal order action is not available");
//   //     }

//   //     const captureResult = await actions.order.capture();

//   //     if (!user) {
//   //       showToast(
//   //         "Payment captured, but user session was lost. Contact support.",
//   //         "error"
//   //       );
//   //       setProcessingPayment(false);
//   //       return;
//   //     }

//   //     const payerEmail =
//   //       captureResult?.payer?.email_address ??
//   //       captureResult?.payment_source?.paypal?.email_address ??
//   //       null;
//   //     const payerName = `${captureResult?.payer?.name?.given_name || ""} ${
//   //       captureResult?.payer?.name?.surname || ""
//   //     }`.trim() || null;

//   //     const capture =
//   //       captureResult?.purchase_units?.[0]?.payments?.captures?.[0] ??
//   //       null;

//   //     const captureId = capture?.id ?? captureResult?.id ?? null;
//   //     const captureStatus = capture?.status ?? captureResult?.status ?? null;
//   //     const nowIso = new Date().toISOString();

//   //     // Insert into payment_details (matches your schema)
//   //     const { data: inserted, error: insertErr } = await supabase
//   //       .from("payment_details")
//   //       .insert([
//   //         {
//   //           user_id: user.id,
//   //           email: user.email,
//   //           amount: PREMIUM_PRICE_USD,
//   //           currency: "USD",
//   //           amount_paid_usd: PREMIUM_PRICE_USD,
//   //           status: "completed", // payment_status enum must include 'completed'
//   //           capture_status: captureStatus || "COMPLETED",
//   //           paypal_order_id: data.orderID,
//   //           paypal_capture_id: captureId,
//   //           transaction_id: captureId,
//   //           payer_name: payerName,
//   //           payer_email: payerEmail,
//   //           payment_mode: "paypal",
//   //           card_brand: null,
//   //           card_type: null,
//   //           card_last4: null,
//   //           card_holder_name: null,
//   //           addr_name: null,
//   //           addr_line1: null,
//   //           addr_line2: null,
//   //           addr_city: null,
//   //           addr_state: null,
//   //           addr_postal: null,
//   //           addr_country: null,
//   //           metadata: {
//   //             plan: "premium_monthly",
//   //             source: "wallet",
//   //             raw_paypal: {
//   //               id: captureId,
//   //               status: captureStatus,
//   //             },
//   //           },
//   //           created_at: nowIso,
//   //           finished_at: nowIso,
//   //         },
//   //       ])
//   //       .select()
//   //       .single();

//   //     if (insertErr) {
//   //       console.error("payment_details insert error:", insertErr);
//   //       // Show actual DB error to you during dev:
//   //       showToast(
//   //         `Payment captured, but we couldn't store it: ${
//   //           insertErr.message || "DB error"
//   //         }`,
//   //         "error"
//   //       );
//   //       setProcessingPayment(false);
//   //       return;
//   //     }

//   //     await onPaymentSuccess(inserted as PaymentDetail);
//   //     return captureResult;
//   //   } catch (error: any) {
//   //     console.error("Payment approval error:", error);
//   //     setProcessingPayment(false);
//   //     showToast(
//   //       error?.message || "Payment processing failed. Please try again.",
//   //       "error"
//   //     );
//   //     throw error;
//   //   }
//   // };


//   // ───────────────── PayPal onApprove ─────────────────
// const onApprove = async (data: any, actions: any) => {
//   try {
//     if (!actions.order) {
//       throw new Error("PayPal order action is not available");
//     }

//     // 1) Capture on PayPal
//     const captureResult = await actions.order.capture();

//     if (!user) {
//       showToast(
//         "Payment captured, but user session was lost. Contact support.",
//         "error"
//       );
//       setProcessingPayment(false);
//       return;
//     }

//     // 2) Extra safety: confirm user exists in auth.users
//     const { data: authData, error: authError } = await supabase.auth.getUser();
//     if (authError || !authData?.user) {
//       console.error("auth.getUser error:", authError);
//       showToast("You can't pay here. Please log in again.", "error");
//       setProcessingPayment(false);
//       return;
//     }

//     // 3) Ensure a profile row exists BEFORE inserting into payment_details
//     //    (this is what fixes the FK error)
//     const now = new Date();
//     const renew = new Date(now);
//     renew.setMonth(now.getMonth() + 1);

//     const nowIso = now.toISOString();
//     const renewIso = renew.toISOString();

//     const { error: profileErr } = await supabase
//       .from("profiles")
//       .upsert(
//         [
//           {
//             id: user.id,          // must match auth.users id
//             email: user.email,
//             plan_tier: "premium",
//             plan_status: "active",
//             plan_started_at: nowIso,
//             plan_renews_at: renewIso,
//             updated_at: nowIso,
//           },
//         ],
//         { onConflict: "id" }
//       );

//     if (profileErr) {
//       console.error("profile upsert error before payment insert:", profileErr);
//       showToast(
//         "Payment captured, but we couldn't set up your profile. Contact support.",
//         "error"
//       );
//       setProcessingPayment(false);
//       return;
//     }

//     // 4) Extract PayPal data
//     const payerEmail =
//       captureResult?.payer?.email_address ??
//       captureResult?.payment_source?.paypal?.email_address ??
//       null;
//     const payerName =
//       `${captureResult?.payer?.name?.given_name || ""} ${
//         captureResult?.payer?.name?.surname || ""
//       }`.trim() || null;

//     const capture =
//       captureResult?.purchase_units?.[0]?.payments?.captures?.[0] ?? null;

//     const captureId = capture?.id ?? captureResult?.id ?? null;
//     const captureStatus = capture?.status ?? captureResult?.status ?? null;

//     // 5) Insert into payment_details (FK is now satisfied because profile exists)
//     const { data: inserted, error: insertErr } = await supabase
//       .from("payment_details")
//       .insert([
//         {
//           user_id: user.id,
//           email: user.email,
//           amount: PREMIUM_PRICE_USD,
//           currency: "USD",
//           amount_paid_usd: PREMIUM_PRICE_USD,
//           status: "completed", // payment_status enum must have 'completed'
//           capture_status: captureStatus || "COMPLETED",
//           paypal_order_id: data.orderID,
//           paypal_capture_id: captureId,
//           transaction_id: captureId,
//           payer_name: payerName,
//           payer_email: payerEmail,
//           payment_mode: "paypal",
//           card_brand: null,
//           card_type: null,
//           card_last4: null,
//           card_holder_name: null,
//           addr_name: null,
//           addr_line1: null,
//           addr_line2: null,
//           addr_city: null,
//           addr_state: null,
//           addr_postal: null,
//           addr_country: null,
//           metadata: {
//             plan: "premium_monthly",
//             source: "wallet",
//             raw_paypal: {
//               id: captureId,
//               status: captureStatus,
//             },
//           },
//           created_at: nowIso,
//           finished_at: nowIso,
//         },
//       ])
//       .select()
//       .single();

//     if (insertErr) {
//       console.error("payment_details insert error:", insertErr);
//       showToast(
//         `Payment captured, but we couldn't store it: ${
//           insertErr.message || "DB error"
//         }`,
//         "error"
//       );
//       setProcessingPayment(false);
//       return;
//     }

//     // 6) Update UI, history, etc.
//     await onPaymentSuccess(inserted as PaymentDetail);
//     return captureResult;
//   } catch (error: any) {
//     console.error("Payment approval error:", error);
//     setProcessingPayment(false);
//     showToast(
//       error?.message || "Payment processing failed. Please try again.",
//       "error"
//     );
//     throw error;
//   }
// };

//   if (profileLoading) {
//     return (
//       <div className="min-h-screen bg-white flex">
//         <div className="flex-1 flex items-center justify-center">
//           <div className="text-center">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#01796F]" />
//             <p className="mt-2 text-gray-600">Loading billing information...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Plans (Free + Premium)
//   const plans = [
//     {
//       key: "free",
//       name: "Free",
//       price: "$0",
//       period: "forever",
//       features: [
//         "3 careercasts per month",
//         "Basic video recording",
//         "Standard resume upload",
//         "Community support",
//       ],
//       current: !isPremiumActive,
//     },
//     {
//       key: "premium",
//       name: "Premium",
//       price: `$${PREMIUM_PRICE_USD.toFixed(2)}`,
//       period: "month",
//       features: [
//         "Unlimited careercasts",
//         "HD video recording",
//         "Advanced analytics",
//         "Priority support",
//         "Custom branding",
//       ],
//       current: isPremiumActive,
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-white flex">
//       {/* Overlay for mobile sidebar */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <div
//         className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
//       >
//         <Sidebar userEmail={user?.email || ""} onLogout={handleLogout} />
//       </div>

//       {/* Main content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Mobile header */}
//         <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
//           <button
//             onClick={() => setSidebarOpen(true)}
//             className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
//           >
//             <Menu className="h-6 w-6" />
//           </button>
//           <div className="font-bold text-xl text-[#0B4F6C]">careercast</div>
//           <div className="w-10" />
//         </div>

//         {/* Toast container */}
//         <div id="toast-container" className="fixed top-4 right-4 z-50" />

//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50">
//           <div className="max-w-6xl mx-auto">
//             {/* Header */}
//             <div className="mb-6 sm:mb-8">
//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
//                 Billing & Payment
//               </h1>
//               <p className="text-gray-600 text-sm sm:text-base">
//                 Manage your subscription, payment methods, and billing history
//               </p>
//             </div>

//             {/* Success / Active Premium Card */}
//             {shouldShowSuccessCard && (successTransaction || isPremiumActive) && (
//               <div className="mb-8 bg-white rounded-xl shadow-lg border border-green-200 overflow-hidden">
//                 <div className="bg-green-600 px-6 py-4">
//                   <div className="flex items-center justify-between">
//                     <h2 className="text-xl font-bold text-white">
//                       {paymentSuccess ? "Payment Successful" : "Active Premium Plan"}
//                     </h2>
//                     <Check className="h-8 w-8 text-white" />
//                   </div>
//                 </div>
//                 <div className="p-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {/* Transaction details */}
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                         Transaction Details
//                       </h3>
//                       <div className="space-y-3">
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Transaction ID:</span>
//                           <span className="font-mono text-gray-900">
//                             {successTransaction?.transaction_id ??
//                               successTransaction?.paypal_order_id ??
//                               successTransaction?.id ??
//                               "N/A"}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Date:</span>
//                           <span className="text-gray-900">
//                             {successTransaction
//                               ? new Date(
//                                   successTransaction.finished_at ||
//                                     successTransaction.created_at
//                                 ).toLocaleString()
//                               : "N/A"}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Amount:</span>
//                           <span className="text-gray-900 font-semibold">
//                             {successTransaction
//                               ? renderAmount(successTransaction)
//                               : `$${PREMIUM_PRICE_USD.toFixed(2)}`}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Payment Method:</span>
//                           <span className="text-gray-900">
//                             {successTransaction
//                               ? renderMethod(successTransaction.payment_mode)
//                               : "PayPal"}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Status:</span>
//                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                             {successTransaction?.status || "completed"}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Subscription details */}
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                         Subscription Details
//                       </h3>
//                       <div className="space-y-3">
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Plan:</span>
//                           <span className="font-semibold text-gray-900">
//                             Premium
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Billing Cycle:</span>
//                           <span className="text-gray-900">Monthly</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">
//                             Next Billing Date:
//                           </span>
//                           <span className="text-gray-900">
//                             {profilePlan?.plan_renews_at
//                               ? new Date(
//                                   profilePlan.plan_renews_at
//                                 ).toLocaleDateString()
//                               : "N/A"}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Features:</span>
//                           <span className="text-gray-900">
//                             Unlimited careercasts
//                           </span>
//                         </div>
//                         {profilePlan?.plan_renews_at && (
//                           <div className="flex justify-between">
//                             <span className="text-gray-600">Plan Status:</span>
//                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                               Active
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
//                     <button
//                       onClick={closeSuccessCard}
//                       className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01796F]"
//                     >
//                       Close
//                     </button>
//                     <button
//                       onClick={() => window.print()}
//                       className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#01796F] hover:bg-[#0B4F6C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01796F]"
//                     >
//                       Print Receipt
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* PayPal setup */}
//             {!PAYPAL_CLIENT_ID ? (
//               <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <h3 className="font-medium text-yellow-800">
//                   Payment System Not Configured
//                 </h3>
//                 <p className="text-yellow-700 text-sm mt-1">
//                   PayPal integration is not configured. Set
//                   {" "}
//                   <code className="font-mono">VITE_PAYPAL_CLIENT_ID</code>{" "}
//                   in your <code>.env</code> file.
//                 </p>
//               </div>
//             ) : (
//               <PayPalScriptProvider
//                 options={{
//                   clientId: PAYPAL_CLIENT_ID,
//                   intent: "capture",
//                   currency: "USD",
//                   components: "buttons",
//                 }}
//               >
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
//                   {plans.map((plan) => {
//                     const isPremium = plan.key === "premium";
//                     const isCurrent = plan.current;

//                     return (
//                       <div
//                         key={plan.key}
//                         className={`bg-white rounded-lg sm:rounded-xl shadow-sm border-2 ${
//                           isCurrent
//                             ? "border-[#01796F]"
//                             : "border-gray-200"
//                         } overflow-hidden hover:shadow-lg transition-all duration-300`}
//                       >
//                         {isCurrent && (
//                           <div className="bg-[#01796F] text-white text-center py-2 text-xs sm:text-sm font-semibold">
//                             Current Plan
//                           </div>
//                         )}
//                         <div className="p-4 sm:p-6 space-y-4">
//                           <div className="flex items-center justify-between">
//                             <h3 className="text-lg sm:text-xl font-bold text-gray-900">
//                               {plan.name}
//                             </h3>

//                             {/* Free plan trials badge */}
//                             {plan.key === "free" && (
//                               <div className="bg-orange-100 text-orange-800 text-xs sm:text-sm px-3 py-1 rounded-full font-semibold">
//                                 Your {freeRemaining}/3 free trials left
//                               </div>
//                             )}
//                           </div>

//                           <div className="mb-2 sm:mb-4">
//                             <span className="text-3xl sm:text-4xl font-bold text-gray-900">
//                               {plan.price}
//                             </span>
//                             <span className="text-gray-600 text-sm sm:text-base">
//                               /{plan.period}
//                             </span>
//                           </div>

//                           <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
//                             {plan.features.map((f) => (
//                               <li
//                                 key={f}
//                                 className="flex items-start gap-2 text-xs sm:text-sm text-gray-600"
//                               >
//                                 <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#01796F] flex-shrink-0 mt-0.5" />
//                                 <span>{f}</span>
//                               </li>
//                             ))}
//                           </ul>

//                           {/* Buttons */}
//                           {isPremium ? (
//                             isCurrent ? (
//                               <button
//                                 className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-gray-100 text-gray-500 cursor-not-allowed"
//                                 disabled
//                               >
//                                 Current Plan
//                               </button>
//                             ) : (
//                               <div className="space-y-3">
//                                 <div className="p-3 border rounded-lg">
//                                   <PayPalButtons
//                                     fundingSource="paypal"
//                                     style={{
//                                       layout: "vertical",
//                                       color: "gold",
//                                       shape: "rect",
//                                       label: "checkout",
//                                     }}
//                                     disabled={!user || processingPayment}
//                                     createOrder={createOrder}
//                                     onApprove={onApprove}
//                                     onError={(err) => {
//                                       console.error(
//                                         "PayPal Button Error:",
//                                         err
//                                       );
//                                       setProcessingPayment(false);
//                                       showToast(
//                                         "Payment failed. Please try again.",
//                                         "error"
//                                       );
//                                     }}
//                                     onCancel={() => {
//                                       setProcessingPayment(false);
//                                       showToast(
//                                         "Payment cancelled",
//                                         "info"
//                                       );
//                                     }}
//                                   />
//                                 </div>
//                                 {processingPayment && (
//                                   <p className="text-xs text-gray-500">
//                                     Processing payment… please don’t close this
//                                     tab.
//                                   </p>
//                                 )}
//                               </div>
//                             )
//                           ) : (
//                             <button
//                               className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-gray-100 text-gray-500 cursor-not-allowed"
//                               disabled
//                             >
//                               {plan.current ? "Current Plan" : "Free Plan"}
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </PayPalScriptProvider>
//             )}

//             {/* Info about secure processing */}
//             <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm: p-6 mb-8">
//               <h3 className="text-lg font-semibold text-blue-800 mb-2">
//                 Secure Payment Processing
//               </h3>
//               <p className="text-blue-700 text-sm sm:text-base mb-3">
//                 All payments are processed securely through PayPal. You don't
//                 need to share your credit card information with us.
//               </p>
//               <div className="flex items-center gap-2">
//                 <div className="bg-white px-3 py-1 rounded-full border border-blue-300">
//                   <span className="text-blue-800 font-medium text-sm">
//                     PayPal
//                   </span>
//                 </div>
//                 <span className="text-blue-600 text-xs">SSL Encrypted</span>
//               </div>
//             </div>

//             {/* Payment history */}
//             <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
//               <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
//                 Payment History
//               </h2>

//               {loadingHistory ? (
//                 <div className="text-center py-8">
//                   <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#01796F]" />
//                   <p className="mt-2 text-gray-600">
//                     Loading payment history...
//                   </p>
//                 </div>
//               ) : paymentHistory.length > 0 ? (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Transaction
//                         </th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Date
//                         </th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Amount
//                         </th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Method
//                         </th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Status
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {paymentHistory.map((p) => (
//                         <tr key={p.id}>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                             {(p.transaction_id ??
//                               p.paypal_order_id ??
//                               p.id
//                             ).toString().slice(0, 12)}
//                             …
//                           </td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {renderDate(p)}
//                           </td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {renderAmount(p)}
//                           </td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {renderMethod(p.payment_mode)}
//                           </td>
//                           <td className="px-4 py-4 whitespace-nowrap">
//                             <span
//                               className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                                 p.status === "completed"
//                                   ? "bg-green-100 text-green-800"
//                                   : p.status === "pending"
//                                   ? "bg-yellow-100 text-yellow-800"
//                                   : "bg-red-100 text-red-800"
//                               }`}
//                             >
//                               {p.status}
//                             </span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <div className="text-center py-8">
//                   <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
//                   <h3 className="mt-2 text-sm font-medium text-gray-900">
//                     No payment history
//                   </h3>
//                   <p className="mt-1 text-sm text-gray-500">
//                     You haven't made any payments yet.
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Free trials badge (again at bottom for clarity) */}
//             <div className="mb-8">
//               <div className="flex items-center gap-3">
//                 <div className="text-sm text-gray-700">
//                   Free plan trials left:
//                 </div>
//                 <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-md font-semibold text-sm">
//                   {freeRemaining}/3 free trials left
//                 </div>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }


// // src/pages/Billing.tsx
// import React, { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import { CreditCard, Check, Menu } from "lucide-react";
// import { useAuth } from "../contexts/AuthContext";
// import { supabase } from "../integrations/supabase/client";
// import { showToast } from "../components/ui/toast";
// import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// // ───────────────── CONFIG ─────────────────
// const PREMIUM_PRICE_USD = 9.99;
// const FREE_LIMIT = 3;
// // Change this if your dashboard table is named differently:
// const USAGE_TABLE_NAME = "careercasts"; // e.g. "recordings", "sessions", etc.

// // ───────────────── TYPES ─────────────────
// interface PaymentMetadata {
//   plan?: string;
//   source?: string;
//   plan_started_at?: string;
//   plan_renews_at?: string;
//   raw_paypal?: any;
//   [key: string]: any;
// }

// interface PaymentDetail {
//   id: string;
//   user_id: string | null;
//   email: string | null;
//   amount: number;
//   currency: string;
//   amount_paid_usd?: number | null;
//   created_at: string;
//   finished_at?: string | null;
//   status: "created" | "pending" | "completed" | "failed";
//   capture_status: string | null;
//   paypal_order_id?: string | null;
//   paypal_capture_id?: string | null;
//   transaction_id: string | null;
//   payer_name: string | null;
//   payer_email: string | null;
//   payment_mode: string | null;
//   card_brand?: string | null;
//   card_type?: string | null;
//   card_last4?: string | null;
//   card_holder_name?: string | null;
//   addr_name?: string | null;
//   addr_line1?: string | null;
//   addr_line2?: string | null;
//   addr_city?: string | null;
//   addr_state?: string | null;
//   addr_postal?: string | null;
//   addr_country?: string | null;
//   metadata?: PaymentMetadata | null;
// }

// // helper to add one month
// const addOneMonth = (d: Date) => {
//   const copy = new Date(d);
//   copy.setMonth(copy.getMonth() + 1);
//   return copy;
// };

// // ───────────────── COMPONENT ─────────────────
// export default function Billing() {
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [paymentHistory, setPaymentHistory] = useState<PaymentDetail[]>([]);
//   const [loadingHistory, setLoadingHistory] = useState(true);
//   const [refreshPaymentsFlag, setRefreshPaymentsFlag] = useState(0);

//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   const [successTransaction, setSuccessTransaction] =
//     useState<PaymentDetail | null>(null);
//   const [processingPayment, setProcessingPayment] = useState(false);

//   // Usage / recordings count for free trials
//   const [usageCount, setUsageCount] = useState<number>(0);
//   const [loadingUsage, setLoadingUsage] = useState<boolean>(true);

//   const PAYPAL_CLIENT_ID = import.meta.env
//     .VITE_PAYPAL_CLIENT_ID as string | undefined;

//   const handleLogout = () => navigate("/");

//   // ───────────────── Payment history ─────────────────
//   const fetchPaymentHistory = useCallback(async () => {
//     if (!user) return;
//     setLoadingHistory(true);
//     try {
//       const { data, error } = await supabase
//         .from("payment_details")
//         .select(
//           "id,user_id,email,amount,amount_paid_usd,currency,created_at,finished_at,status,capture_status,paypal_order_id,paypal_capture_id,transaction_id,payer_name,payer_email,payment_mode,card_brand,card_type,card_last4,card_holder_name,addr_name,addr_line1,addr_line2,addr_city,addr_state,addr_postal,addr_country,metadata"
//         )
//         .eq("user_id", user.id)
//         .order("created_at", { ascending: false });

//       if (error) {
//         console.error("fetchPaymentHistory error:", error);
//         setPaymentHistory([]);
//       } else {
//         setPaymentHistory((data as PaymentDetail[]) || []);
//       }
//     } catch (err) {
//       console.error("Error fetching payment history:", err);
//       setPaymentHistory([]);
//     } finally {
//       setLoadingHistory(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchPaymentHistory();
//   }, [fetchPaymentHistory, refreshPaymentsFlag]);

//   // ───────────────── Usage / dashboard records count ─────────────────
//   const fetchUsageCount = useCallback(async () => {
//     if (!user) return;
//     setLoadingUsage(true);
//     try {
//       const { count, error } = await supabase
//         .from(USAGE_TABLE_NAME)
//         .select("*", { head: true, count: "exact" })
//         .eq("user_id", user.id);

//       if (error) {
//         console.error("fetchUsageCount error:", error);
//         setUsageCount(0);
//       } else {
//         setUsageCount(count ?? 0);
//       }
//     } catch (err) {
//       console.error("Error fetching usage count:", err);
//       setUsageCount(0);
//     } finally {
//       setLoadingUsage(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchUsageCount();
//   }, [fetchUsageCount, refreshPaymentsFlag]);

//   // ───────────────── Helper render fns ─────────────────
//   const renderMethod = (mode?: string | null) =>
//     !mode
//       ? "PayPal"
//       : mode === "paypal"
//       ? "Wallet (PayPal)"
//       : mode === "card"
//       ? "Card"
//       : mode;

//   const renderDate = (p: PaymentDetail) =>
//     new Date(p.finished_at || p.created_at).toLocaleDateString();

//   const renderAmount = (p: PaymentDetail) =>
//     `${p.currency === "GBP" ? "£" : "$"}${Number(
//       p.amount_paid_usd ?? p.amount
//     ).toFixed(2)}`;

//   // ───────────────── Premium state from latest payment ─────────────────
//   const latestCompleted = paymentHistory.find(
//     (p) => p.status === "completed"
//   );

//   let isPremiumActive = false;
//   let nextBillingDate: string | null = null;

//   if (latestCompleted?.metadata?.plan_renews_at) {
//     const renewDate = new Date(latestCompleted.metadata.plan_renews_at);
//     if (renewDate > new Date()) {
//       isPremiumActive = true;
//       nextBillingDate = renewDate.toLocaleDateString();
//     }
//   }

//   // ───────────────── Free trial logic based on dashboard records ─────────────────
//   // Only relevant when NOT premium
//   let freeUsed = 0;
//   let freeRemaining = FREE_LIMIT;

//   if (!isPremiumActive) {
//     freeUsed = Math.min(usageCount, FREE_LIMIT);
//     freeRemaining = Math.max(FREE_LIMIT - freeUsed, 0);
//   }

//   const isLimitReached = !isPremiumActive && freeUsed >= FREE_LIMIT;
//   const shouldShowFreeBadge = !isPremiumActive; // once payment done, remove the free-trial counter

//   // ───────────────── onPaymentSuccess ─────────────────
//   const onPaymentSuccess = useCallback(
//     async (storedPayment: PaymentDetail | null) => {
//       try {
//         setPaymentSuccess(true);
//         setProcessingPayment(false);
//         if (storedPayment) setSuccessTransaction(storedPayment);

//         // Refresh history & usage (record count)
//         setRefreshPaymentsFlag((n) => n + 1);

//         showToast("Payment successful! 🎉", "success");
//       } catch (err) {
//         console.error("onPaymentSuccess error:", err);
//       }
//     },
//     []
//   );

//   const shouldShowSuccessCard = paymentSuccess || isPremiumActive;

//   const closeSuccessCard = () => {
//     setPaymentSuccess(false);
//     setSuccessTransaction(null);
//   };

//   // ───────────────── PayPal createOrder ─────────────────
//   const createOrder = async (_data: any, actions: any): Promise<string> => {
//     if (!user) {
//       showToast("You can't pay here. Please log in first.", "error");
//       throw new Error("not_logged_in");
//     }

//     // Make sure the user exists in auth.users
//     const { data: authData, error: authError } = await supabase.auth.getUser();
//     if (authError || !authData?.user) {
//       console.error("auth.getUser error:", authError);
//       showToast("You can't pay here. Please log in again.", "error");
//       throw new Error("auth_user_not_found");
//     }

//     setProcessingPayment(true);

//     const orderId = await actions.order.create({
//       purchase_units: [
//         {
//           amount: {
//             value: PREMIUM_PRICE_USD.toFixed(2),
//             currency_code: "USD",
//           },
//           description: "CareerCast Premium – Monthly",
//         },
//       ],
//       application_context: {
//         shipping_preference: "NO_SHIPPING",
//       },
//     });

//     return orderId;
//   };

//   // ───────────────── PayPal onApprove ─────────────────
//   const onApprove = async (data: any, actions: any) => {
//     try {
//       if (!actions.order) {
//         throw new Error("PayPal order action is not available");
//       }

//       // 1) Capture on PayPal
//       const captureResult = await actions.order.capture();

//       if (!user) {
//         showToast(
//           "Payment captured, but user session was lost. Contact support.",
//           "error"
//         );
//         setProcessingPayment(false);
//         return;
//       }

//       // 2) Confirm user exists in auth.users
//       const { data: authData, error: authError } =
//         await supabase.auth.getUser();
//       if (authError || !authData?.user) {
//         console.error("auth.getUser error:", authError);
//         showToast("You can't pay here. Please log in again.", "error");
//         setProcessingPayment(false);
//         return;
//       }

//       const authedUser = authData.user;

//       // 3) Extract PayPal data
//       const payerEmail =
//         captureResult?.payer?.email_address ??
//         captureResult?.payment_source?.paypal?.email_address ??
//         null;

//       const payerName =
//         `${captureResult?.payer?.name?.given_name || ""} ${
//           captureResult?.payer?.name?.surname || ""
//         }`.trim() || null;

//       const capture =
//         captureResult?.purchase_units?.[0]?.payments?.captures?.[0] ?? null;

//       const captureId = capture?.id ?? captureResult?.id ?? null;
//       const captureStatus = capture?.status ?? captureResult?.status ?? null;

//       const now = new Date();
//       const nowIso = now.toISOString();
//       const renewIso = addOneMonth(now).toISOString();

//       // 4) Insert into payment_details (FK → auth.users(id))
//       const { data: inserted, error: insertErr } = await supabase
//         .from("payment_details")
//         .insert([
//           {
//             user_id: authedUser.id,
//             email: authedUser.email,
//             amount: PREMIUM_PRICE_USD,
//             currency: "USD",
//             amount_paid_usd: PREMIUM_PRICE_USD,

//             status: "completed",
//             capture_status: captureStatus || "COMPLETED",

//             paypal_order_id: data.orderID,
//             paypal_capture_id: captureId,
//             transaction_id: captureId,

//             payer_name: payerName,
//             payer_email: payerEmail,
//             payment_mode: "paypal",

//             card_brand: null,
//             card_type: null,
//             card_last4: null,
//             card_holder_name: null,

//             addr_name: null,
//             addr_line1: null,
//             addr_line2: null,
//             addr_city: null,
//             addr_state: null,
//             addr_postal: null,
//             addr_country: null,

//             metadata: {
//               plan: "premium_monthly",
//               source: "wallet",
//               plan_started_at: nowIso,
//               plan_renews_at: renewIso,
//               raw_paypal: {
//                 id: captureId,
//                 status: captureStatus,
//               },
//             },

//             created_at: nowIso,
//             finished_at: nowIso,
//           },
//         ])
//         .select()
//         .single();

//       if (insertErr) {
//         console.error("payment_details insert error:", insertErr);
//         showToast(
//           `Payment captured, but we couldn't store it: ${
//             insertErr.message || "DB error"
//           }`,
//           "error"
//         );
//         setProcessingPayment(false);
//         return;
//       }

//       // 5) Update UI (and usage count will be ignored once premium is active)
//       await onPaymentSuccess(inserted as PaymentDetail);
//       return captureResult;
//     } catch (error: any) {
//       console.error("Payment approval error:", error);
//       setProcessingPayment(false);
//       showToast(
//         error?.message || "Payment processing failed. Please try again.",
//         "error"
//       );
//       throw error;
//     }
//   };

//   // ───────────────── Plans ─────────────────
//   const plans = [
//     {
//       key: "free",
//       name: "Free",
//       price: "$0",
//       period: "forever",
//       features: [
//         "3 careercasts per month",
//         "Basic video recording",
//         "Standard resume upload",
//         "Community support",
//       ],
//       current: !isPremiumActive,
//     },
//     {
//       key: "premium",
//       name: "Premium",
//       price: `$${PREMIUM_PRICE_USD.toFixed(2)}`,
//       period: "month",
//       features: [
//         "Unlimited NetworkNote",
//         "HD video recording",
//         "Advanced analytics",
//         "Priority support",
//         "Custom branding",
//       ],
//       current: isPremiumActive,
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-white flex">
//       {/* Overlay for mobile sidebar */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <div
//         className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
//       >
//         <Sidebar userEmail={user?.email || ""} onLogout={handleLogout} />
//       </div>

//       {/* Main content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Mobile header */}
//         <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
//           <button
//             onClick={() => setSidebarOpen(true)}
//             className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
//           >
//             <Menu className="h-6 w-6" />
//           </button>
//           <div className="font-bold text-xl text-[#0B4F6C]">careercast</div>
//           <div className="w-10" />
//         </div>

//         {/* Toast container */}
//         <div id="toast-container" className="fixed top-4 right-4 z-50" />

//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50">
//           <div className="max-w-6xl mx-auto">
//             {/* Header */}
//             <div className="mb-6 sm:mb-8">
//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
//                 Billing & Payment
//               </h1>
//               <p className="text-gray-600 text-sm sm:text-base">
//                 Manage your subscription, payment methods, and billing history
//               </p>
//             </div>

//             {/* Success / Active Premium Card */}
//             {shouldShowSuccessCard && (successTransaction || isPremiumActive) && (
//               <div className="mb-8 bg-white rounded-xl shadow-lg border border-green-200 overflow-hidden">
//                 <div className="bg-green-600 px-6 py-4">
//                   <div className="flex items-center justify-between">
//                     <h2 className="text-xl font-bold text-white">
//                       {paymentSuccess
//                         ? "Payment Successful"
//                         : "Active Premium Plan"}
//                     </h2>
//                     <Check className="h-8 w-8 text-white" />
//                   </div>
//                 </div>
//                 <div className="p-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {/* Transaction details */}
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                         Transaction Details
//                       </h3>
//                       <div className="space-y-3">
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">
//                             Transaction ID:
//                           </span>
//                           <span className="font-mono text-gray-900">
//                             {successTransaction?.transaction_id ??
//                               successTransaction?.paypal_order_id ??
//                               successTransaction?.id ??
//                               "N/A"}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Date:</span>
//                           <span className="text-gray-900">
//                             {successTransaction
//                               ? new Date(
//                                   successTransaction.finished_at ||
//                                     successTransaction.created_at
//                                 ).toLocaleString()
//                               : "N/A"}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Amount:</span>
//                           <span className="text-gray-900 font-semibold">
//                             {successTransaction
//                               ? renderAmount(successTransaction)
//                               : `$${PREMIUM_PRICE_USD.toFixed(2)}`}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Payment Method:</span>
//                           <span className="text-gray-900">
//                             {successTransaction
//                               ? renderMethod(successTransaction.payment_mode)
//                               : "PayPal"}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Status:</span>
//                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                             {successTransaction?.status || "completed"}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Subscription details */}
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                         Subscription Details
//                       </h3>
//                       <div className="space-y-3">
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Plan:</span>
//                           <span className="font-semibold text-gray-900">
//                             Premium
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Billing Cycle:</span>
//                           <span className="text-gray-900">Monthly</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">
//                             Next Billing Date:
//                           </span>
//                           <span className="text-gray-900">
//                             {nextBillingDate ?? "N/A"}
//                           </span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Features:</span>
//                           <span className="text-gray-900">
//                             Unlimited NetworkNote
//                           </span>
//                         </div>
//                         {isPremiumActive && (
//                           <div className="flex justify-between">
//                             <span className="text-gray-600">Plan Status:</span>
//                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                               Active
//                             </span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
//                     <button
//                       onClick={closeSuccessCard}
//                       className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01796F]"
//                     >
//                       Close
//                     </button>
//                     <button
//                       onClick={() => window.print()}
//                       className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#01796F] hover:bg-[#0B4F6C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#01796F]"
//                     >
//                       Print Receipt
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* PayPal setup */}
//             {!PAYPAL_CLIENT_ID ? (
//               <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <h3 className="font-medium text-yellow-800">
//                   Payment System Not Configured
//                 </h3>
//                 <p className="text-yellow-700 text-sm mt-1">
//                   PayPal integration is not configured. Set{" "}
//                   <code className="font-mono">VITE_PAYPAL_CLIENT_ID</code> in
//                   your <code>.env</code> file.
//                 </p>
//               </div>
//             ) : (
//               <PayPalScriptProvider
//                 options={{
//                   clientId: PAYPAL_CLIENT_ID,
//                   intent: "capture",
//                   currency: "USD",
//                   components: "buttons",
//                 }}
//               >
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
//                   {plans.map((plan) => {
//                     const isPremium = plan.key === "premium";
//                     const isCurrent = plan.current;

//                     return (
//                       <div
//                         key={plan.key}
//                         className={`bg-white rounded-lg sm:rounded-xl shadow-sm border-2 ${
//                           isCurrent
//                             ? "border-[#01796F]"
//                             : "border-gray-200"
//                         } overflow-hidden hover:shadow-lg transition-all duration-300`}
//                       >
//                         {isCurrent && (
//                           <div className="bg-[#01796F] text-white text-center py-2 text-xs sm:text-sm font-semibold">
//                             Current Plan
//                           </div>
//                         )}
//                         <div className="p-4 sm:p-6 space-y-4">
//                           <div className="flex items-center justify-between">
//                             <h3 className="text-lg sm:text-xl font-bold text-gray-900">
//                               {plan.name}
//                             </h3>

//                             {/* Free plan trials badge (only when not premium) */}
//                             {plan.key === "free" && shouldShowFreeBadge && (
//                               <div
//                                 className={`text-xs sm:text-sm px-3 py-1 rounded-full font-semibold ${
//                                   isLimitReached
//                                     ? "bg-red-100 text-red-800"
//                                     : "bg-orange-100 text-orange-800"
//                                 }`}
//                               >
//                                 {loadingUsage
//                                   ? "Checking usage…"
//                                   : isLimitReached
//                                   ? "3/3 free trials used – please make the payment for unlimited records"
//                                   : `${freeRemaining}/${FREE_LIMIT} free trials left`}
//                               </div>
//                             )}

//                             {/* When premium is active, you could show nice text here instead */}
//                             {plan.key === "free" && isPremiumActive && (
//                               <div className="bg-green-100 text-green-800 text-xs sm:text-sm px-3 py-1 rounded-full font-semibold">
//                                 Unlimited records active
//                               </div>
//                             )}
//                           </div>

//                           <div className="mb-2 sm:mb-4">
//                             <span className="text-3xl sm:text-4xl font-bold text-gray-900">
//                               {plan.price}
//                             </span>
//                             <span className="text-gray-600 text-sm sm:text-base">
//                               /{plan.period}
//                             </span>
//                           </div>

//                           <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
//                             {plan.features.map((f) => (
//                               <li
//                                 key={f}
//                                 className="flex items-start gap-2 text-xs sm:text-sm text-gray-600"
//                               >
//                                 <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#01796F] flex-shrink-0 mt-0.5" />
//                                 <span>{f}</span>
//                               </li>
//                             ))}
//                           </ul>

//                           {/* Buttons */}
//                           {isPremium ? (
//                             isCurrent ? (
//                               <button
//                                 className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-gray-100 text-gray-500 cursor-not-allowed"
//                                 disabled
//                               >
//                                 Current Plan
//                               </button>
//                             ) : (
//                               <div className="space-y-3">
//                                 <div className="p-3 border rounded-lg">
//                                   <PayPalButtons
//                                     fundingSource="paypal"
//                                     style={{
//                                       layout: "vertical",
//                                       color: "gold",
//                                       shape: "rect",
//                                       label: "checkout",
//                                     }}
//                                     disabled={!user || processingPayment}
//                                     createOrder={createOrder}
//                                     onApprove={onApprove}
//                                     onError={(err) => {
//                                       console.error(
//                                         "PayPal Button Error:",
//                                         err
//                                       );
//                                       setProcessingPayment(false);
//                                       showToast(
//                                         "Payment failed. Please try again.",
//                                         "error"
//                                       );
//                                     }}
//                                     onCancel={() => {
//                                       setProcessingPayment(false);
//                                       showToast(
//                                         "Payment cancelled",
//                                         "info"
//                                       );
//                                     }}
//                                   />
//                                 </div>
//                                 {processingPayment && (
//                                   <p className="text-xs text-gray-500">
//                                     Processing payment… please don’t close this
//                                     tab.
//                                   </p>
//                                 )}
//                               </div>
//                             )
//                           ) : (
//                             <button
//                               className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-gray-100 text-gray-500 cursor-not-allowed"
//                               disabled
//                             >
//                               {plan.current ? "Current Plan" : "Free Plan"}
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </PayPalScriptProvider>
//             )}

//             {/* Info about secure processing */}
//             <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-8">
//               <h3 className="text-lg font-semibold text-blue-800 mb-2">
//                 Secure Payment Processing
//               </h3>
//               <p className="text-blue-700 text-sm sm:text-base mb-3">
//                 All payments are processed securely through PayPal. You don't
//                 need to share your credit card information with us.
//               </p>
//               <div className="flex items-center gap-2">
//                 <div className="bg-white px-3 py-1 rounded-full border border-blue-300">
//                   <span className="text-blue-800 font-medium text-sm">
//                     PayPal
//                   </span>
//                 </div>
//                 <span className="text-blue-600 text-xs">SSL Encrypted</span>
//               </div>
//             </div>

//             {/* Payment history */}
//             <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
//               <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
//                 Payment History
//               </h2>

//               {loadingHistory ? (
//                 <div className="text-center py-8">
//                   <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#01796F]" />
//                   <p className="mt-2 text-gray-600">
//                     Loading payment history...
//                   </p>
//                 </div>
//               ) : paymentHistory.length > 0 ? (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Transaction
//                         </th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Date
//                         </th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Amount
//                         </th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Method
//                         </th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Status
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {paymentHistory.map((p) => (
//                         <tr key={p.id}>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                             {(p.transaction_id ??
//                               p.paypal_order_id ??
//                               p.id
//                             ).toString().slice(0, 12)}
//                             …
//                           </td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {renderDate(p)}
//                           </td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {renderAmount(p)}
//                           </td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {renderMethod(p.payment_mode)}
//                           </td>
//                           <td className="px-4 py-4 whitespace-nowrap">
//                             <span
//                               className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                                 p.status === "completed"
//                                   ? "bg-green-100 text-green-800"
//                                   : p.status === "pending"
//                                   ? "bg-yellow-100 text-yellow-800"
//                                   : "bg-red-100 text-red-800"
//                               }`}
//                             >
//                               {p.status}
//                             </span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <div className="text-center py-8">
//                   <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
//                   <h3 className="mt-2 text-sm font-medium text-gray-900">
//                     No payment history
//                   </h3>
//                   <p className="mt-1 text-sm text-gray-500">
//                     You haven't made any payments yet.
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Free trials badge at bottom */}
//             {shouldShowFreeBadge && (
//               <div className="mb-8">
//                 <div className="flex items-center gap-3">
//                   <div className="text-sm text-gray-700">
//                     Free plan trials:
//                   </div>
//                   <div
//                     className={`px-3 py-1 rounded-md font-semibold text-sm ${
//                       isLimitReached
//                         ? "bg-red-100 text-red-800"
//                         : "bg-orange-100 text-orange-800"
//                     }`}
//                   >
//                     {loadingUsage
//                       ? "Checking usage…"
//                       : isLimitReached
//                       ? "3/3 free trials used – please make the payment for unlimited records"
//                       : `${freeRemaining}/${FREE_LIMIT} free trials left`}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* When premium: show a simple “unlimited” badge at bottom */}
//             {isPremiumActive && (
//               <div className="mb-8">
//                 <div className="flex items-center gap-3">
//                   <div className="text-sm text-gray-700">
//                     Recording limit:
//                   </div>
//                   <div className="bg-green-100 text-green-800 px-3 py-1 rounded-md font-semibold text-sm">
//                     Unlimited records (Premium active)
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }






// // src/pages/Billing.tsx
// import React, { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import { CreditCard, Check, Menu } from "lucide-react";
// import { useAuth } from "../contexts/AuthContext";
// import { supabase } from "../integrations/supabase/client";
// import { showToast } from "../components/ui/toast";
// import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// // ───────────────── CONFIG ─────────────────
// const PREMIUM_PRICE_USD = 9.99;
// const FREE_LIMIT = 3;
// const USAGE_TABLE_NAME = "careercasts";

// // ───────────────── TYPES ─────────────────
// interface PaymentMetadata {
//   plan?: string;
//   source?: string;
//   plan_started_at?: string;
//   plan_renews_at?: string;
//   raw_paypal?: any;
//   [key: string]: any;
// }

// interface PaymentDetail {
//   id: string;
//   user_id: string | null;
//   email: string | null;
//   amount: number;
//   currency: string;
//   amount_paid_usd?: number | null;
//   created_at: string;
//   finished_at?: string | null;
//   status: "created" | "pending" | "completed" | "failed";
//   capture_status: string | null;
//   paypal_order_id?: string | null;
//   paypal_capture_id?: string | null;
//   transaction_id: string | null;
//   payer_name: string | null;
//   payer_email: string | null;
//   payment_mode: string | null;
//   card_brand?: string | null;
//   card_type?: string | null;
//   card_last4?: string | null;
//   card_holder_name?: string | null;
//   addr_name?: string | null;
//   addr_line1?: string | null;
//   addr_line2?: string | null;
//   addr_city?: string | null;
//   addr_state?: string | null;
//   addr_postal?: string | null;
//   addr_country?: string | null;
//   metadata?: PaymentMetadata | null;
// }

// const addOneMonth = (d: Date) => {
//   const copy = new Date(d);
//   copy.setMonth(copy.getMonth() + 1);
//   return copy;
// };

// // ───────────────── COMPONENT ─────────────────
// export default function Billing() {
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [paymentHistory, setPaymentHistory] = useState<PaymentDetail[]>([]);
//   const [loadingHistory, setLoadingHistory] = useState(true);
//   const [refreshPaymentsFlag, setRefreshPaymentsFlag] = useState(0);

//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   const [successTransaction, setSuccessTransaction] =
//     useState<PaymentDetail | null>(null);
//   const [processingPayment, setProcessingPayment] = useState(false);

//   const [usageCount, setUsageCount] = useState<number>(0);
//   const [loadingUsage, setLoadingUsage] = useState<boolean>(true);

//   const PAYPAL_CLIENT_ID = import.meta.env
//     .VITE_PAYPAL_CLIENT_ID as string | undefined;

//   const handleLogout = () => navigate("/");

//   // ───────────────── Payment history ─────────────────
//   const fetchPaymentHistory = useCallback(async () => {
//     if (!user) return;
//     setLoadingHistory(true);
//     try {
//       const { data, error } = await supabase
//         .from("payment_details")
//         .select(
//           "id,user_id,email,amount,amount_paid_usd,currency,created_at,finished_at,status,capture_status,paypal_order_id,paypal_capture_id,transaction_id,payer_name,payer_email,payment_mode,card_brand,card_type,card_last4,card_holder_name,addr_name,addr_line1,addr_line2,addr_city,addr_state,addr_postal,addr_country,metadata"
//         )
//         .eq("user_id", user.id)
//         .order("created_at", { ascending: false });

//       if (error) {
//         console.error("fetchPaymentHistory error:", error);
//         setPaymentHistory([]);
//       } else {
//         setPaymentHistory((data as PaymentDetail[]) || []);
//       }
//     } catch (err) {
//       console.error("Error fetching payment history:", err);
//       setPaymentHistory([]);
//     } finally {
//       setLoadingHistory(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchPaymentHistory();
//   }, [fetchPaymentHistory, refreshPaymentsFlag]);

//   // ───────────────── Usage / dashboard records count ─────────────────
//   const fetchUsageCount = useCallback(async () => {
//     if (!user) return;
//     setLoadingUsage(true);
//     try {
//       const { count, error } = await supabase
//         .from(USAGE_TABLE_NAME)
//         .select("*", { head: true, count: "exact" })
//         .eq("user_id", user.id);

//       if (error) {
//         console.error("fetchUsageCount error:", error);
//         setUsageCount(0);
//       } else {
//         setUsageCount(count ?? 0);
//       }
//     } catch (err) {
//       console.error("Error fetching usage count:", err);
//       setUsageCount(0);
//     } finally {
//       setLoadingUsage(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchUsageCount();
//   }, [fetchUsageCount, refreshPaymentsFlag]);

//   // ───────────────── Helper render fns ─────────────────
//   const renderMethod = (mode?: string | null) =>
//     !mode
//       ? "PayPal"
//       : mode === "paypal"
//       ? "Wallet (PayPal)"
//       : mode === "card"
//       ? "Card"
//       : mode;

//   const renderDate = (p: PaymentDetail) =>
//     new Date(p.finished_at || p.created_at).toLocaleDateString();

//   const renderAmount = (p: PaymentDetail) =>
//     `${p.currency === "GBP" ? "£" : "$"}${Number(
//       p.amount_paid_usd ?? p.amount
//     ).toFixed(2)}`;

//   // ───────────────── Premium state from latest payment ─────────────────
//   const latestCompleted = paymentHistory.find((p) => p.status === "completed");

//   let isPremiumActive = false;
//   let nextBillingDate: string | null = null;

//   if (latestCompleted?.metadata?.plan_renews_at) {
//     const renewDate = new Date(latestCompleted.metadata.plan_renews_at);
//     if (renewDate > new Date()) {
//       isPremiumActive = true;
//       nextBillingDate = renewDate.toLocaleDateString();
//     }
//   }

//   // ───────────────── Free trial logic ─────────────────
//   let freeUsed = 0;
//   let freeRemaining = FREE_LIMIT;

//   if (!isPremiumActive) {
//     freeUsed = Math.min(usageCount, FREE_LIMIT);
//     freeRemaining = Math.max(FREE_LIMIT - freeUsed, 0);
//   }

//   const isLimitReached = !isPremiumActive && freeUsed >= FREE_LIMIT;
//   const shouldShowFreeBadge = !isPremiumActive;

//   // ───────────────── onPaymentSuccess ─────────────────
//   const onPaymentSuccess = useCallback(
//     async (storedPayment: PaymentDetail | null) => {
//       try {
//         setPaymentSuccess(true);
//         setProcessingPayment(false);
//         if (storedPayment) setSuccessTransaction(storedPayment);

//         setRefreshPaymentsFlag((n) => n + 1);
//         showToast("Payment successful! 🎉", "success");
//       } catch (err) {
//         console.error("onPaymentSuccess error:", err);
//       }
//     },
//     []
//   );

//   const shouldShowSuccessCard = paymentSuccess || isPremiumActive;

//   const closeSuccessCard = () => {
//     setPaymentSuccess(false);
//     setSuccessTransaction(null);
//   };

//   // ───────────────── PayPal createOrder ─────────────────
//   const createOrder = async (_data: any, actions: any): Promise<string> => {
//     if (!user) {
//       showToast("You can't pay here. Please log in first.", "error");
//       throw new Error("not_logged_in");
//     }

//     const { data: authData, error: authError } = await supabase.auth.getUser();
//     if (authError || !authData?.user) {
//       console.error("auth.getUser error:", authError);
//       showToast("You can't pay here. Please log in again.", "error");
//       throw new Error("auth_user_not_found");
//     }

//     setProcessingPayment(true);

//     const orderId = await actions.order.create({
//       purchase_units: [
//         {
//           amount: {
//             value: PREMIUM_PRICE_USD.toFixed(2),
//             currency_code: "USD",
//           },
//           description: "CareerCast Premium – Monthly",
//         },
//       ],
//       application_context: {
//         shipping_preference: "NO_SHIPPING",
//       },
//     });

//     return orderId;
//   };

//   // ───────────────── PayPal onApprove ─────────────────
//   const onApprove = async (data: any, actions: any) => {
//     try {
//       if (!actions.order) {
//         throw new Error("PayPal order action is not available");
//       }

//       const captureResult = await actions.order.capture();

//       if (!user) {
//         showToast(
//           "Payment captured, but user session was lost. Contact support.",
//           "error"
//         );
//         setProcessingPayment(false);
//         return;
//       }

//       const { data: authData, error: authError } =
//         await supabase.auth.getUser();
//       if (authError || !authData?.user) {
//         console.error("auth.getUser error:", authError);
//         showToast("You can't pay here. Please log in again.", "error");
//         setProcessingPayment(false);
//         return;
//       }

//       const authedUser = authData.user;

//       const payerEmail =
//         captureResult?.payer?.email_address ??
//         captureResult?.payment_source?.paypal?.email_address ??
//         null;

//       const payerName =
//         `${captureResult?.payer?.name?.given_name || ""} ${
//           captureResult?.payer?.name?.surname || ""
//         }`.trim() || null;

//       const capture =
//         captureResult?.purchase_units?.[0]?.payments?.captures?.[0] ?? null;

//       const captureId = capture?.id ?? captureResult?.id ?? null;
//       const captureStatus = capture?.status ?? captureResult?.status ?? null;

//       const now = new Date();
//       const nowIso = now.toISOString();
//       const renewIso = addOneMonth(now).toISOString();

//       const { data: inserted, error: insertErr } = await supabase
//         .from("payment_details")
//         .insert([
//           {
//             user_id: authedUser.id,
//             email: authedUser.email,
//             amount: PREMIUM_PRICE_USD,
//             currency: "USD",
//             amount_paid_usd: PREMIUM_PRICE_USD,

//             status: "completed",
//             capture_status: captureStatus || "COMPLETED",

//             paypal_order_id: data.orderID,
//             paypal_capture_id: captureId,
//             transaction_id: captureId,

//             payer_name: payerName,
//             payer_email: payerEmail,
//             payment_mode: "paypal",

//             metadata: {
//               plan: "premium_monthly",
//               source: "wallet",
//               plan_started_at: nowIso,
//               plan_renews_at: renewIso,
//               raw_paypal: {
//                 id: captureId,
//                 status: captureStatus,
//               },
//             },

//             created_at: nowIso,
//             finished_at: nowIso,
//           },
//         ])
//         .select()
//         .single();

//       if (insertErr) {
//         console.error("payment_details insert error:", insertErr);
//         showToast(
//           `Payment captured, but we couldn't store it: ${
//             insertErr.message || "DB error"
//           }`,
//           "error"
//         );
//         setProcessingPayment(false);
//         return;
//       }

//       await onPaymentSuccess(inserted as PaymentDetail);
//       return captureResult;
//     } catch (error: any) {
//       console.error("Payment approval error:", error);
//       setProcessingPayment(false);
//       showToast(
//         error?.message || "Payment processing failed. Please try again.",
//         "error"
//       );
//       throw error;
//     }
//   };

//   // ───────────────── Plans ─────────────────
//   const plans = [
//     {
//       key: "free",
//       name: "Free",
//       price: "$0",
//       period: "forever",
//       features: [
//         "3 careercasts per month",
//         "Basic video recording",
//         "Standard resume upload",
//         "Community support",
//       ],
//       current: !isPremiumActive,
//     },
//     {
//       key: "premium",
//       name: "Premium",
//       price: `$${PREMIUM_PRICE_USD.toFixed(2)}`,
//       period: "month",
//       features: [
//         "Unlimited NetworkNote",
//         "HD video recording",
//         "Advanced analytics",
//         "Priority support",
//         "Custom branding",
//       ],
//       current: isPremiumActive,
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-slate-50 flex">
//       {/* Mobile overlay for sidebar */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <div
//         className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
//       >
//         <Sidebar userEmail={user?.email || ""} onLogout={handleLogout} />
//       </div>

//       {/* Main content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Mobile header */}
//         <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
//           <button
//             onClick={() => setSidebarOpen(true)}
//             className="p-2 rounded-md text-slate-700 hover:bg-slate-50 focus:outline-none"
//           >
//             <Menu className="h-6 w-6" />
//           </button>

//           <div className="flex items-center gap-3">
//             <div className="h-8 w-8 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
//               <img
//                 src="/images/networknote_final_logo_1 (2).jpg"
//                 alt="NetworkNote"
//                 className="h-full w-full object-cover"
//               />
//             </div>
//             <div className="font-semibold text-slate-900">NetworkNote</div>
//           </div>

//           <div className="w-10" />
//         </div>

//         {/* Toast container */}
//         <div id="toast-container" className="fixed top-4 right-4 z-50" />

//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
//           <div className="w-full px-8 lg:px-16">
//             <div className="max-w-6xl mx-auto">
//               {/* Header */}
//               <div className="mb-6 sm:mb-8">
//                 <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
//                   Billing & Payment
//                 </h1>
//                 <p className="text-slate-600 text-sm sm:text-base">
//                   Manage your subscription, payment methods, and billing history
//                 </p>
//               </div>

//               {/* Success / Active Premium Card */}
//               {shouldShowSuccessCard && (successTransaction || isPremiumActive) && (
//                 <div className="mb-8 bg-white rounded-xl shadow-lg border border-cyan-100 overflow-hidden">
//                   <div className="bg-cyan-600 px-6 py-4">
//                     <div className="flex items-center justify-between">
//                       <h2 className="text-xl font-bold text-white">
//                         {paymentSuccess ? "Payment Successful" : "Active Premium Plan"}
//                       </h2>
//                       <Check className="h-8 w-8 text-white" />
//                     </div>
//                   </div>

//                   <div className="p-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       {/* Transaction details */}
//                       <div>
//                         <h3 className="text-lg font-semibold text-slate-900 mb-4">
//                           Transaction Details
//                         </h3>
//                         <div className="space-y-3">
//                           <div className="flex justify-between">
//                             <span className="text-slate-600">Transaction ID:</span>
//                             <span className="font-mono text-slate-900">
//                               {successTransaction?.transaction_id ??
//                                 successTransaction?.paypal_order_id ??
//                                 successTransaction?.id ??
//                                 "N/A"}
//                             </span>
//                           </div>

//                           <div className="flex justify-between">
//                             <span className="text-slate-600">Date:</span>
//                             <span className="text-slate-900">
//                               {successTransaction
//                                 ? new Date(
//                                     successTransaction.finished_at ||
//                                       successTransaction.created_at
//                                   ).toLocaleString()
//                                 : "N/A"}
//                             </span>
//                           </div>

//                           <div className="flex justify-between">
//                             <span className="text-slate-600">Amount:</span>
//                             <span className="text-slate-900 font-semibold">
//                               {successTransaction
//                                 ? renderAmount(successTransaction)
//                                 : `$${PREMIUM_PRICE_USD.toFixed(2)}`}
//                             </span>
//                           </div>

//                           <div className="flex justify-between">
//                             <span className="text-slate-600">Payment Method:</span>
//                             <span className="text-slate-900">
//                               {successTransaction
//                                 ? renderMethod(successTransaction.payment_mode)
//                                 : "PayPal"}
//                             </span>
//                           </div>

//                           <div className="flex justify-between">
//                             <span className="text-slate-600">Status:</span>
//                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
//                               {successTransaction?.status || "completed"}
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Subscription details */}
//                       <div>
//                         <h3 className="text-lg font-semibold text-slate-900 mb-4">
//                           Subscription Details
//                         </h3>
//                         <div className="space-y-3">
//                           <div className="flex justify-between">
//                             <span className="text-slate-600">Plan:</span>
//                             <span className="font-semibold text-slate-900">Premium</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-slate-600">Billing Cycle:</span>
//                             <span className="text-slate-900">Monthly</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-slate-600">Next Billing Date:</span>
//                             <span className="text-slate-900">{nextBillingDate ?? "N/A"}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-slate-600">Features:</span>
//                             <span className="text-slate-900">Unlimited NetworkNote</span>
//                           </div>
//                           {isPremiumActive && (
//                             <div className="flex justify-between">
//                               <span className="text-slate-600">Plan Status:</span>
//                               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
//                                 Active
//                               </span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3">
//                       <button
//                         onClick={closeSuccessCard}
//                         className="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
//                       >
//                         Close
//                       </button>

//                       <button
//                         onClick={() => window.print()}
//                         className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800"
//                       >
//                         Print Receipt
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* PayPal setup */}
//               {!PAYPAL_CLIENT_ID ? (
//                 <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                   <h3 className="font-medium text-yellow-800">Payment System Not Configured</h3>
//                   <p className="text-yellow-700 text-sm mt-1">
//                     PayPal integration is not configured. Set{" "}
//                     <code className="font-mono">VITE_PAYPAL_CLIENT_ID</code> in your{" "}
//                     <code>.env</code> file.
//                   </p>
//                 </div>
//               ) : (
//                 <PayPalScriptProvider
//                   options={{
//                     clientId: PAYPAL_CLIENT_ID,
//                     intent: "capture",
//                     currency: "USD",
//                     components: "buttons",
//                   }}
//                 >
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
//                     {plans.map((plan) => {
//                       const isPremium = plan.key === "premium";
//                       const isCurrent = plan.current;

//                       return (
//                         <div
//                           key={plan.key}
//                           className={`bg-white rounded-lg sm:rounded-xl shadow-sm border-2 ${
//                             isCurrent ? "border-cyan-600" : "border-slate-200"
//                           } overflow-hidden hover:shadow-lg transition-all duration-300`}
//                         >
//                           {isCurrent && (
//                             <div className="bg-cyan-600 text-white text-center py-2 text-xs sm:text-sm font-semibold">
//                               Current Plan
//                             </div>
//                           )}

//                           <div className="p-4 sm:p-6 space-y-4">
//                             <div className="flex items-center justify-between">
//                               <h3 className="text-lg sm:text-xl font-bold text-slate-900">{plan.name}</h3>

//                               {/* {plan.key === "free" && shouldShowFreeBadge && (
//                                 <div
//                                   className={`text-xs sm:text-sm px-3 py-1 rounded-full font-semibold ${
//                                     isLimitReached ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
//                                   }`}
//                                 >
//                                   {loadingUsage
//                                     ? "Checking usage…"
//                                     : isLimitReached
//                                     ? "3/3 free trials used – please upgrade"
//                                     : `${freeRemaining}/${FREE_LIMIT} free trials left`}
//                                 </div>
//                               )} */}

//                               {plan.key === "free" && isPremiumActive && (
//                                 <div className="bg-emerald-100 text-emerald-800 text-xs sm:text-sm px-3 py-1 rounded-full font-semibold">
//                                   Unlimited records active
//                                 </div>
//                               )}
//                             </div>

//                             <div className="mb-2 sm:mb-4">
//                               <span className="text-3xl sm:text-4xl font-bold text-slate-900">{plan.price}</span>
//                               <span className="text-slate-600 text-sm sm:text-base">/{plan.period}</span>
//                             </div>

//                             <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
//                               {plan.features.map((f) => (
//                                 <li key={f} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
//                                   <Check className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
//                                   <span>{f}</span>
//                                 </li>
//                               ))}
//                             </ul>

//                             {/* Buttons */}
//                             {isPremium ? (
//                               isCurrent ? (
//                                 <button className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-slate-100 text-slate-500 cursor-not-allowed" disabled>
//                                   Current Plan
//                                 </button>
//                               ) : (
//                                 <div className="space-y-3">
//                                   <div className="p-3 border rounded-lg">
//                                     <PayPalButtons
//                                       fundingSource="paypal"
//                                       style={{
//                                         layout: "vertical",
//                                         color: "gold",
//                                         shape: "rect",
//                                         // label: "checkout",
//                                       }}
//                                       disabled={!user || processingPayment}
//                                       createOrder={createOrder}
//                                       onApprove={onApprove}
//                                       onError={(err) => {
//                                         console.error("PayPal Button Error:", err);
//                                         setProcessingPayment(false);
//                                         showToast("Payment failed. Please try again.", "error");
//                                       }}
//                                       onCancel={() => {
//                                         setProcessingPayment(false);
//                                         showToast("Payment cancelled", "info");
//                                       }}
//                                     />
//                                   </div>

//                                   {processingPayment && (
//                                     <p className="text-xs text-slate-500">
//                                       Processing payment… please don’t close this tab.
//                                     </p>
//                                   )}
//                                 </div>
//                               )
//                             ) : (
//                               <button className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-slate-100 text-slate-500 cursor-not-allowed" disabled>
//                                 {plan.current ? "Current Plan" : "Free Plan"}
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </PayPalScriptProvider>
//               )}

//               {/* Info about secure processing */}
//               <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 mb-8">
//                 <h3 className="text-lg font-semibold text-slate-900 mb-2">Secure Payment Processing</h3>
//                 <p className="text-slate-600 text-sm sm:text-base mb-3">
//                   All payments are processed securely through PayPal. You don't need to share your credit card information with us.
//                 </p>
//                 <div className="flex items-center gap-2">
//                   <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
//                     <span className="text-slate-900 font-medium text-sm">PayPal</span>
//                   </div>
//                   <span className="text-slate-500 text-xs">SSL Encrypted</span>
//                 </div>
//               </div>

//               {/* Payment history */}
//               <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-8">
//                 <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Payment History</h2>

//                 {loadingHistory ? (
//                   <div className="text-center py-8">
//                     <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-600" />
//                     <p className="mt-2 text-slate-600">Loading payment history...</p>
//                   </div>
//                 ) : paymentHistory.length > 0 ? (
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-slate-200">
//                       <thead className="bg-slate-50">
//                         <tr>
//                           <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
//                             Transaction
//                           </th>
//                           <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
//                             Date
//                           </th>
//                           <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
//                             Amount
//                           </th>
//                           <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
//                             Method
//                           </th>
//                           <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
//                             Status
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-slate-200">
//                         {paymentHistory.map((p) => (
//                           <tr key={p.id}>
//                             <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
//                               {(p.transaction_id ?? p.paypal_order_id ?? p.id).toString().slice(0, 12)}…
//                             </td>
//                             <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{renderDate(p)}</td>
//                             <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{renderAmount(p)}</td>
//                             <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{renderMethod(p.payment_mode)}</td>
//                             <td className="px-4 py-4 whitespace-nowrap">
//                               <span
//                                 className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                                   p.status === "completed"
//                                     ? "bg-emerald-100 text-emerald-800"
//                                     : p.status === "pending"
//                                     ? "bg-yellow-100 text-yellow-800"
//                                     : "bg-red-100 text-red-800"
//                                 }`}
//                               >
//                                 {p.status}
//                               </span>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 ) : (
//                   <div className="text-center py-8">
//                     <CreditCard className="mx-auto h-12 w-12 text-slate-400" />
//                     <h3 className="mt-2 text-sm font-medium text-slate-900">No payment history</h3>
//                     <p className="mt-1 text-sm text-slate-600">You haven't made any payments yet.</p>
//                   </div>
//                 )}
//               </div>

//               {/* Free trials badge at bottom */}
//               {/* {shouldShowFreeBadge && (
//                 <div className="mb-8">
//                   <div className="flex items-center gap-3">
//                     <div className="text-sm text-slate-700">Free plan trials:</div>
//                     <div
//                       className={`px-3 py-1 rounded-md font-semibold text-sm ${
//                         isLimitReached ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
//                       }`}
//                     >
//                       {loadingUsage
//                         ? "Checking usage…"
//                         : isLimitReached
//                         ? "3/3 free trials used – please upgrade"
//                         : `${freeRemaining}/${FREE_LIMIT} free trials left`}
//                     </div>
//                   </div>
//                 </div>
//               )} */}

//               {/* {isPremiumActive && (
//                 <div className="mb-8">
//                   <div className="flex items-center gap-3">
//                     <div className="text-sm text-slate-700">Recording limit:</div>
//                     <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md font-semibold text-sm">
//                       Unlimited records (Premium active)
//                     </div>
//                   </div>
//                 </div>
//               )} */}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }







// // src/pages/Billing.tsx
// import React, { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import { CreditCard, Check, Menu } from "lucide-react";
// import { useAuth } from "../contexts/AuthContext";
// import { supabase } from "../integrations/supabase/client";
// import { showToast } from "../components/ui/toast";
// import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// // ───────────────── CONFIG ─────────────────
// const PREMIUM_PRICE = 9.99;
// const FREE_LIMIT = 3;
// const USAGE_TABLE_NAME = "careercasts";

// type UserRegion = "US" | "UK" | "OTHER";

// // ───────────────── TYPES ─────────────────
// interface PaymentMetadata {
//   plan?: string;
//   source?: string;
//   plan_started_at?: string;
//   plan_renews_at?: string;
//   raw_paypal?: any;
//   [key: string]: any;
// }

// interface PaymentDetail {
//   id: string;
//   user_id: string | null;
//   email: string | null;
//   amount: number;
//   currency: string;
//   amount_paid_usd?: number | null;
//   created_at: string;
//   finished_at?: string | null;
//   status: "created" | "pending" | "completed" | "failed";
//   capture_status: string | null;
//   paypal_order_id?: string | null;
//   paypal_capture_id?: string | null;
//   transaction_id: string | null;
//   payer_name: string | null;
//   payer_email: string | null;
//   payment_mode: string | null;
//   card_brand?: string | null;
//   card_type?: string | null;
//   card_last4?: string | null;
//   card_holder_name?: string | null;
//   addr_name?: string | null;
//   addr_line1?: string | null;
//   addr_line2?: string | null;
//   addr_city?: string | null;
//   addr_state?: string | null;
//   addr_postal?: string | null;
//   addr_country?: string | null;
//   metadata?: PaymentMetadata | null;
// }

// const addOneMonth = (d: Date) => {
//   const copy = new Date(d);
//   copy.setMonth(copy.getMonth() + 1);
//   return copy;
// };

// // ───────────────── COMPONENT ─────────────────
// export default function Billing() {
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [paymentHistory, setPaymentHistory] = useState<PaymentDetail[]>([]);
//   const [loadingHistory, setLoadingHistory] = useState(true);
//   const [refreshPaymentsFlag, setRefreshPaymentsFlag] = useState(0);

//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   const [successTransaction, setSuccessTransaction] =
//     useState<PaymentDetail | null>(null);
//   const [processingPayment, setProcessingPayment] = useState(false);

//   const [usageCount, setUsageCount] = useState<number>(0);
//   const [loadingUsage, setLoadingUsage] = useState<boolean>(true);

//   // NEW: region detection (US vs UK)
//   const [userRegion, setUserRegion] = useState<UserRegion>("US");
//   const [regionDetected, setRegionDetected] = useState(false);

//   const PAYPAL_CLIENT_ID = import.meta.env
//     .VITE_PAYPAL_CLIENT_ID as string | undefined;

//   const handleLogout = () => navigate("/");

//   // ───────────────── Region detection ─────────────────
//   useEffect(() => {
//     try {
//       let region: UserRegion = "OTHER";
//       const lang = (navigator.language || "").toLowerCase();
//       const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

//       if (lang.includes("en-gb")) {
//         region = "UK";
//       } else if (lang.includes("en-us")) {
//         region = "US";
//       } else if (tz.startsWith("Europe/")) {
//         // treat Europe as UK pricing; adjust if needed
//         region = "UK";
//       } else if (tz.startsWith("America/")) {
//         region = "US";
//       }

//       setUserRegion(region);
//     } catch (e) {
//       console.error("Region detection failed:", e);
//       setUserRegion("US"); // safe default
//     } finally {
//       setRegionDetected(true);
//     }
//   }, []);

//   // Currency + label based on region
//   const currentCurrency = userRegion === "UK" ? "GBP" : "USD"; // change to 'EUR' if you really want euros
//   const currencySymbol = userRegion === "UK" ? "£" : "$";
//   const premiumPriceLabel = `${currencySymbol}${PREMIUM_PRICE.toFixed(2)}`;

//   // ───────────────── Payment history ─────────────────
//   const fetchPaymentHistory = useCallback(async () => {
//     if (!user) return;
//     setLoadingHistory(true);
//     try {
//       const { data, error } = await supabase
//         .from("payment_details")
//         .select(
//           "id,user_id,email,amount,amount_paid_usd,currency,created_at,finished_at,status,capture_status,paypal_order_id,paypal_capture_id,transaction_id,payer_name,payer_email,payment_mode,card_brand,card_type,card_last4,card_holder_name,addr_name,addr_line1,addr_line2,addr_city,addr_state,addr_postal,addr_country,metadata"
//         )
//         .eq("user_id", user.id)
//         .order("created_at", { ascending: false });

//       if (error) {
//         console.error("fetchPaymentHistory error:", error);
//         setPaymentHistory([]);
//       } else {
//         setPaymentHistory((data as PaymentDetail[]) || []);
//       }
//     } catch (err) {
//       console.error("Error fetching payment history:", err);
//       setPaymentHistory([]);
//     } finally {
//       setLoadingHistory(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchPaymentHistory();
//   }, [fetchPaymentHistory, refreshPaymentsFlag]);

//   // ───────────────── Usage / dashboard records count ─────────────────
//   const fetchUsageCount = useCallback(async () => {
//     if (!user) return;
//     setLoadingUsage(true);
//     try {
//       const { count, error } = await supabase
//         .from(USAGE_TABLE_NAME)
//         .select("*", { head: true, count: "exact" })
//         .eq("user_id", user.id);

//       if (error) {
//         console.error("fetchUsageCount error:", error);
//         setUsageCount(0);
//       } else {
//         setUsageCount(count ?? 0);
//       }
//     } catch (err) {
//       console.error("Error fetching usage count:", err);
//       setUsageCount(0);
//     } finally {
//       setLoadingUsage(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchUsageCount();
//   }, [fetchUsageCount, refreshPaymentsFlag]);

//   // ───────────────── Helper render fns ─────────────────
//   const renderMethod = (mode?: string | null) =>
//     !mode
//       ? "PayPal"
//       : mode === "paypal"
//       ? "Wallet (PayPal)"
//       : mode === "card"
//       ? "Card"
//       : mode;

//   const renderDate = (p: PaymentDetail) =>
//     new Date(p.finished_at || p.created_at).toLocaleDateString();

//   const renderAmount = (p: PaymentDetail) =>
//     `${p.currency === "GBP" ? "£" : "$"}${Number(
//       p.amount_paid_usd ?? p.amount
//     ).toFixed(2)}`;

//   // ───────────────── Premium state from latest payment ─────────────────
//   const latestCompleted = paymentHistory.find((p) => p.status === "completed");

//   let isPremiumActive = false;
//   let nextBillingDate: string | null = null;

//   if (latestCompleted?.metadata?.plan_renews_at) {
//     const renewDate = new Date(latestCompleted.metadata.plan_renews_at);
//     if (renewDate > new Date()) {
//       isPremiumActive = true;
//       nextBillingDate = renewDate.toLocaleDateString();
//     }
//   }

//   // ───────────────── Free trial logic ─────────────────
//   let freeUsed = 0;
//   let freeRemaining = FREE_LIMIT;

//   if (!isPremiumActive) {
//     freeUsed = Math.min(usageCount, FREE_LIMIT);
//     freeRemaining = Math.max(FREE_LIMIT - freeUsed, 0);
//   }

//   const isLimitReached = !isPremiumActive && freeUsed >= FREE_LIMIT;
//   const shouldShowFreeBadge = !isPremiumActive;

//   // ───────────────── onPaymentSuccess ─────────────────
//   const onPaymentSuccess = useCallback(
//     async (storedPayment: PaymentDetail | null) => {
//       try {
//         setPaymentSuccess(true);
//         setProcessingPayment(false);
//         if (storedPayment) setSuccessTransaction(storedPayment);

//         setRefreshPaymentsFlag((n) => n + 1);
//         showToast("Payment successful! 🎉", "success");
//       } catch (err) {
//         console.error("onPaymentSuccess error:", err);
//       }
//     },
//     []
//   );

//   const shouldShowSuccessCard = paymentSuccess || isPremiumActive;

//   const closeSuccessCard = () => {
//     setPaymentSuccess(false);
//     setSuccessTransaction(null);
//   };

//   // ───────────────── PayPal createOrder ─────────────────
//   const createOrder = async (_data: any, actions: any): Promise<string> => {
//     if (!user) {
//       showToast("You can't pay here. Please log in first.", "error");
//       throw new Error("not_logged_in");
//     }

//     const { data: authData, error: authError } = await supabase.auth.getUser();
//     if (authError || !authData?.user) {
//       console.error("auth.getUser error:", authError);
//       showToast("You can't pay here. Please log in again.", "error");
//       throw new Error("auth_user_not_found");
//     }

//     setProcessingPayment(true);

//     const orderId = await actions.order.create({
//       purchase_units: [
//         {
//           amount: {
//             value: PREMIUM_PRICE.toFixed(2),
//             currency_code: currentCurrency, // USD or GBP based on region
//           },
//           description: "CareerCast Premium – Monthly",
//         },
//       ],
//       application_context: {
//         shipping_preference: "NO_SHIPPING",
//       },
//     });

//     return orderId;
//   };

//   // ───────────────── PayPal onApprove ─────────────────
//   const onApprove = async (data: any, actions: any) => {
//     try {
//       if (!actions.order) {
//         throw new Error("PayPal order action is not available");
//       }

//       const captureResult = await actions.order.capture();

//       if (!user) {
//         showToast(
//           "Payment captured, but user session was lost. Contact support.",
//           "error"
//         );
//         setProcessingPayment(false);
//         return;
//       }

//       const { data: authData, error: authError } =
//         await supabase.auth.getUser();
//       if (authError || !authData?.user) {
//         console.error("auth.getUser error:", authError);
//         showToast("You can't pay here. Please log in again.", "error");
//         setProcessingPayment(false);
//         return;
//       }

//       const authedUser = authData.user;

//       const payerEmail =
//         captureResult?.payer?.email_address ??
//         captureResult?.payment_source?.paypal?.email_address ??
//         null;

//       const payerName =
//         `${captureResult?.payer?.name?.given_name || ""} ${
//           captureResult?.payer?.name?.surname || ""
//         }`.trim() || null;

//       const capture =
//         captureResult?.purchase_units?.[0]?.payments?.captures?.[0] ?? null;

//       const captureId = capture?.id ?? captureResult?.id ?? null;
//       const captureStatus = capture?.status ?? captureResult?.status ?? null;

//       const now = new Date();
//       const nowIso = now.toISOString();
//       const renewIso = addOneMonth(now).toISOString();

//       const { data: inserted, error: insertErr } = await supabase
//         .from("payment_details")
//         .insert([
//           {
//             user_id: authedUser.id,
//             email: authedUser.email,
//             amount: PREMIUM_PRICE,
//             currency: currentCurrency,
//             amount_paid_usd: currentCurrency === "USD" ? PREMIUM_PRICE : null,

//             status: "completed",
//             capture_status: captureStatus || "COMPLETED",

//             paypal_order_id: data.orderID,
//             paypal_capture_id: captureId,
//             transaction_id: captureId,

//             payer_name: payerName,
//             payer_email: payerEmail,
//             payment_mode: "paypal",

//             metadata: {
//               plan: "premium_monthly",
//               source: "wallet",
//               plan_started_at: nowIso,
//               plan_renews_at: renewIso,
//               raw_paypal: {
//                 id: captureId,
//                 status: captureStatus,
//               },
//             },

//             created_at: nowIso,
//             finished_at: nowIso,
//           },
//         ])
//         .select()
//         .single();

//       if (insertErr) {
//         console.error("payment_details insert error:", insertErr);
//         showToast(
//           `Payment captured, but we couldn't store it: ${
//             insertErr.message || "DB error"
//           }`,
//           "error"
//         );
//         setProcessingPayment(false);
//         return;
//       }

//       await onPaymentSuccess(inserted as PaymentDetail);
//       return captureResult;
//     } catch (error: any) {
//       console.error("Payment approval error:", error);
//       setProcessingPayment(false);
//       showToast(
//         error?.message || "Payment processing failed. Please try again.",
//         "error"
//       );
//       throw error;
//     }
//   };

//   // ───────────────── Plans ─────────────────
//   const plans = [
//     {
//       key: "free",
//       name: "Free",
//       price: "$0",
//       period: "forever",
//       features: [
//         "3 careercasts per month",
//         "Basic video recording",
//         "Standard resume upload",
//         "Community support",
//       ],
//       current: !isPremiumActive,
//     },
//     {
//       key: "premium",
//       name: "Premium",
//       price: premiumPriceLabel, // dynamic $ / £
//       period: "month",
//       features: [
//         "Unlimited NetworkNote",
//         "HD video recording",
//         "Advanced analytics",
//         "Priority support",
//         "Custom branding",
//       ],
//       current: isPremiumActive,
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-slate-50 flex">
//       {/* Mobile overlay for sidebar */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <div
//         className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full"
//         } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
//       >
//         <Sidebar userEmail={user?.email || ""} onLogout={handleLogout} />
//       </div>

//       {/* Main content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Mobile header */}
//         <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
//           <button
//             onClick={() => setSidebarOpen(true)}
//             className="p-2 rounded-md text-slate-700 hover:bg-slate-50 focus:outline-none"
//           >
//             <Menu className="h-6 w-6" />
//           </button>

//           <div className="flex items-center gap-3">
//             <div className="h-8 w-8 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
//               <img
//                 src="/images/networknote_final_logo_1 (2).jpg"
//                 alt="NetworkNote"
//                 className="h-full w-full object-cover"
//               />
//             </div>
//             <div className="font-semibold text-slate-900">NetworkNote</div>
//           </div>

//           <div className="w-10" />
//         </div>

//         {/* Toast container */}
//         <div id="toast-container" className="fixed top-4 right-4 z-50" />

//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
//           <div className="w-full px-8 lg:px-16">
//             <div className="max-w-6xl mx-auto">
//               {/* Header */}
//               <div className="mb-6 sm:mb-8">
//                 <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
//                   Billing & Payment
//                 </h1>
//                 <p className="text-slate-600 text-sm sm:text-base">
//                   Manage your subscription, payment methods, and billing history
//                 </p>
//               </div>

//               {/* Success / Active Premium Card */}
//               {shouldShowSuccessCard && (successTransaction || isPremiumActive) && (
//                 <div className="mb-8 bg-white rounded-xl shadow-lg border border-cyan-100 overflow-hidden">
//                   <div className="bg-cyan-600 px-6 py-4">
//                     <div className="flex items-center justify-between">
//                       <h2 className="text-xl font-bold text-white">
//                         {paymentSuccess ? "Payment Successful" : "Active Premium Plan"}
//                       </h2>
//                       <Check className="h-8 w-8 text-white" />
//                     </div>
//                   </div>

//                   <div className="p-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       {/* Transaction details */}
//                       <div>
//                         <h3 className="text-lg font-semibold text-slate-900 mb-4">
//                           Transaction Details
//                         </h3>
//                         <div className="space-y-3">
//                           <div className="flex justify-between">
//                             <span className="text-slate-600">Transaction ID:</span>
//                             <span className="font-mono text-slate-900">
//                               {successTransaction?.transaction_id ??
//                                 successTransaction?.paypal_order_id ??
//                                 successTransaction?.id ??
//                                 "N/A"}
//                             </span>
//                           </div>

//                           <div className="flex justify-between">
//                             <span className="text-slate-600">Date:</span>
//                             <span className="text-slate-900">
//                               {successTransaction
//                                 ? new Date(
//                                     successTransaction.finished_at ||
//                                       successTransaction.created_at
//                                   ).toLocaleString()
//                                 : "N/A"}
//                             </span>
//                           </div>

//                           <div className="flex justify-between">
//                             <span className="text-slate-600">Amount:</span>
//                             <span className="text-slate-900 font-semibold">
//                               {successTransaction
//                                 ? renderAmount(successTransaction)
//                                 : premiumPriceLabel}
//                             </span>
//                           </div>

//                           <div className="flex justify-between">
//                             <span className="text-slate-600">Payment Method:</span>
//                             <span className="text-slate-900">
//                               {successTransaction
//                                 ? renderMethod(successTransaction.payment_mode)
//                                 : "PayPal"}
//                             </span>
//                           </div>

//                           <div className="flex justify-between">
//                             <span className="text-slate-600">Status:</span>
//                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
//                               {successTransaction?.status || "completed"}
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Subscription details */}
//                       <div>
//                         <h3 className="text-lg font-semibold text-slate-900 mb-4">
//                           Subscription Details
//                         </h3>
//                         <div className="space-y-3">
//                           <div className="flex justify-between">
//                             <span className="text-slate-600">Plan:</span>
//                             <span className="font-semibold text-slate-900">Premium</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-slate-600">Billing Cycle:</span>
//                             <span className="text-slate-900">Monthly</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-slate-600">Next Billing Date:</span>
//                             <span className="text-slate-900">{nextBillingDate ?? "N/A"}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-slate-600">Features:</span>
//                             <span className="text-slate-900">Unlimited NetworkNote</span>
//                           </div>
//                           {isPremiumActive && (
//                             <div className="flex justify-between">
//                               <span className="text-slate-600">Plan Status:</span>
//                               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
//                                 Active
//                               </span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3">
//                       <button
//                         onClick={closeSuccessCard}
//                         className="px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
//                       >
//                         Close
//                       </button>

//                       <button
//                         onClick={() => window.print()}
//                         className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800"
//                       >
//                         Print Receipt
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* PayPal setup */}
//               {!PAYPAL_CLIENT_ID ? (
//                 <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                   <h3 className="font-medium text-yellow-800">Payment System Not Configured</h3>
//                   <p className="text-yellow-700 text-sm mt-1">
//                     PayPal integration is not configured. Set{" "}
//                     <code className="font-mono">VITE_PAYPAL_CLIENT_ID</code> in your{" "}
//                     <code>.env</code> file.
//                   </p>
//                 </div>
//               ) : (
//                 <PayPalScriptProvider
//                   options={{
//                     clientId: PAYPAL_CLIENT_ID,
//                     intent: "capture",
//                     currency: currentCurrency, // dynamic here too
//                     components: "buttons",
//                   }}
//                 >
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
//                     {plans.map((plan) => {
//                       const isPremium = plan.key === "premium";
//                       const isCurrent = plan.current;

//                       return (
//                         <div
//                           key={plan.key}
//                           className={`bg-white rounded-lg sm:rounded-xl shadow-sm border-2 ${
//                             isCurrent ? "border-cyan-600" : "border-slate-200"
//                           } overflow-hidden hover:shadow-lg transition-all duration-300`}
//                         >
//                           {isCurrent && (
//                             <div className="bg-cyan-600 text-white text-center py-2 text-xs sm:text-sm font-semibold">
//                               Current Plan
//                             </div>
//                           )}

//                           <div className="p-4 sm:p-6 space-y-4">
//                             <div className="flex items-center justify-between">
//                               <h3 className="text-lg sm:text-xl font-bold text-slate-900">{plan.name}</h3>

//                               {plan.key === "free" && isPremiumActive && (
//                                 <div className="bg-emerald-100 text-emerald-800 text-xs sm:text-sm px-3 py-1 rounded-full font-semibold">
//                                   Unlimited records active
//                                 </div>
//                               )}
//                             </div>

//                             <div className="mb-2 sm:mb-4">
//                               <span className="text-3xl sm:text-4xl font-bold text-slate-900">
//                                 {plan.price}
//                               </span>
//                               <span className="text-slate-600 text-sm sm:text-base">/{plan.period}</span>
//                             </div>

//                             <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
//                               {plan.features.map((f) => (
//                                 <li key={f} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
//                                   <Check className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
//                                   <span>{f}</span>
//                                 </li>
//                               ))}
//                             </ul>

//                             {/* Buttons */}
//                             {isPremium ? (
//                               isCurrent ? (
//                                 <button className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-slate-100 text-slate-500 cursor-not-allowed" disabled>
//                                   Current Plan
//                                 </button>
//                               ) : (
//                                 <div className="space-y-3">
//                                   <div className="p-3 border rounded-lg">
//                                     <PayPalButtons
//                                       fundingSource="paypal"
//                                       style={{
//                                         layout: "vertical",
//                                         color: "gold",
//                                         shape: "rect",
//                                       }}
//                                       disabled={!user || processingPayment}
//                                       createOrder={createOrder}
//                                       onApprove={onApprove}
//                                       onError={(err) => {
//                                         console.error("PayPal Button Error:", err);
//                                         setProcessingPayment(false);
//                                         showToast("Payment failed. Please try again.", "error");
//                                       }}
//                                       onCancel={() => {
//                                         setProcessingPayment(false);
//                                         showToast("Payment cancelled", "info");
//                                       }}
//                                     />
//                                   </div>

//                                   {processingPayment && (
//                                     <p className="text-xs text-slate-500">
//                                       Processing payment… please don’t close this tab.
//                                     </p>
//                                   )}
//                                 </div>
//                               )
//                             ) : (
//                               <button className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-slate-100 text-slate-500 cursor-not-allowed" disabled>
//                                 {plan.current ? "Current Plan" : "Free Plan"}
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </PayPalScriptProvider>
//               )}

//               {/* Info about secure processing */}
//               <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 mb-8">
//                 <h3 className="text-lg font-semibold text-slate-900 mb-2">Secure Payment Processing</h3>
//                 <p className="text-slate-600 text-sm sm:text-base mb-3">
//                   All payments are processed securely through PayPal. You don't need to share your credit card information with us.
//                 </p>
//                 <div className="flex items-center gap-2">
//                   <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
//                     <span className="text-slate-900 font-medium text-sm">PayPal</span>
//                   </div>
//                   <span className="text-slate-500 text-xs">SSL Encrypted</span>
//                 </div>
//               </div>

//               {/* Payment history */}
//               <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-8">
//                 <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Payment History</h2>

//                 {loadingHistory ? (
//                   <div className="text-center py-8">
//                     <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-600" />
//                     <p className="mt-2 text-slate-600">Loading payment history...</p>
//                   </div>
//                 ) : paymentHistory.length > 0 ? (
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-slate-200">
//                       <thead className="bg-slate-50">
//                         <tr>
//                           <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
//                             Transaction
//                           </th>
//                           <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
//                             Date
//                           </th>
//                           <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
//                             Amount
//                           </th>
//                           <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
//                             Method
//                           </th>
//                           <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
//                             Status
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-slate-200">
//                         {paymentHistory.map((p) => (
//                           <tr key={p.id}>
//                             <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
//                               {(p.transaction_id ?? p.paypal_order_id ?? p.id)
//                                 .toString()
//                                 .slice(0, 12)}
//                               …
//                             </td>
//                             <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
//                               {renderDate(p)}
//                             </td>
//                             <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
//                               {renderAmount(p)}
//                             </td>
//                             <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
//                               {renderMethod(p.payment_mode)}
//                             </td>
//                             <td className="px-4 py-4 whitespace-nowrap">
//                               <span
//                                 className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                                   p.status === "completed"
//                                     ? "bg-emerald-100 text-emerald-800"
//                                     : p.status === "pending"
//                                     ? "bg-yellow-100 text-yellow-800"
//                                     : "bg-red-100 text-red-800"
//                                 }`}
//                               >
//                                 {p.status}
//                               </span>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 ) : (
//                   <div className="text-center py-8">
//                     <CreditCard className="mx-auto h-12 w-12 text-slate-400" />
//                     <h3 className="mt-2 text-sm font-medium text-slate-900">No payment history</h3>
//                     <p className="mt-1 text-sm text-slate-600">You haven't made any payments yet.</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }







// // src/pages/Billing.tsx
// import React, { useCallback, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import { CreditCard, Check, Menu } from "lucide-react";
// import { useAuth } from "../contexts/AuthContext";
// import { supabase } from "../integrations/supabase/client";
// import { showToast } from "../components/ui/toast";
// import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// /**
//  * Billing page — server-backed orders + GBP/USD detection + verbose createOrder logging
//  */

// // ───────────────── CONFIG ─────────────────
// const PREMIUM_PRICE = 0.10;
// const FREE_LIMIT = 3;
// const USAGE_TABLE_NAME = "careercasts";
// type UserRegion = "US" | "UK" | "OTHER";

// interface PaymentDetail {
//   id: string;
//   user_id: string | null;
//   email: string | null;
//   amount: number;
//   currency: string;
//   amount_paid_usd?: number | null;
//   created_at: string;
//   finished_at?: string | null;
//   status: "created" | "pending" | "completed" | "failed";
//   capture_status?: string | null;
//   paypal_order_id?: string | null;
//   paypal_capture_id?: string | null;
//   transaction_id?: string | null;
//   payer_name?: string | null;
//   payer_email?: string | null;
//   payment_mode?: string | null;
//   metadata?: any;
// }

// const addOneMonth = (d: Date) => {
//   const copy = new Date(d);
//   copy.setMonth(copy.getMonth() + 1);
//   return copy;
// };

// // ───────────────── COMPONENT ─────────────────
// export default function Billing() {
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [paymentHistory, setPaymentHistory] = useState<PaymentDetail[]>([]);
//   const [loadingHistory, setLoadingHistory] = useState(true);
//   const [refreshPaymentsFlag, setRefreshPaymentsFlag] = useState(0);

//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   const [successTransaction, setSuccessTransaction] = useState<PaymentDetail | null>(null);
//   const [processingPayment, setProcessingPayment] = useState(false);

//   const [usageCount, setUsageCount] = useState<number>(0);
//   const [loadingUsage, setLoadingUsage] = useState<boolean>(true);

//   // region detection state
//   const [userRegion, setUserRegion] = useState<UserRegion>("US");
//   const [regionDetected, setRegionDetected] = useState(false);

//   const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;
//   const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string | undefined;
//   const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

//   const handleLogout = () => navigate("/");

//   // ───────────────── Region detection (ipapi -> locale/timezone) ─────────────────
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const r = await fetch("https://ipapi.co/json/").catch(() => null);
//         if (r && r.ok) {
//           const j = await r.json().catch(() => ({}));
//           const country = (j.country || "").toString().toUpperCase();
//           if (!mounted) return;
//           if (country === "GB" || country === "UK") {
//             setUserRegion("UK");
//             setRegionDetected(true);
//             return;
//           }
//           if (country === "US") {
//             setUserRegion("US");
//             setRegionDetected(true);
//             return;
//           }
//           const euCountries = ["IE","FR","DE","ES","IT","NL","BE","SE","NO","DK","FI","PT","AT","CH"];
//           if (euCountries.includes(country)) {
//             setUserRegion("UK"); // treat EU as UK pricing — change if you want EUR
//             setRegionDetected(true);
//             return;
//           }
//         }

//         // fallback by locale/timezone
//         const lang = (navigator.language || (navigator.languages && navigator.languages[0]) || "").toLowerCase();
//         const tz = (Intl.DateTimeFormat && Intl.DateTimeFormat().resolvedOptions().timeZone) || "";
//         if (lang.includes("en-gb") || tz.startsWith("Europe/")) {
//           setUserRegion("UK");
//         } else if (lang.includes("en-us") || tz.startsWith("America/")) {
//           setUserRegion("US");
//         } else {
//           setUserRegion("US");
//         }
//       } catch (err) {
//         console.error("Region detect error:", err);
//         setUserRegion("US");
//       } finally {
//         if (mounted) setRegionDetected(true);
//       }
//     })();
//     return () => { mounted = false; };
//   }, []);

//   const currentCurrency = userRegion === "UK" ? "GBP" : "USD";
//   const premiumPriceLabel = (() => {
//     try {
//       const locale = userRegion === "UK" ? "en-GB" : "en-US";
//       return new Intl.NumberFormat(locale, { style: "currency", currency: currentCurrency, minimumFractionDigits: 2 }).format(PREMIUM_PRICE);
//     } catch {
//       return `${userRegion === "UK" ? "£" : "$"}${PREMIUM_PRICE.toFixed(2)}`;
//     }
//   })();

//   // ───────────────── Payment history ─────────────────
//   const fetchPaymentHistory = useCallback(async () => {
//     if (!user) return;
//     setLoadingHistory(true);
//     try {
//       const { data, error } = await supabase
//         .from("payment_details")
//         .select("*")
//         .eq("user_id", user.id)
//         .order("created_at", { ascending: false });

//       if (error) {
//         console.error("fetchPaymentHistory error:", error);
//         setPaymentHistory([]);
//       } else {
//         setPaymentHistory((data as PaymentDetail[]) || []);
//       }
//     } catch (err) {
//       console.error("Error fetching payment history:", err);
//       setPaymentHistory([]);
//     } finally {
//       setLoadingHistory(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchPaymentHistory();
//   }, [fetchPaymentHistory, refreshPaymentsFlag]);

//   // ───────────────── Usage count ─────────────────
//   const fetchUsageCount = useCallback(async () => {
//     if (!user) return;
//     setLoadingUsage(true);
//     try {
//       const { count, error } = await supabase
//         .from(USAGE_TABLE_NAME)
//         .select("*", { head: true, count: "exact" })
//         .eq("user_id", user.id);
//       if (error) {
//         console.error("fetchUsageCount error:", error);
//         setUsageCount(0);
//       } else {
//         setUsageCount(count ?? 0);
//       }
//     } catch (err) {
//       console.error("Error fetching usage count:", err);
//       setUsageCount(0);
//     } finally {
//       setLoadingUsage(false);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchUsageCount();
//   }, [fetchUsageCount, refreshPaymentsFlag]);

//   // ───────────────── Helper render fns ─────────────────
//   const renderMethod = (mode?: string | null) =>
//     !mode ? "PayPal" : mode === "paypal" ? "Wallet (PayPal)" : mode === "card" ? "Card" : mode;

//   const renderDate = (p: PaymentDetail) => new Date(p.finished_at || p.created_at).toLocaleDateString();
//   const renderAmount = (p: PaymentDetail) => `${p.currency === "GBP" ? "£" : "$"}${Number(p.amount_paid_usd ?? p.amount).toFixed(2)}`;

//   // premium state (from latest completed)
//   const latestCompleted = paymentHistory.find((p) => p.status === "completed");
//   let isPremiumActive = false;
//   let nextBillingDate: string | null = null;
//   if (latestCompleted?.metadata?.plan_renews_at) {
//     const renew = new Date(latestCompleted.metadata.plan_renews_at);
//     if (renew > new Date()) {
//       isPremiumActive = true;
//       nextBillingDate = renew.toLocaleDateString();
//     }
//   }

//   // free trial logic
//   let freeUsed = 0;
//   let freeRemaining = FREE_LIMIT;
//   if (!isPremiumActive) {
//     freeUsed = Math.min(usageCount, FREE_LIMIT);
//     freeRemaining = Math.max(FREE_LIMIT - freeUsed, 0);
//   }

//   // ───────────────── Verbose createOrder (server-backed) ─────────────────
//   const createOrder = async (_data: any, _actions: any): Promise<string> => {
//     if (!user) {
//       showToast("You can't pay here. Please log in first.", "error");
//       throw new Error("not_logged_in");
//     }
//     if (!FUNCTIONS_URL) {
//       showToast("Server payments not configured.", "error");
//       throw new Error("functions_missing");
//     }

//     setProcessingPayment(true);
//     // include supabase session token to authenticate the function
//     const { data: { session } = {} as any } = await supabase.auth.getSession();
//     const accessToken = session?.access_token || "";

//     try {
//       const payload = {
//         amount: PREMIUM_PRICE,
//         currency: currentCurrency, // "GBP" or "USD"
//         user_id: user.id,
//         email: user.email,
//         metadata: { plan: "premium_monthly", source: "wallet" },
//       };

//       console.info("create-order -> sending payload:", payload);

//       const res = await fetch(`${FUNCTIONS_URL}/create-order`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } : {}),
//           ...(accessToken ? { "X-User-Token": accessToken } : {}),
//         },
//         body: JSON.stringify(payload),
//       });

//       // Read raw text first (so we can log unparseable bodies)
//       const raw = await res.text().catch(() => "");
//       let json: any = null;
//       try {
//         json = raw ? JSON.parse(raw) : null;
//       } catch (e) {
//         console.warn("create-order: response not JSON", raw);
//         json = null;
//       }

//       console.group("create-order response");
//       console.log("status:", res.status, res.statusText);
//       console.log("raw body:", raw);
//       console.log("parsed json:", json);
//       console.groupEnd();

//       if (!res.ok) {
//         const serverMsg = json?.error || json?.message || json?.details || raw || `HTTP ${res.status}`;
//         showToast(`Create order failed: ${String(serverMsg).slice(0, 200)}`, "error");
//         setProcessingPayment(false);
//         throw new Error(`create_order_failed: ${serverMsg}`);
//       }

//       const orderId = json?.orderId;
//       const paymentId = json?.paymentId;
//       if (!orderId) {
//         const serverMsg = json?.error || json?.message || json?.details || raw || "no_order_id";
//         console.error("create-order missing orderId", serverMsg);
//         showToast(`Create order returned no order id: ${String(serverMsg).slice(0, 200)}`, "error");
//         setProcessingPayment(false);
//         throw new Error("no_order_id");
//       }

//       (window as any).__paymentId = paymentId ?? null;
//       return orderId;
//     } catch (err) {
//       console.error("createOrder exception:", err);
//       setProcessingPayment(false);
//       const msg = (err as any)?.message || String(err);
//       showToast(`Create order failed: ${String(msg).slice(0, 160)}`, "error");
//       throw err;
//     }
//   };

//   // ───────────────── onApprove: capture + post to server capture-order ─────────────────
//   const onApprove = async (data: any, actions: any) => {
//     try {
//       if (!actions.order) throw new Error("PayPal order action not available");
//       const captureResult = await actions.order.capture();

//       if (!user) {
//         showToast("Payment captured, but user session was lost. Contact support.", "error");
//         setProcessingPayment(false);
//         return;
//       }

//       const { data: authData, error: authError } = await supabase.auth.getUser();
//       if (authError || !authData?.user) {
//         console.error("auth.getUser error:", authError);
//         showToast("You must login again to complete payment.", "error");
//         setProcessingPayment(false);
//         return;
//       }
//       const authedUser = authData.user;

//       const payerEmail = captureResult?.payer?.email_address ?? null;
//       const payerName = `${captureResult?.payer?.name?.given_name || ""} ${captureResult?.payer?.name?.surname || ""}`.trim() || null;
//       const capture = captureResult?.purchase_units?.[0]?.payments?.captures?.[0] ?? null;
//       const captureId = capture?.id ?? captureResult?.id ?? null;
//       const captureStatus = capture?.status ?? captureResult?.status ?? null;

//       const paymentId = (window as any).__paymentId ?? null;

//       try {
//         const { data: { session } = {} as any } = await supabase.auth.getSession();
//         const accessToken = session?.access_token || "";

//         const res = await fetch(`${FUNCTIONS_URL}/capture-order`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } : {}),
//             ...(accessToken ? { "X-User-Token": accessToken } : {}),
//           },
//           body: JSON.stringify({
//             paymentId,
//             orderId: data.orderID,
//             captureInfo: captureResult,
//             payer_email: payerEmail,
//             payer_name: payerName,
//           }),
//         });

//         const json = await res.json().catch(() => ({}));
//         if (!res.ok) {
//           console.error("capture-order function returned error:", json);
//           setProcessingPayment(false);
//           showToast("Payment captured but server update failed. Contact support.", "error");
//           setRefreshPaymentsFlag((n) => n + 1);
//           return captureResult;
//         }

//         // success
//         setRefreshPaymentsFlag((n) => n + 1);
//         setProcessingPayment(false);
//         setPaymentSuccess(true);

//         const paymentRow = json?.paymentRow ?? (Array.isArray(json) ? json[0] : null);
//         if (paymentRow) {
//           setSuccessTransaction(paymentRow as PaymentDetail);
//         } else {
//           await fetchPaymentHistory();
//           const recent = paymentHistory.find((p) => p.status === "completed");
//           if (recent) setSuccessTransaction(recent);
//         }

//         showToast("Payment successful! 🎉", "success");
//         return captureResult;
//       } catch (err) {
//         console.error("capture-order request error:", err);
//         setProcessingPayment(false);
//         showToast("Payment captured but server update failed. Contact support.", "error");
//         setRefreshPaymentsFlag((n) => n + 1);
//         return captureResult;
//       }
//     } catch (err: any) {
//       console.error("Payment approval error:", err);
//       setProcessingPayment(false);
//       showToast(err?.message || "Payment processing failed. Please try again.", "error");
//       throw err;
//     }
//   };

//   const onPaymentSuccess = useCallback(async (storedPayment: PaymentDetail | null) => {
//     setPaymentSuccess(true);
//     setProcessingPayment(false);
//     if (storedPayment) setSuccessTransaction(storedPayment);
//     setRefreshPaymentsFlag((n) => n + 1);
//     showToast("Payment successful! 🎉", "success");
//   }, []);

//   const closeSuccessCard = () => {
//     setPaymentSuccess(false);
//     setSuccessTransaction(null);
//   };

//   // ───────────────── UI Plans ─────────────────
//   const plans = [
//     {
//       key: "free",
//       name: "Free",
//       price: "$0",
//       period: "forever",
//       features: [
//         "3 careercasts per month",
//         "Basic video recording",
//         "Standard resume upload",
//         "Community support",
//       ],
//       current: !isPremiumActive,
//     },
//     {
//       key: "premium",
//       name: "Premium",
//       price: premiumPriceLabel,
//       period: "month",
//       features: [
//         "Unlimited careercasts",
//         "HD video recording",
//         "Advanced analytics",
//         "Priority support",
//         "Custom branding",
//       ],
//       current: isPremiumActive,
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-white flex">
//       {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

//       <div className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
//         <Sidebar userEmail={user?.email || ""} onLogout={handleLogout} />
//       </div>

//       <div className="flex-1 flex flex-col overflow-hidden">
//         <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
//           <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none">
//             <Menu className="h-6 w-6" />
//           </button>
//           <div className="font-bold text-xl text-[#0B4F6C]">NetworkNote</div>
//           <div className="w-10" />
//         </div>

//         <div id="toast-container" className="fixed top-4 right-4 z-50"></div>

//         <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50">
//           <div className="max-w-6xl mx-auto">
//             <div className="mb-6 sm:mb-8">
//               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Billing & Payment</h1>
//               <p className="text-gray-600 text-sm sm:text-base">Manage your subscription, payment methods, and billing history</p>
//             </div>

//             {(paymentSuccess || isPremiumActive) && (successTransaction || isPremiumActive) && (
//               <div className="mb-8 bg-white rounded-xl shadow-lg border border-green-200 overflow-hidden">
//                 <div className="bg-green-600 px-6 py-4">
//                   <div className="flex items-center justify-between">
//                     <h2 className="text-xl font-bold text-white">{paymentSuccess ? "Payment Successful" : "Active Premium Plan"}</h2>
//                     <Check className="h-8 w-8 text-white" />
//                   </div>
//                 </div>
//                 <div className="p-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
//                       <div className="space-y-3">
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Transaction ID:</span>
//                           <span className="font-mono text-gray-900">{successTransaction?.transaction_id ?? successTransaction?.paypal_order_id ?? successTransaction?.id ?? "N/A"}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Date:</span>
//                           <span className="text-gray-900">{successTransaction ? new Date(successTransaction.finished_at || successTransaction.created_at).toLocaleString() : "N/A"}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Amount:</span>
//                           <span className="text-gray-900 font-semibold">{successTransaction ? renderAmount(successTransaction) : premiumPriceLabel}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Payment Method:</span>
//                           <span className="text-gray-900">{successTransaction ? renderMethod(successTransaction.payment_mode) : "PayPal"}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Status:</span>
//                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{successTransaction?.status || "completed"}</span>
//                         </div>
//                       </div>
//                     </div>

//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
//                       <div className="space-y-3">
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Plan:</span>
//                           <span className="font-semibold text-gray-900">Premium</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Billing Cycle:</span>
//                           <span className="text-gray-900">Monthly</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Next Billing Date:</span>
//                           <span className="text-gray-900">{nextBillingDate ?? "N/A"}</span>
//                         </div>
//                         <div className="flex justify-between">
//                           <span className="text-gray-600">Features:</span>
//                           <span className="text-gray-900">Unlimited careercasts</span>
//                         </div>
//                         {isPremiumActive && (
//                           <div className="flex justify-between">
//                             <span className="text-gray-600">Plan Status:</span>
//                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
//                     <button onClick={closeSuccessCard} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Close</button>
//                     <button onClick={() => window.print()} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#01796F] hover:bg-[#0B4F6C]">Print Receipt</button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {!PAYPAL_CLIENT_ID ? (
//               <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <h3 className="font-medium text-yellow-800">Payment System Not Configured</h3>
//                 <p className="text-yellow-700 text-sm mt-1">Set <code className="font-mono">VITE_PAYPAL_CLIENT_ID</code> in your .env.</p>
//               </div>
//             ) : !regionDetected ? (
//               <div className="mb-8 text-sm text-gray-600">Detecting region…</div>
//             ) : (
//               <PayPalScriptProvider key={`${currentCurrency}`} options={{ clientId: PAYPAL_CLIENT_ID || "", intent: "capture", currency: currentCurrency, components: "buttons" }}>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
//                   {plans.map((plan) => {
//                     const isPremium = plan.key === "premium";
//                     const isCurrent = plan.current;
//                     return (
//                       <div key={plan.key} className={`bg-white rounded-lg sm:rounded-xl shadow-sm border-2 ${isCurrent ? "border-[#01796F]" : "border-gray-200"} overflow-hidden hover:shadow-lg transition-all duration-300`}>
//                         {isCurrent && <div className="bg-[#01796F] text-white text-center py-2 text-xs sm:text-sm font-semibold">Current Plan</div>}
//                         <div className="p-4 sm:p-6">
//                           <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
//                           <div className="mb-4 sm:mb-6">
//                             <span className="text-3xl sm:text-4xl font-bold text-gray-900">{plan.price}</span>
//                             <span className="text-gray-600 text-sm sm:text-base">/{plan.period}</span>
//                           </div>
//                           <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
//                             {plan.features.map((f) => <li key={f} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600"><Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#01796F] flex-shrink-0 mt-0.5" /> <span>{f}</span></li>)}
//                           </ul>

//                           {isPremium ? (
//                             isCurrent ? (
//                               <button className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-gray-100 text-gray-500 cursor-not-allowed" disabled>Current Plan</button>
//                             ) : (
//                               <div className="space-y-6">
//                                 <div className="p-3 border rounded-lg">
//                                   <PayPalButtons
//                                     fundingSource="paypal"
//                                     style={{ layout: "vertical", color: "gold", shape: "rect" }}
//                                     disabled={!user || processingPayment}
//                                     createOrder={createOrder}
//                                     onApprove={onApprove}
//                                     onError={(err) => {
//                                       console.error("PayPal Button Error:", err);
//                                       setProcessingPayment(false);
//                                       showToast("Payment failed. Please try again.", "error");
//                                     }}
//                                     onCancel={() => {
//                                       setProcessingPayment(false);
//                                       showToast("Payment cancelled", "info");
//                                     }}
//                                   />
//                                 </div>

//                                 {processingPayment && <p className="text-xs text-gray-500">Processing payment… please don’t close this tab.</p>}
//                               </div>
//                             )
//                           ) : (
//                             <button className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-gray-100 text-gray-500 cursor-not-allowed" disabled>{plan.current ? "Current Plan" : "Free Plan"}</button>
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </PayPalScriptProvider>
//             )}

//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-8">
//               <h3 className="text-lg font-semibold text-blue-800 mb-2">Secure Payment Processing</h3>
//               <p className="text-blue-700 text-sm sm:text-base mb-3">All payments are processed securely through PayPal. You don't need to share your credit card information with us.</p>
//               <div className="flex items-center gap-2">
//                 <div className="bg-white px-3 py-1 rounded-full border border-blue-300"><span className="text-blue-800 font-medium text-sm">PayPal</span></div>
//                 <span className="text-blue-600 text-xs">SSL Encrypted</span>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
//               <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Payment History</h2>

//               {loadingHistory ? (
//                 <div className="text-center py-8">
//                   <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#01796F]" />
//                   <p className="mt-2 text-gray-600">Loading payment history...</p>
//                 </div>
//               ) : paymentHistory.length > 0 ? (
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50"><tr>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                     </tr></thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {paymentHistory.map((p) => (
//                         <tr key={p.id}>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{(p.transaction_id ?? p.paypal_order_id ?? p.id).toString().slice(0, 12)}…</td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{renderDate(p)}</td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{renderAmount(p)}</td>
//                           <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{renderMethod(p.payment_mode)}</td>
//                           <td className="px-4 py-4 whitespace-nowrap">
//                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'completed' ? 'bg-green-100 text-green-800' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{p.status}</span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <div className="text-center py-8">
//                   <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
//                   <h3 className="mt-2 text-sm font-medium text-gray-900">No payment history</h3>
//                   <p className="mt-1 text-sm text-gray-500">You haven't made any payments yet.</p>
//                 </div>
//               )}
//             </div>

//             <div className="mb-8">
//               <div className="flex items-center gap-3">
//                 <div className="text-sm text-gray-700">Free plan trials left:</div>
//                 <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-md font-semibold text-sm">{loadingUsage ? "Checking…" : `${freeRemaining}/${FREE_LIMIT} free trials left`}</div>
//               </div>
//             </div>

//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }


// src/pages/Billing.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { CreditCard, Check, Menu } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../integrations/supabase/client";
import { showToast } from "../components/ui/toast";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// ───────────────── CONFIG ─────────────────
const PREMIUM_PRICE = 0.10;
const FREE_LIMIT = 3;
const USAGE_TABLE_NAME = "careercasts";

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

  const [userCountry, setUserCountry] = useState<CountryCode>("OTHER");

  const PAYPAL_CLIENT_ID = import.meta.env
    .VITE_PAYPAL_CLIENT_ID as string | undefined;

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
        console.error("fetchPaymentHistory error:", error);
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

  // ───────────────── Usage count ─────────────────
  const fetchUsageCount = useCallback(async () => {
    if (!user) return;
    setLoadingUsage(true);
    try {
      const { count, error } = await supabase
        .from(USAGE_TABLE_NAME)
        .select("*", { head: true, count: "exact" })
        .eq("user_id", user.id);

      if (error) {
        console.error("fetchUsageCount error:", error);
        setUsageCount(0);
      } else {
        setUsageCount(count ?? 0);
      }
    } catch (err) {
      console.error("Error fetching usage count:", err);
      setUsageCount(0);
    } finally {
      setLoadingUsage(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsageCount();
  }, [fetchUsageCount, refreshPaymentsFlag]);

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
  const latestCompleted = paymentHistory.find((p) => p.status === "completed");

  let isPremiumActive = false;
  let nextBillingDate: string | null = null;

  if (latestCompleted?.metadata?.plan_renews_at) {
    const renewDate = new Date(latestCompleted.metadata.plan_renews_at);
    if (renewDate > new Date()) {
      isPremiumActive = true;
      nextBillingDate = renewDate.toLocaleDateString();
    }
  }

  // 👉 NEW: use latestCompleted as fallback when successTransaction is null
  const effectiveTransaction: PaymentDetail | null =
    successTransaction || latestCompleted || null;

  // ───────────────── Free trials ─────────────────
  let freeUsed = 0;
  let freeRemaining = FREE_LIMIT;
  if (!isPremiumActive) {
    freeUsed = Math.min(usageCount, FREE_LIMIT);
    freeRemaining = Math.max(FREE_LIMIT - freeUsed, 0);
  }
  const isLimitReached = !isPremiumActive && freeUsed >= FREE_LIMIT;
  const shouldShowFreeBadge = !isPremiumActive;

  // ───────────────── Payment success ─────────────────
  const onPaymentSuccess = useCallback(
    async (storedPayment: PaymentDetail | null) => {
      setPaymentSuccess(true);
      setProcessingPayment(false);
      if (storedPayment) setSuccessTransaction(storedPayment);
      setRefreshPaymentsFlag((n) => n + 1);
      showToast("Payment successful! 🎉", "success");
    },
    []
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

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      console.error("auth.getUser error:", authError);
      showToast("You can't pay here. Please log in again.", "error");
      throw new Error("auth_user_not_found");
    }

    setProcessingPayment(true);

    const orderId = await actions.order.create({
      purchase_units: [
        {
          amount: {
            value: PREMIUM_PRICE.toFixed(2),
            currency_code: activeCurrency,
          },
          description: "NetworkNote Premium – Monthly",
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
        `${captureResult?.payer?.name?.given_name || ""} ${
          captureResult?.payer?.name?.surname || ""
        }`.trim() || null;

      const capture =
        captureResult?.purchase_units?.[0]?.payments?.captures?.[0] ?? null;

      const captureId = capture?.id ?? captureResult?.id ?? null;
      const captureStatus = capture?.status ?? captureResult?.status ?? null;

      const now = new Date();
      const nowIso = now.toISOString();
      const renewIso = addOneMonth(now).toISOString();

      const { data: inserted, error: insertErr } = await supabase
        .from("payment_details")
        .insert([
          {
            user_id: authedUser.id,
            email: authedUser.email,
            amount: PREMIUM_PRICE,
            currency: activeCurrency,
            amount_paid_usd: activeCurrency === "USD" ? PREMIUM_PRICE : null,
            status: "completed",
            capture_status: captureStatus || "COMPLETED",
            paypal_order_id: data.orderID,
            paypal_capture_id: captureId,
            transaction_id: captureId,
            payer_name: payerName,
            payer_email: payerEmail,
            payment_mode: "paypal",
            metadata: {
              plan: "premium_monthly",
              source: "wallet",
              plan_started_at: nowIso,
              plan_renews_at: renewIso,
              raw_paypal: {
                id: captureId,
                status: captureStatus,
              },
            },
            created_at: nowIso,
            finished_at: nowIso,
          },
        ])
        .select()
        .single();

      if (insertErr) {
        console.error("payment_details insert error:", insertErr);
        showToast(
          `Payment captured, but we couldn't store it: ${
            insertErr.message || "DB error"
          }`,
          "error"
        );
        setProcessingPayment(false);
        return;
      }

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
        "3 NetworkNote",
        "Basic video recording",
        "Standard resume upload",
        // "Community support",
      ],
      current: !isPremiumActive,
    },
    {
      key: "premium",
      name: "Premium",
      price: priceLabel,
      period: "month",
      features: [
        "Unlimited NetworkNote",
        "HD video recording",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
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
            <div className="h-8 w-8 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
              <img
                src="/images/networknote_final_logo_1 (2).jpg"
                alt="NetworkNote"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="font-semibold text-slate-900">NetworkNote</div>
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
                          Subscription Details
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Plan:</span>
                            <span className="font-semibold text-slate-900">Premium</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Billing Cycle:</span>
                            <span className="text-slate-900">Monthly</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Next Billing Date:</span>
                            <span className="text-slate-900">{nextBillingDate ?? "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Features:</span>
                            <span className="text-slate-900">Unlimited NetworkNote</span>
                          </div>
                          {isPremiumActive && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Plan Status:</span>
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
                          className={`bg-white rounded-lg sm:rounded-xl shadow-sm border-2 ${
                            isCurrent ? "border-cyan-600" : "border-slate-200"
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

                              {plan.key === "free" && isPremiumActive && (
                                <div className="bg-emerald-100 text-emerald-800 text-xs sm:text-sm px-3 py-1 rounded-full font-semibold">
                                  Unlimited records active
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
                              isCurrent ? (
                                <button
                                  className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-slate-100 text-slate-500 cursor-not-allowed"
                                  disabled
                                >
                                  Current Plan
                                </button>
                              ) : (
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
                              )
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
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  p.status === "completed"
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

              {/* Optional free trial badge (commented) */}
              {/* {shouldShowFreeBadge && (
                <div className="mb-8">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-slate-700">Free plan trials:</div>
                    <div
                      className={`px-3 py-1 rounded-md font-semibold text-sm ${
                        isLimitReached ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {loadingUsage
                        ? "Checking usage…"
                        : isLimitReached
                        ? "3/3 free trials used – please upgrade"
                        : `${freeRemaining}/${FREE_LIMIT} free trials left`}
                    </div>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// // src/pages/SignupPage.tsx
// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { supabase } from "../integrations/supabase/client";
// import {
//   PayPalScriptProvider,
//   PayPalButtons,
// } from "@paypal/react-paypal-js";

// type Step = "form" | "payment" | "success";

// interface UsersByFormRow {
//   id: string;
//   full_name: string;
//   email: string;
//   phone: string | null;
//   country_code: string | null;
//   promo_code: string | null;
//   payment_status: string | null;
//   amount: number | null;
//   currency: string | null;
//   paypal_order_id: string | null;
//   paypal_capture_id: string | null;
//   user_id: string | null;
// }

// const SignupPage: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Plan info from landing (amount + currency)
//   const state = (location.state || {}) as {
//     plan?: "US" | "UK";
//     amount?: number;
//     currency?: string;
//   };

//   const plan = state.plan ?? "US";
//   const amount = state.amount ?? 12.99;
//   const currency = state.currency ?? "USD";

//   const [step, setStep] = useState<Step>("form");
//   const [form, setForm] = useState({
//     fullName: "",
//     countryCode: "",
//     phone: "",
//     email: "",
//     promoCode: "",
//   });

//   const [agreedToTerms, setAgreedToTerms] = useState(false);
//   const [showTermsModal, setShowTermsModal] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [loadingForm, setLoadingForm] = useState(false);

//   const [formRow, setFormRow] = useState<UsersByFormRow | null>(null);
//   const [paymentLoading, setPaymentLoading] = useState(false);
//   const [paymentError, setPaymentError] = useState<string | null>(null);

//   const [successInfo, setSuccessInfo] = useState<{
//     transactionId: string;
//     amount: number;
//     currency: string;
//   } | null>(null);

//   // env variables (Vite: must be prefixed with VITE_)
//   const PAYPAL_CLIENT_ID = import.meta.env
//     .VITE_PAYPAL_CLIENT_ID as string | undefined;

//   // debug in dev so you can confirm the env is present
//   if (import.meta.env.DEV) {
//     // eslint-disable-next-line no-console
//     console.debug("SignupPage env:", {
//       PAYPAL_CLIENT_ID: PAYPAL_CLIENT_ID ? "[present]" : "[missing]",
//     });
//   }

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setAgreedToTerms(e.target.checked);
//   };

//   const openTermsModal = () => setShowTermsModal(true);
//   const closeTermsModal = () => setShowTermsModal(false);

//   // 1️⃣ Form submit → create users_by_form row (payment pending), then show PayPal
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setLoadingForm(true);

//     if (
//       !form.fullName.trim() ||
//       !form.email.trim() ||
//       !form.phone.trim() ||
//       !form.countryCode
//     ) {
//       setError("Please fill in all required fields");
//       setLoadingForm(false);
//       return;
//     }

//     try {
//       const fullName = form.fullName.trim();
//       const email = form.email.trim().toLowerCase();
//       const phone = form.phone.trim();
//       const countryCode = form.countryCode;
//       const promoCode = form.promoCode.trim() || null;

//       // Insert into users_by_form with payment pending
//       const { data, error: insertError } = await supabase
//         .from("users_by_form")
//         .insert([
//           {
//             user_id: null, // will set after payment + auth user creation
//             full_name: fullName,
//             email,
//             phone,
//             country_code: countryCode,
//             promo_code: promoCode,
//             payment_status: "pending",
//             amount,
//             currency,
//           },
//         ])
//         .select()
//         .single();

//       if (insertError) {
//         console.error("❌ users_by_form insert error:", insertError);
//         throw insertError;
//       }

//       setFormRow(data as UsersByFormRow);
//       setStep("payment");
//     } catch (err: any) {
//       console.error("❌ Signup form error:", err);
//       setError(err?.message || "Something went wrong. Please try again.");
//     } finally {
//       setLoadingForm(false);
//     }
//   };

//   // 2️⃣ Payment success handler: update users_by_form + create auth user + send email
//   const handlePaymentSuccess = async (params: {
//     orderId: string;
//     captureId: string | null;
//   }) => {
//     try {
//       if (!formRow) {
//         console.error("No formRow in state; cannot link payment.");
//         return;
//       }

//       setPaymentLoading(true);
//       setPaymentError(null);

//       const fullName = form.fullName.trim();
//       const email = form.email.trim().toLowerCase();
//       const phone = form.phone.trim();
//       const firstName =
//         fullName.split(" ").filter(Boolean)[0] || "user";
//       const password = `${firstName}@123`;

//       // 2.1 Update users_by_form with payment success + PayPal IDs
//       const { error: updateError } = await supabase
//         .from("users_by_form")
//         .update({
//           payment_status: "success",
//           amount,
//           currency,
//           paypal_order_id: params.orderId,
//           paypal_capture_id: params.captureId,
//         })
//         .eq("id", formRow.id);

//       if (updateError) {
//         console.error("❌ Update users_by_form payment error:", updateError);
//         throw updateError;
//       }

//       // 2.2 Create auth user in auth.users
//       const { data: signUpData, error: signUpError } =
//         await supabase.auth.signUp({
//           email,
//           password,
//           phone: phone || undefined,
//         });

//       if (signUpError) {
//         console.error("❌ auth.signUp error:", signUpError);
//         throw signUpError;
//       }

//       const userId = signUpData.user?.id;
//       if (!userId) {
//         throw new Error("Could not get created user ID from Supabase auth.");
//       }

//       // 2.3 Attach user_id to users_by_form row
//       const { error: attachError } = await supabase
//         .from("users_by_form")
//         .update({ user_id: userId })
//         .eq("id", formRow.id);

//       if (attachError) {
//         console.error("❌ users_by_form attach user_id error:", attachError);
//         throw attachError;
//       }

//       // 2.4 Invoke Edge Function to send credentials email (best-effort)
//       try {
//         await supabase.functions.invoke("send-credentials-email", {
//           body: {
//             email,
//             full_name: fullName,
//             password,
//             login_url: "https://your-domain.com/auth", // <-- change to your real login URL
//           },
//         });
//       } catch (emailErr) {
//         console.error("⚠️ Error sending credentials email:", emailErr);
//         // don't block success; just log
//       }

//       // 2.5 Show success card
//       setSuccessInfo({
//         transactionId: params.captureId || params.orderId,
//         amount,
//         currency,
//       });
//       setStep("success");
//     } catch (err: any) {
//       console.error("❌ handlePaymentSuccess error:", err);
//       setPaymentError(
//         err?.message || "Payment succeeded but we had an internal error."
//       );
//     } finally {
//       setPaymentLoading(false);
//     }
//   };

//   const amountDisplay =
//     currency === "GBP"
//       ? `£${amount.toFixed(2)}`
//       : currency === "EUR"
//       ? `€${amount.toFixed(2)}`
//       : `$${amount.toFixed(2)}`;

//   return (
//     <div className="min-h-screen bg-white text-gray-900">
//       {/* Top back button */}
//       <div className="mx-auto w-full max-w-5xl px-4 pt-6">
//         <button
//           onClick={() => navigate("/")}
//           className="group inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
//         >
//           <svg
//             className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
//             viewBox="0 0 20 20"
//             fill="currentColor"
//           >
//             <path
//               fillRule="evenodd"
//               d="M12.293 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 9H17a1 1 0 110 2H8.414l3.879 3.879a1 1 0 010 1.414z"
//               clipRule="evenodd"
//             />
//           </svg>
//           Back to home
//         </button>
//       </div>

//       <div className="mx-auto mt-8 w-full max-w-3xl px-4 pb-12">
//         <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
//           <div className="p-8 sm:p-12">
//             <h1 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">
//               Create your account
//             </h1>
//             <p className="mt-3 text-center text-base text-gray-500">
//               You will be charged{" "}
//               <span className="font-semibold">{amountDisplay}</span> (
//               {plan === "UK" ? "UK plan" : "US plan"})
//             </p>

//             {/* STEP 1: FORM */}
//             {step === "form" && (
//               <form
//                 onSubmit={handleSubmit}
//                 className="mx-auto mt-10 max-w-2xl space-y-6"
//               >
//                 <div className="space-y-2">
//                   <label
//                     htmlFor="fullName"
//                     className="text-sm font-medium text-gray-700"
//                   >
//                     Full Name *
//                   </label>
//                   <input
//                     id="fullName"
//                     name="fullName"
//                     value={form.fullName}
//                     onChange={handleChange}
//                     placeholder="Enter your full name"
//                     required
//                     className="w-full rounded-xl border border-transparent bg-indigo-50/60 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none ring-1 ring-indigo-100 focus:ring-2 focus:ring-indigo-300"
//                   />
//                 </div>

//                 <div className="grid grid-cols-3 gap-4">
//                   <div className="col-span-1 space-y-2">
//                     <label
//                       htmlFor="countryCode"
//                       className="text-sm font-medium text-gray-700"
//                     >
//                       Country Code *
//                     </label>
//                     <select
//                       id="countryCode"
//                       name="countryCode"
//                       value={form.countryCode}
//                       onChange={handleChange}
//                       required
//                       className="w-full rounded-xl border border-transparent bg-indigo-50/60 px-4 py-3 text-gray-900 outline-none ring-1 ring-indigo-100 focus:ring-2 focus:ring-indigo-300"
//                     >
//                       <option value="">Code</option>
//                       <option value="+1">+1 (US)</option>
//                       <option value="+44">+44 (UK)</option>
//                       <option value="+91">+91 (India)</option>
//                     </select>
//                   </div>
//                   <div className="col-span-2 space-y-2">
//                     <label
//                       htmlFor="phone"
//                       className="text-sm font-medium text-gray-700"
//                     >
//                       Phone Number *
//                     </label>
//                     <input
//                       id="phone"
//                       name="phone"
//                       type="tel"
//                       value={form.phone}
//                       onChange={handleChange}
//                       placeholder="Enter phone number"
//                       required
//                       className="w-full rounded-xl border border-transparent bg-indigo-50/60 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none ring-1 ring-indigo-100 focus:ring-2 focus:ring-indigo-300"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label
//                     htmlFor="email"
//                     className="text-sm font-medium text-gray-700"
//                   >
//                     Email ID *
//                   </label>
//                   <input
//                     id="email"
//                     name="email"
//                     type="email"
//                     value={form.email}
//                     onChange={handleChange}
//                     placeholder="Enter your email"
//                     required
//                     className="w-full rounded-xl border border-transparent bg-indigo-50/60 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none ring-1 ring-indigo-100 focus:ring-2 focus:ring-indigo-300"
//                   />
//                 </div>

//                 {/* Terms checkbox */}
//                 <div className="space-y-2">
//                   <div className="flex items-start">
//                     <div className="flex items-center h-5 mt-1">
//                       <input
//                         id="terms"
//                         name="terms"
//                         type="checkbox"
//                         checked={agreedToTerms}
//                         onChange={handleTermsChange}
//                         className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
//                       />
//                     </div>
//                     <div className="ml-3 text-sm">
//                       <label
//                         htmlFor="terms"
//                         className="font-medium text-gray-700"
//                       >
//                         I agree to the{" "}
//                         <button
//                           type="button"
//                           onClick={openTermsModal}
//                           className="text-blue-600 hover:underline"
//                         >
//                           Terms &amp; Conditions
//                         </button>
//                       </label>
//                     </div>
//                   </div>
//                 </div>

//                 {error && (
//                   <div className="rounded-lg bg-red-50 p-4 border border-red-200">
//                     <p className="text-sm text-red-700">{error}</p>
//                   </div>
//                 )}

//                 <button
//                   type="submit"
//                   disabled={loadingForm || !agreedToTerms}
//                   className={`w-full rounded-xl px-6 py-3 text-lg font-semibold text-white shadow-lg hover:scale-[1.01] transition-transform focus:ring-4 focus:ring-blue-300 disabled:opacity-70 disabled:cursor-not-allowed ${
//                     agreedToTerms
//                       ? "bg-gradient-to-r from-blue-800 to-purple-800 hover:from-blue-700 hover:to-purple-700"
//                       : "bg-gradient-to-r from-blue-600 to-purple-600"
//                   }`}
//                 >
//                   {loadingForm ? "Creating record..." : "Proceed to Payment"}
//                 </button>
//               </form>
//             )}

//             {/* STEP 2: PAYMENT (shown after form row created) */}
//             {step === "payment" && (
//               <div className="mt-10 space-y-6">
//                 <h2 className="text-xl font-semibold text-gray-900 text-center">
//                   Complete your payment ({amountDisplay})
//                 </h2>

//                 {!PAYPAL_CLIENT_ID && (
//                   <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
//                     PayPal is not configured. Set VITE_PAYPAL_CLIENT_ID in your
//                     .env file.
//                   </div>
//                 )}

//                 {PAYPAL_CLIENT_ID && formRow && (
//                   <PayPalScriptProvider
//                     options={{
//                       // clientId is required by ReactPayPalScriptOptions type
//                       clientId: PAYPAL_CLIENT_ID,
//                       intent: "capture",
//                       currency,
//                     }}
//                   >
//                     <div className="max-w-md mx-auto border rounded-xl p-4 shadow-sm bg-gray-50">
//                       {paymentError && (
//                         <div className="mb-3 rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
//                           {paymentError}
//                         </div>
//                       )}

//                       <PayPalButtons
//                         style={{ layout: "vertical" }}
//                         disabled={paymentLoading}
//                         // force re-render when amount or currency changes
//                         forceReRender={[amount, currency]}
//                         createOrder={(_, actions) => {
//                           // ✅ Use PayPal's client-side create; no Supabase edge function needed
//                           return actions.order.create({
//                             purchase_units: [
//                               {
//                                 amount: {
//                                   value: amount.toFixed(2),
//                                   currency_code: currency,
//                                 },
//                                 // link this order back to your users_by_form row
//                                 custom_id: formRow.id,
//                               },
//                             ],
//                             application_context: {
//                               shipping_preference: "NO_SHIPPING",
//                             },
//                           });
//                         }}
//                         onApprove={async (data, actions) => {
//                           if (!actions.order) {
//                             throw new Error("actions.order is not available");
//                           }

//                           setPaymentLoading(true);
//                           setPaymentError(null);

//                           try {
//                             const captureResult = await actions.order.capture();

//                             const orderId = data.orderID;
//                             const captureId =
//                               captureResult?.purchase_units?.[0]?.payments
//                                 ?.captures?.[0]?.id ??
//                               captureResult?.id ??
//                               null;

//                             // Now handle local success flow (Supabase updates + email)
//                             await handlePaymentSuccess({
//                               orderId,
//                               captureId,
//                             });
//                           } catch (err: any) {
//                             console.error("onApprove error:", err);
//                             setPaymentError(
//                               err?.message ||
//                                 "Something went wrong while capturing payment."
//                             );
//                           } finally {
//                             setPaymentLoading(false);
//                           }
//                         }}
//                         onError={(err) => {
//                           console.error("PayPal onError:", err);
//                           setPaymentError(
//                             `Payment could not be started. ${
//                               (err as any)?.message
//                                 ? (err as any).message
//                                 : "Please try again."
//                             }`
//                           );
//                         }}
//                       />
//                     </div>
//                   </PayPalScriptProvider>
//                 )}
//               </div>
//             )}

//             {/* STEP 3: SUCCESS CARD */}
//             {step === "success" && successInfo && (
//               <div className="mt-10 max-w-xl mx-auto rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm">
//                 <h2 className="text-xl font-bold text-green-800 mb-2">
//                   Payment Successful 🎉
//                 </h2>
//                 <p className="text-green-900 mb-4">
//                   Your payment of{" "}
//                   <span className="font-semibold">
//                     {amountDisplay}
//                   </span>{" "}
//                   was completed successfully.
//                 </p>
//                 <div className="space-y-2 text-sm text-green-900">
//                   <div className="flex justify-between">
//                     <span className="font-medium">
//                       Transaction / Capture ID:
//                     </span>
//                     <span className="font-mono">
//                       {successInfo.transactionId}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="font-medium">Amount:</span>
//                     <span>{amountDisplay}</span>
//                   </div>
//                 </div>
//                 <p className="mt-4 text-sm text-green-900">
//                   We’ve also created your account and emailed your login
//                   credentials.
//                 </p>
//                 <button
//                   onClick={() => navigate("/auth")}
//                   className="mt-6 w-full rounded-lg bg-green-700 px-4 py-2 text-white font-semibold hover:bg-green-800"
//                 >
//                   Proceed to Login
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Terms Modal */}
//       {showTermsModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="relative mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
//             <button
//               onClick={closeTermsModal}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-6 w-6"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </button>

//             <h2 className="text-2xl font-bold text-gray-900 mb-4">
//               SkillPassport.AI – Terms &amp; Conditions
//             </h2>

//             <div className="text-gray-600 space-y-3">
//               <p className="font-medium">By proceeding, I agree that:</p>

//               <ul className="space-y-2 list-disc list-inside">
//                 <li>
//                   I am purchasing lifetime access to
//                   SkillPassport.AI&apos;s verified job portal database
//                 </li>
//                 <li>
//                   This is a digital, non-refundable product, no
//                   cancellations or refunds after purchase
//                 </li>
//                 <li>
//                   Job links may expire or change if companies close
//                   applications or update their career portals
//                 </li>
//                 <li>
//                   Sponsorship availability depends on each company&apos;s
//                   hiring policy at the time of access
//                 </li>
//                 <li>
//                   SkillPassport.AI is not a recruitment agency and does
//                   not guarantee any job or sponsorship
//                 </li>
//                 <li>
//                   I will use the platform only for personal job search
//                   purposes
//                 </li>
//               </ul>

//               <div className="pt-4 mt-4 border-t border-gray-200">
//                 <button
//                   onClick={closeTermsModal}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SignupPage;






























// // src/pages/SignupPage.tsx
// import React, { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { supabase } from "../integrations/supabase/client";
// import {
//   PayPalScriptProvider,
//   PayPalButtons,
// } from "@paypal/react-paypal-js";

// type Step = "form" | "payment" | "success";

// interface UsersByFormRow {
//   id: string;
//   full_name: string;
//   email: string;
//   phone: string | null;
//   country_code: string | null;
//   promo_code: string | null;
//   payment_status: string | null;
//   amount: number | null;
//   currency: string | null;
//   paypal_order_id: string | null;
//   paypal_capture_id: string | null;
//   user_id: string | null;
// }

// const STORAGE_KEY = "signup_payment_state_v1";

// const SignupPage: React.FC = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Plan info from landing (amount + currency)
//   const state = (location.state || {}) as {
//     plan?: "US" | "UK";
//     amount?: number;
//     currency?: string;
//   };

//   const [plan, setPlan] = useState<"US" | "UK">(state.plan ?? "US");
//   const [amount, setAmount] = useState<number>(state.amount ?? 12.99);
//   const [currency, setCurrency] = useState<string>(state.currency ?? "USD");

//   const [step, setStep] = useState<Step>("form");
//   const [form, setForm] = useState({
//     fullName: "",
//     countryCode: "",
//     phone: "",
//     email: "",
//     promoCode: "",
//   });

//   const [agreedToTerms, setAgreedToTerms] = useState(false);
//   const [showTermsModal, setShowTermsModal] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [loadingForm, setLoadingForm] = useState(false);

//   const [formRow, setFormRow] = useState<UsersByFormRow | null>(null);
//   const [paymentLoading, setPaymentLoading] = useState(false);
//   const [paymentError, setPaymentError] = useState<string | null>(null);

//   const [successInfo, setSuccessInfo] = useState<{
//     transactionId: string;
//     amount: number;
//     currency: string;
//   } | null>(null);

//   // env variables (Vite: must be prefixed with VITE_)
//   const PAYPAL_CLIENT_ID = import.meta.env
//     .VITE_PAYPAL_CLIENT_ID as string | undefined;

//   // restore payment step from localStorage (if user refreshed on payment page)
//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     try {
//       const raw = localStorage.getItem(STORAGE_KEY);
//       if (!raw) return;

//       const saved = JSON.parse(raw) as {
//         step?: Step;
//         formRowId?: string;
//         form?: typeof form;
//         plan?: "US" | "UK";
//         amount?: number;
//         currency?: string;
//       };

//       if (saved.step === "payment" && saved.formRowId && saved.form) {
//         // restore plan/amount/currency + form + payment step
//         setPlan(saved.plan ?? plan);
//         setAmount(saved.amount ?? amount);
//         setCurrency(saved.currency ?? currency);
//         setForm(saved.form);
//         setStep("payment");

//         // minimal formRow; we only really need id for updates
//         setFormRow({
//           id: saved.formRowId,
//           full_name: saved.form.fullName,
//           email: saved.form.email,
//           phone: saved.form.phone || null,
//           country_code: saved.form.countryCode || null,
//           promo_code: saved.form.promoCode || null,
//           payment_status: "pending",
//           amount: saved.amount ?? amount,
//           currency: saved.currency ?? currency,
//           paypal_order_id: null,
//           paypal_capture_id: null,
//           user_id: null,
//         });
//       }
//     } catch (e) {
//       console.error("Error restoring payment state from localStorage:", e);
//     }
//   }, []); // run once on mount

//   // debug in dev so you can confirm the env is present
//   if (import.meta.env.DEV) {
//     // eslint-disable-next-line no-console
//     console.debug("SignupPage env:", {
//       PAYPAL_CLIENT_ID: PAYPAL_CLIENT_ID ? "[present]" : "[missing]",
//     });
//   }

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setAgreedToTerms(e.target.checked);
//   };

//   const openTermsModal = () => setShowTermsModal(true);
//   const closeTermsModal = () => setShowTermsModal(false);

//   // 1️⃣ Form submit → create users_by_form row (payment pending), then show PayPal
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setLoadingForm(true);

//     if (
//       !form.fullName.trim() ||
//       !form.email.trim() ||
//       !form.phone.trim() ||
//       !form.countryCode
//     ) {
//       setError("Please fill in all required fields");
//       setLoadingForm(false);
//       return;
//     }

//     try {
//       const fullName = form.fullName.trim();
//       const email = form.email.trim().toLowerCase();
//       const phone = form.phone.trim();
//       const countryCode = form.countryCode;
//       const promoCode = form.promoCode.trim() || null;

//       // Insert into users_by_form with payment pending
//       const { data, error: insertError } = await supabase
//         .from("users_by_form")
//         .insert([
//           {
//             user_id: null, // will set after payment + auth user creation (if needed)
//             full_name: fullName,
//             email,
//             phone,
//             country_code: countryCode,
//             promo_code: promoCode,
//             payment_status: "pending",
//             amount,
//             currency,
//           },
//         ])
//         .select()
//         .single();

//       if (insertError) {
//         console.error("❌ users_by_form insert error:", insertError);
//         throw insertError;
//       }

//       const insertedRow = data as UsersByFormRow;
//       setFormRow(insertedRow);
//       setStep("payment");

//       // persist payment step so refresh doesn't send them back to form
//       if (typeof window !== "undefined") {
//         localStorage.setItem(
//           STORAGE_KEY,
//           JSON.stringify({
//             step: "payment",
//             formRowId: insertedRow.id,
//             form,
//             plan,
//             amount,
//             currency,
//           })
//         );
//       }
//     } catch (err: any) {
//       console.error("❌ Signup form error:", err);
//       setError(err?.message || "Something went wrong. Please try again.");
//     } finally {
//       setLoadingForm(false);
//     }
//   };

//   // 2️⃣ Payment success handler: update users_by_form + create auth user + send email
//   const handlePaymentSuccess = async (params: {
//     orderId: string;
//     captureId: string | null;
//   }) => {
//     try {
//       if (!formRow) {
//         console.error("No formRow in state; cannot link payment.");
//         return;
//       }

//       setPaymentLoading(true);
//       setPaymentError(null);

//       const fullName = form.fullName.trim();
//       const email = form.email.trim().toLowerCase();
//       const phone = form.phone.trim();
//       const firstName =
//         fullName.split(" ").filter(Boolean)[0] || "user";
//       const password = `${firstName}@123`;

//       // 2.1 Update users_by_form with payment success + PayPal IDs
//       const { error: updateError } = await supabase
//         .from("users_by_form")
//         .update({
//           payment_status: "success",
//           amount,
//           currency,
//           paypal_order_id: params.orderId,
//           paypal_capture_id: params.captureId,
//         })
//         .eq("id", formRow.id);

//       if (updateError) {
//         console.error("❌ Update users_by_form payment error:", updateError);
//         throw updateError;
//       }

//       // 2.2 Create auth user in auth.users
//       // users_by_form can have duplicates, auth.users cannot
//       let userId: string | null = null;

//       const { data: signUpData, error: signUpError } =
//         await supabase.auth.signUp({
//           email,
//           password,
//           phone: phone || undefined,
//         });

//       if (signUpError) {
//         // if the user already exists in auth, do NOT treat as fatal
//         const msg = signUpError.message || "";
//         if (msg.toLowerCase().includes("user already registered")) {
//           console.warn(
//             "User already exists in auth.users, skipping signUp but continuing flow."
//           );
//           // we don't know their user_id from client (no admin access), so we skip attaching user_id
//           userId = null;
//         } else {
//           console.error("❌ auth.signUp error:", signUpError);
//           throw signUpError;
//         }
//       } else {
//         userId = signUpData.user?.id ?? null;
//       }

//       // 2.3 Attach user_id to users_by_form row if we have it
//       if (userId) {
//         const { error: attachError } = await supabase
//           .from("users_by_form")
//           .update({ user_id: userId })
//           .eq("id", formRow.id);

//         if (attachError) {
//           console.error("❌ users_by_form attach user_id error:", attachError);
//           // not fatal, just log
//         }
//       }

//       // 2.4 Invoke Edge Function to send credentials email (best-effort)
//       // Only send if we successfully created a new user (userId present)
//       if (userId) {
//         try {
//           await supabase.functions.invoke("send-credentials-email", {
//             body: {
//               email,
//               full_name: fullName,
//               password,
//               login_url: "https://your-domain.com/auth", // <-- change to your real login URL
//             },
//           });
//         } catch (emailErr) {
//           console.error("⚠️ Error sending credentials email:", emailErr);
//           // don't block success; just log
//         }
//       }

//       // 2.5 Clear persisted payment state (we're done with this flow)
//       if (typeof window !== "undefined") {
//         localStorage.removeItem(STORAGE_KEY);
//       }

//       // 2.6 Show success card
//       setSuccessInfo({
//         transactionId: params.captureId || params.orderId,
//         amount,
//         currency,
//       });
//       setStep("success");
//     } catch (err: any) {
//       console.error("❌ handlePaymentSuccess error:", err);
//       setPaymentError(
//         err?.message || "Payment succeeded but we had an internal error."
//       );
//     } finally {
//       setPaymentLoading(false);
//     }
//   };

//   const amountDisplay =
//     currency === "GBP"
//       ? `£${amount.toFixed(2)}`
//       : currency === "EUR"
//       ? `€${amount.toFixed(2)}`
//       : `$${amount.toFixed(2)}`;

//   return (
//     <div className="min-h-screen bg-white text-gray-900">
//       {/* Top back button */}
//       <div className="mx-auto w-full max-w-5xl px-4 pt-6">
//         <button
//           onClick={() => navigate("/")}
//           className="group inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
//         >
//           <svg
//             className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
//             viewBox="0 0 20 20"
//             fill="currentColor"
//           >
//             <path
//               fillRule="evenodd"
//               d="M12.293 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 9H17a1 1 0 110 2H8.414l3.879 3.879a1 1 0 010 1.414z"
//               clipRule="evenodd"
//             />
//           </svg>
//           Back to home
//         </button>
//       </div>

//       <div className="mx-auto mt-8 w-full max-w-3xl px-4 pb-12">
//         <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
//           <div className="p-8 sm:p-12">
//             <h1 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">
//               Create your account
//             </h1>
//             <p className="mt-3 text-center text-base text-gray-500">
//               You will be charged{" "}
//               <span className="font-semibold">{amountDisplay}</span> (
//               {plan === "UK" ? "UK plan" : "US plan"})
//             </p>

//             {/* STEP 1: FORM */}
//             {step === "form" && (
//               <form
//                 onSubmit={handleSubmit}
//                 className="mx-auto mt-10 max-w-2xl space-y-6"
//               >
//                 <div className="space-y-2">
//                   <label
//                     htmlFor="fullName"
//                     className="text-sm font-medium text-gray-700"
//                   >
//                     Full Name *
//                   </label>
//                   <input
//                     id="fullName"
//                     name="fullName"
//                     value={form.fullName}
//                     onChange={handleChange}
//                     placeholder="Enter your full name"
//                     required
//                     className="w-full rounded-xl border border-transparent bg-indigo-50/60 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none ring-1 ring-indigo-100 focus:ring-2 focus:ring-indigo-300"
//                   />
//                 </div>

//                 <div className="grid grid-cols-3 gap-4">
//                   <div className="col-span-1 space-y-2">
//                     <label
//                       htmlFor="countryCode"
//                       className="text-sm font-medium text-gray-700"
//                     >
//                       Country Code *
//                     </label>
//                     <select
//                       id="countryCode"
//                       name="countryCode"
//                       value={form.countryCode}
//                       onChange={handleChange}
//                       required
//                       className="w-full rounded-xl border border-transparent bg-indigo-50/60 px-4 py-3 text-gray-900 outline-none ring-1 ring-indigo-100 focus:ring-2 focus:ring-indigo-300"
//                     >
//                       <option value="">Code</option>
//                       <option value="+1">+1 (US)</option>
//                       <option value="+44">+44 (UK)</option>
//                       <option value="+91">+91 (India)</option>
//                     </select>
//                   </div>
//                   <div className="col-span-2 space-y-2">
//                     <label
//                       htmlFor="phone"
//                       className="text-sm font-medium text-gray-700"
//                     >
//                       Phone Number *
//                     </label>
//                     <input
//                       id="phone"
//                       name="phone"
//                       type="tel"
//                       value={form.phone}
//                       onChange={handleChange}
//                       placeholder="Enter phone number"
//                       required
//                       className="w-full rounded-xl border border-transparent bg-indigo-50/60 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none ring-1 ring-indigo-100 focus:ring-2 focus:ring-indigo-300"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label
//                     htmlFor="email"
//                     className="text-sm font-medium text-gray-700"
//                   >
//                     Email ID *
//                   </label>
//                   <input
//                     id="email"
//                     name="email"
//                     type="email"
//                     value={form.email}
//                     onChange={handleChange}
//                     placeholder="Enter your email"
//                     required
//                     className="w-full rounded-xl border border-transparent bg-indigo-50/60 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none ring-1 ring-indigo-100 focus:ring-2 focus:ring-indigo-300"
//                   />
//                 </div>

//                 {/* Terms checkbox */}
//                 <div className="space-y-2">
//                   <div className="flex items-start">
//                     <div className="flex items-center h-5 mt-1">
//                       <input
//                         id="terms"
//                         name="terms"
//                         type="checkbox"
//                         checked={agreedToTerms}
//                         onChange={handleTermsChange}
//                         className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
//                       />
//                     </div>
//                     <div className="ml-3 text-sm">
//                       <label
//                         htmlFor="terms"
//                         className="font-medium text-gray-700"
//                       >
//                         I agree to the{" "}
//                         <button
//                           type="button"
//                           onClick={openTermsModal}
//                           className="text-blue-600 hover:underline"
//                         >
//                           Terms &amp; Conditions
//                         </button>
//                       </label>
//                     </div>
//                   </div>
//                 </div>

//                 {error && (
//                   <div className="rounded-lg bg-red-50 p-4 border border-red-200">
//                     <p className="text-sm text-red-700">{error}</p>
//                   </div>
//                 )}

//                 <button
//                   type="submit"
//                   disabled={loadingForm || !agreedToTerms}
//                   className={`w-full rounded-xl px-6 py-3 text-lg font-semibold text-white shadow-lg hover:scale-[1.01] transition-transform focus:ring-4 focus:ring-blue-300 disabled:opacity-70 disabled:cursor-not-allowed ${
//                     agreedToTerms
//                       ? "bg-gradient-to-r from-blue-800 to-purple-800 hover:from-blue-700 hover:to-purple-700"
//                       : "bg-gradient-to-r from-blue-600 to-purple-600"
//                   }`}
//                 >
//                   {loadingForm ? "Creating record..." : "Proceed to Payment"}
//                 </button>
//               </form>
//             )}

//             {/* STEP 2: PAYMENT (shown after form row created) */}
//             {step === "payment" && (
//               <div className="mt-10 space-y-6">
//                 <h2 className="text-xl font-semibold text-gray-900 text-center">
//                   Complete your payment ({amountDisplay})
//                 </h2>

//                 {!PAYPAL_CLIENT_ID && (
//                   <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
//                     PayPal is not configured. Set VITE_PAYPAL_CLIENT_ID in your
//                     .env file.
//                   </div>
//                 )}

//                 {PAYPAL_CLIENT_ID && formRow && (
//                   <PayPalScriptProvider
//                     options={{
//                       // clientId is required by ReactPayPalScriptOptions type
//                       clientId: PAYPAL_CLIENT_ID,
//                       intent: "capture",
//                       currency,
//                     }}
//                   >
//                     <div className="max-w-md mx-auto border rounded-xl p-4 shadow-sm bg-gray-50">
//                       {paymentError && (
//                         <div className="mb-3 rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
//                           {paymentError}
//                         </div>
//                       )}

//                       <PayPalButtons
//                         style={{ layout: "vertical" }}
//                         disabled={paymentLoading}
//                         // force re-render when amount or currency changes
//                         forceReRender={[amount, currency]}
//                         createOrder={(_, actions) => {
//                           // Use PayPal's client-side create; no Supabase edge function needed
//                           return actions.order.create({
//                             purchase_units: [
//                               {
//                                 amount: {
//                                   value: amount.toFixed(2),
//                                   currency_code: currency,
//                                 },
//                                 // link this order back to your users_by_form row
//                                 custom_id: formRow.id,
//                               },
//                             ],
//                             application_context: {
//                               shipping_preference: "NO_SHIPPING",
//                             },
//                           });
//                         }}
//                         onApprove={async (data, actions) => {
//                           if (!actions.order) {
//                             throw new Error("actions.order is not available");
//                           }

//                           setPaymentLoading(true);
//                           setPaymentError(null);

//                           try {
//                             const captureResult = await actions.order.capture();

//                             const orderId = data.orderID;
//                             const captureId =
//                               captureResult?.purchase_units?.[0]?.payments
//                                 ?.captures?.[0]?.id ??
//                               captureResult?.id ??
//                               null;

//                             // Now handle local success flow (Supabase updates + email)
//                             await handlePaymentSuccess({
//                               orderId,
//                               captureId,
//                             });
//                           } catch (err: any) {
//                             console.error("onApprove error:", err);
//                             setPaymentError(
//                               err?.message ||
//                                 "Something went wrong while capturing payment."
//                             );
//                           } finally {
//                             setPaymentLoading(false);
//                           }
//                         }}
//                         onError={(err) => {
//                           console.error("PayPal onError:", err);
//                           setPaymentError(
//                             `Payment could not be started. ${
//                               (err as any)?.message
//                                 ? (err as any).message
//                                 : "Please try again."
//                             }`
//                           );
//                         }}
//                       />
//                     </div>
//                   </PayPalScriptProvider>
//                 )}
//               </div>
//             )}

//             {/* STEP 3: SUCCESS CARD */}
//             {step === "success" && successInfo && (
//               <div className="mt-10 max-w-xl mx-auto rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm">
//                 <h2 className="text-xl font-bold text-green-800 mb-2">
//                   Payment Successful 🎉
//                 </h2>
//                 <p className="text-green-900 mb-4">
//                   Your payment of{" "}
//                   <span className="font-semibold">
//                     {amountDisplay}
//                   </span>{" "}
//                   was completed successfully.
//                 </p>
//                 <div className="space-y-2 text-sm text-green-900">
//                   <div className="flex justify-between">
//                     <span className="font-medium">
//                       Transaction / Capture ID:
//                     </span>
//                     <span className="font-mono">
//                       {successInfo.transactionId}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="font-medium">Amount:</span>
//                     <span>{amountDisplay}</span>
//                   </div>
//                 </div>
//                 <p className="mt-4 text-sm text-green-900">
//                   We’ve also created your account (if it didn’t already exist)
//                   and emailed your login credentials.
//                 </p>
//                 <button
//                   onClick={() => navigate("/auth")}
//                   className="mt-6 w-full rounded-lg bg-green-700 px-4 py-2 text-white font-semibold hover:bg-green-800"
//                 >
//                   Proceed to Login
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Terms Modal */}
//       {showTermsModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="relative mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
//             <button
//               onClick={closeTermsModal}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-6 w-6"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M6 18L18 6M6 6l12 12"
//                 />
//               </svg>
//             </button>

//             <h2 className="text-2xl font-bold text-gray-900 mb-4">
//               SkillPassport.AI – Terms &amp; Conditions
//             </h2>

//             <div className="text-gray-600 space-y-3">
//               <p className="font-medium">By proceeding, I agree that:</p>

//               <ul className="space-y-2 list-disc list-inside">
//                 <li>
//                   I am purchasing lifetime access to
//                   SkillPassport.AI&apos;s verified job portal database
//                 </li>
//                 <li>
//                   This is a digital, non-refundable product, no
//                   cancellations or refunds after purchase
//                 </li>
//                 <li>
//                   Job links may expire or change if companies close
//                   applications or update their career portals
//                 </li>
//                 <li>
//                   Sponsorship availability depends on each company&apos;s
//                   hiring policy at the time of access
//                 </li>
//                 <li>
//                   SkillPassport.AI is not a recruitment agency and does
//                   not guarantee any job or sponsorship
//                 </li>
//                 <li>
//                   I will use the platform only for personal job search
//                   purposes
//                 </li>
//               </ul>

//               <div className="pt-4 mt-4 border-t border-gray-200">
//                 <button
//                   onClick={closeTermsModal}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SignupPage;














// src/pages/SignupPage.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import {
  PayPalScriptProvider,
  PayPalButtons,
} from "@paypal/react-paypal-js";

type Step = "form" | "payment" | "success";

interface UsersByFormRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country_code: string | null;
  promo_code: string | null;
  payment_status: string | null;
  amount: number | null;
  currency: string | null;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  user_id: string | null;
}

const STORAGE_KEY = "signup_payment_state_v1";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Plan info from landing (amount + currency)
  const state = (location.state || {}) as {
    plan?: "US" | "UK";
    amount?: number;
    currency?: string;
  };

  const [plan, setPlan] = useState<"US" | "UK">(state.plan ?? "US");
  const [amount, setAmount] = useState<number>(state.amount ?? 12.99);
  const [currency, setCurrency] = useState<string>(state.currency ?? "USD");

  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState({
    fullName: "",
    countryCode: "",
    phone: "",
    email: "",
    promoCode: "",
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingForm, setLoadingForm] = useState(false);

  const [formRow, setFormRow] = useState<UsersByFormRow | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [successInfo, setSuccessInfo] = useState<{
    transactionId: string;
    amount: number;
    currency: string;
  } | null>(null);

  // PayPal client id (public, fine in Vite env)
  const PAYPAL_CLIENT_ID = import.meta.env
    .VITE_PAYPAL_CLIENT_ID as string | undefined;

  // 🔁 Restore "payment" step on refresh (from localStorage)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw) as {
        step?: Step;
        formRowId?: string;
        form?: typeof form;
        plan?: "US" | "UK";
        amount?: number;
        currency?: string;
      };

      if (saved.step === "payment" && saved.formRowId && saved.form) {
        setPlan(saved.plan ?? plan);
        setAmount(saved.amount ?? amount);
        setCurrency(saved.currency ?? currency);
        setForm(saved.form);
        setStep("payment");

        setFormRow({
          id: saved.formRowId,
          full_name: saved.form.fullName,
          email: saved.form.email,
          phone: saved.form.phone || null,
          country_code: saved.form.countryCode || null,
          promo_code: saved.form.promoCode || null,
          payment_status: "pending",
          amount: saved.amount ?? amount,
          currency: saved.currency ?? currency,
          paypal_order_id: null,
          paypal_capture_id: null,
          user_id: null,
        });
      }
    } catch (e) {
      console.error("Error restoring payment state from localStorage:", e);
    }
  }, []); // run once on mount

  // Debug envs in dev
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("SignupPage env:", {
      PAYPAL_CLIENT_ID: PAYPAL_CLIENT_ID ? "[present]" : "[missing]",
    });
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgreedToTerms(e.target.checked);
  };

  const openTermsModal = () => setShowTermsModal(true);
  const closeTermsModal = () => setShowTermsModal(false);

  // 1️⃣ Form submit → create users_by_form row (payment pending), then show PayPal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingForm(true);

    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.countryCode
    ) {
      setError("Please fill in all required fields");
      setLoadingForm(false);
      return;
    }

    try {
      const fullName = form.fullName.trim();
      const email = form.email.trim().toLowerCase();
      const phone = form.phone.trim();
      const countryCode = form.countryCode;
      const promoCode = form.promoCode.trim() || null;

      // Insert into users_by_form with payment pending
      const { data, error: insertError } = await supabase
        .from("users_by_form")
        .insert([
          {
            user_id: null,
            full_name: fullName,
            email,
            phone,
            country_code: countryCode,
            promo_code: promoCode,
            payment_status: "pending",
            amount,
            currency,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("❌ users_by_form insert error:", insertError);
        throw insertError;
      }

      const insertedRow = data as UsersByFormRow;
      setFormRow(insertedRow);
      setStep("payment");

      // Persist payment step so refresh stays on payment page
      if (typeof window !== "undefined") {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            step: "payment",
            form,
            formRowId: insertedRow.id,
            plan,
            amount,
            currency,
          })
        );
      }
    } catch (err: any) {
      console.error("❌ Signup form error:", err);
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoadingForm(false);
    }
  };

  // 2️⃣ Payment success handler: update users_by_form + create auth user + send email
  const handlePaymentSuccess = async (params: {
    orderId: string;
    captureId: string | null;
  }) => {
    try {
      if (!formRow) {
        console.error("No formRow in state; cannot link payment.");
        return;
      }

      setPaymentLoading(true);
      setPaymentError(null);

      const fullName = form.fullName.trim();
      const email = form.email.trim().toLowerCase();
      const phone = form.phone.trim();
      const firstName =
        fullName.split(" ").filter(Boolean)[0] || "user";
      const password = `${firstName}@123`;

      // 2.1 Update users_by_form with payment success + PayPal IDs
      const { error: updateError } = await supabase
        .from("users_by_form")
        .update({
          payment_status: "success",
          amount,
          currency,
          paypal_order_id: params.orderId,
          paypal_capture_id: params.captureId,
        })
        .eq("id", formRow.id);

      if (updateError) {
        console.error("❌ Update users_by_form payment error:", updateError);
        throw updateError;
      }

      // 2.2 Create auth user (auth.users) — allow duplicates in users_by_form but NOT here
      let userId: string | null = null;

      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          phone: phone || undefined,
        });

      if (signUpError) {
        const msg = signUpError.message || "";
        // If user already exists in auth, treat as non-fatal and continue
        if (msg.toLowerCase().includes("user already registered")) {
          console.warn(
            "User already exists in auth.users, skipping signUp but continuing flow."
          );
          userId = null;
        } else {
          console.error("❌ auth.signUp error:", signUpError);
          throw signUpError;
        }
      } else {
        userId = signUpData.user?.id ?? null;
      }

      // 2.3 Attach user_id to users_by_form row if we have it
      if (userId) {
        const { error: attachError } = await supabase
          .from("users_by_form")
          .update({ user_id: userId })
          .eq("id", formRow.id);

        if (attachError) {
          console.error("❌ users_by_form attach user_id error:", attachError);
          // not fatal; just log
        }

        // 🟢 NEW: Insert into payment_details to trigger credit grant
        // First, ensure profile exists (in case trigger didn't fire yet)
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .single();

        if (!profileData) {
          // Manually create profile if missing
          await supabase.from("profiles").insert([
            {
              id: userId,
              email,
              plan_tier: "free",
              plan_status: "active",
              credits_remaining: 0, // Will be +3'd by trigger
            },
          ]);
        }

        // Now insert payment record
        const nowIso = new Date().toISOString();
        const { error: payError } = await supabase.from("payment_details").insert([
          {
            user_id: userId,
            email,
            amount,
            currency,
            amount_paid_usd: currency === "USD" ? amount : null,
            status: "completed",
            capture_status: "COMPLETED",
            paypal_order_id: params.orderId,
            paypal_capture_id: params.captureId,
            transaction_id: params.captureId || params.orderId,
            payment_mode: "paypal",
            created_at: nowIso,
            finished_at: nowIso,
            metadata: {
              plan: "initial_signup",
              source: "signup_flow",
            },
          },
        ]);

        if (payError) {
          if (payError.code === "23505") {
            console.warn("Payment already recorded (duplicate). Skipping insertion.");
          } else {
            console.error("❌ payment_details insert error:", payError);
          }
        } else {
          console.log("✅ payment_details inserted, credits should be granted.");
        }
      }

      // 2.4 Call Edge Function to send credentials email (best-effort)
      // Only send if we successfully created a new user (userId present)
      if (userId) {
        try {
          const { data: fnData, error: fnError } =
            await supabase.functions.invoke("send-credentials-email", {
              body: {
                email,
                full_name: fullName,
                password, // firstName@123
                login_url: "http://localhost:5173/auth", // or your live URL
                transaction_id: params.captureId || params.orderId,
                amount,
                currency,
              },
            });

          if (fnError) {
            console.error(
              "❌ send-credentials-email function error:",
              fnError
            );
          } else {
            console.log("✅ send-credentials-email success:", fnData);
          }
        } catch (emailErr) {
          console.error(
            "⚠️ Error calling send-credentials-email:",
            emailErr
          );
        }
      }

      // 2.5 Clear persisted payment state (flow completed)
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }

      // 2.6 Show success card
      setSuccessInfo({
        transactionId: params.captureId || params.orderId,
        amount,
        currency,
      });
      setStep("success");
    } catch (err: any) {
      console.error("❌ handlePaymentSuccess error:", err);
      setPaymentError(
        err?.message || "Payment succeeded but we had an internal error."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const amountDisplay =
    currency === "GBP"
      ? `£${amount.toFixed(2)}`
      : currency === "EUR"
        ? `€${amount.toFixed(2)}`
        : `$${amount.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top back button */}
      <div className="mx-auto w-full max-w-5xl px-4 pt-6">
        <button
          onClick={() => navigate("/")}
          className="group inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <svg
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.293 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 9H17a1 1 0 110 2H8.414l3.879 3.879a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to home
        </button>
      </div>

      <div className="mx-auto mt-8 w-full max-w-3xl px-4 pb-12">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
          <div className="p-8 sm:p-12">
            <h1 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">
              Create your account
            </h1>
            <p className="mt-3 text-center text-base text-gray-500">
              You will be charged{" "}
              <span className="font-semibold">{amountDisplay}</span> (
              {plan === "UK" ? "UK plan" : "US plan"})
            </p>

            {/* STEP 1: FORM */}
            {step === "form" && (
              <form
                onSubmit={handleSubmit}
                className="mx-auto mt-10 max-w-2xl space-y-6"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="fullName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full rounded-xl border border-transparent bg-indigo-50/60 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none ring-1 ring-indigo-100 focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 space-y-2">
                    <label
                      htmlFor="countryCode"
                      className="text-sm font-medium text-gray-700"
                    >
                      Country Code *
                    </label>
                    <select
                      id="countryCode"
                      name="countryCode"
                      value={form.countryCode}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-transparent bg-indigo-50/60 px-4 py-3 text-gray-900 outline-none ring-1 ring-indigo-100 focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="">Code</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+91">+91 (India)</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700"
                    >
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      required
                      className="w-full rounded-xl border border-transparent bg-indigo-50/60 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none ring-1 ring-indigo-100 focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email ID *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-xl border border-transparent bg-indigo-50/60 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none ring-1 ring-indigo-100 focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                {/* Terms checkbox */}
                <div className="space-y-2">
                  <div className="flex items-start">
                    <div className="flex items-center h-5 mt-1">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={handleTermsChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="terms"
                        className="font-medium text-gray-700"
                      >
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={openTermsModal}
                          className="text-blue-600 hover:underline"
                        >
                          Terms &amp; Conditions
                        </button>
                      </label>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loadingForm || !agreedToTerms}
                  className={`w-full rounded-xl px-6 py-3 text-lg font-semibold text-white shadow-lg hover:scale-[1.01] transition-transform focus:ring-4 focus:ring-blue-300 disabled:opacity-70 disabled:cursor-not-allowed ${agreedToTerms
                    ? "bg-gradient-to-r from-blue-800 to-purple-800 hover:from-blue-700 hover:to-purple-700"
                    : "bg-gradient-to-r from-blue-600 to-purple-600"
                    }`}
                >
                  {loadingForm ? "Creating record..." : "Proceed to Payment"}
                </button>
              </form>
            )}

            {/* STEP 2: PAYMENT */}
            {step === "payment" && (
              <div className="mt-10 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 text-center">
                  Complete your payment ({amountDisplay})
                </h2>

                {!PAYPAL_CLIENT_ID && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    PayPal is not configured. Set VITE_PAYPAL_CLIENT_ID in your
                    .env file.
                  </div>
                )}

                {PAYPAL_CLIENT_ID && formRow && (
                  <PayPalScriptProvider
                    options={{
                      clientId: PAYPAL_CLIENT_ID,
                      intent: "capture",
                      currency,
                    }}
                  >
                    <div className="max-w-md mx-auto border rounded-xl p-4 shadow-sm bg-gray-50">
                      {paymentError && (
                        <div className="mb-3 rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                          {paymentError}
                        </div>
                      )}

                      <PayPalButtons
                        style={{ layout: "vertical" }}
                        disabled={paymentLoading}
                        forceReRender={[amount, currency]}
                        createOrder={(_, actions) => {
                          return actions.order.create({
                            purchase_units: [
                              {
                                amount: {
                                  value: amount.toFixed(2),
                                  currency_code: currency,
                                },
                                custom_id: formRow.id,
                              },
                            ],
                            application_context: {
                              shipping_preference: "NO_SHIPPING",
                            },
                            intent: "CAPTURE"
                          });
                        }}
                        onApprove={async (data, actions) => {
                          if (!actions.order) {
                            throw new Error("actions.order is not available");
                          }

                          setPaymentLoading(true);
                          setPaymentError(null);

                          try {
                            const captureResult = await actions.order.capture();

                            const orderId = data.orderID;
                            const captureId =
                              captureResult?.purchase_units?.[0]?.payments
                                ?.captures?.[0]?.id ??
                              captureResult?.id ??
                              null;

                            await handlePaymentSuccess({
                              orderId,
                              captureId,
                            });
                          } catch (err: any) {
                            console.error("onApprove error:", err);
                            setPaymentError(
                              err?.message ||
                              "Something went wrong while capturing payment."
                            );
                          } finally {
                            setPaymentLoading(false);
                          }
                        }}
                        onError={(err) => {
                          console.error("PayPal onError:", err);
                          setPaymentError(
                            `Payment could not be started. ${(err as any)?.message
                              ? (err as any).message
                              : "Please try again."
                            }`
                          );
                        }}
                      />
                    </div>
                  </PayPalScriptProvider>
                )}
              </div>
            )}

            {/* STEP 3: SUCCESS CARD */}
            {step === "success" && successInfo && (
              <div className="mt-10 max-w-xl mx-auto rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-green-800 mb-2">
                  Payment Successful 🎉
                </h2>
                <p className="text-green-900 mb-4">
                  Your payment of{" "}
                  <span className="font-semibold"><u>{amountDisplay}</u></span> was
                  completed successfully.
                </p>
                <div className="space-y-2 text-sm text-green-900">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      Transaction / Capture ID:
                    </span>
                    <span className="font-mono">
                      {successInfo.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span><u>{amountDisplay}</u></span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-green-900">
                  We’ve also created your account (if it didn’t already exist)
                  and emailed your login credentials.<br />
                  <b>NOTE: </b>Check your <b>spam</b> folder if you don’t see the email in inbox.
                </p>
                <button
                  onClick={() => navigate("/auth")}
                  className="mt-6 w-full rounded-lg bg-green-700 px-4 py-2 text-white font-semibold hover:bg-green-800"
                >
                  Proceed to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
            <button
              onClick={closeTermsModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              NetworkNote – Terms &amp; Conditions
            </h2>

            <div className="text-gray-600 space-y-3">
              <p className="font-medium">By proceeding, I agree that:</p>

              <ul className="space-y-2 list-disc list-inside">
                <li>
                  I am purchasing lifetime access to
                  NetworkNote&apos;s verified job portal database
                </li>
                <li>
                  This is a digital, non-refundable product, no
                  cancellations or refunds after purchase
                </li>
                <li>
                  Job links may expire or change if companies close
                  applications or update their career portals
                </li>
                <li>
                  Sponsorship availability depends on each company&apos;s
                  hiring policy at the time of access
                </li>
                <li>
                  NetworkNote is not a recruitment agency and does
                  not guarantee any job or sponsorship
                </li>
                <li>
                  I will use the platform only for personal job search
                  purposes
                </li>
              </ul>

              <div className="pt-4 mt-4 border-t border-gray-200">
                <button
                  onClick={closeTermsModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;

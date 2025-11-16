// src/pages/Billing.tsx
/* Full component code — same as supplied previously */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { CreditCard, Check, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import {
  PayPalScriptProvider,
  PayPalButtons,
  PayPalHostedFieldsProvider,
  PayPalHostedField,
  usePayPalHostedFields,
} from '@paypal/react-paypal-js';

interface PaymentDetail {
  id: string;
  user_id: string;
  amount: number;
  amount_paid_usd?: number | null;
  currency: string;
  status: 'created' | 'pending' | 'completed' | 'failed';
  transaction_id: string | null;
  paypal_order_id?: string | null;
  paypal_capture_id?: string | null;
  payer_email?: string | null;
  payment_mode?: string | null;
  created_at: string;
  finished_at?: string | null;
}

type ProfilePlan = {
  plan_tier: string | null;
  plan_status: string | null;
  plan_started_at: string | null;
  plan_renews_at: string | null;
};

export default function Billing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshPaymentsFlag, setRefreshPaymentsFlag] = useState(0);

  const [clientToken, setClientToken] = useState<string | null>(null);
  const [hfEligible, setHfEligible] = useState<boolean | null>(null);

  const [profilePlan, setProfilePlan] = useState<ProfilePlan | null>(null);

  const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string | undefined;
  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  const handleLogout = () => navigate('/');

  // ===== Fetch profile plan (to compute current plan + expiry) =====
  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('plan_tier, plan_status, plan_started_at, plan_renews_at')
        .eq('id', user.id)
        .single();
      if (!error) setProfilePlan(data as ProfilePlan);
    })();
  }, [user, refreshPaymentsFlag]);

  const isPremiumActive =
    profilePlan?.plan_tier === 'premium' &&
    profilePlan?.plan_status === 'active' &&
    !!profilePlan?.plan_renews_at &&
    new Date(profilePlan.plan_renews_at) > new Date();

  // ===== Fetch client token for Hosted Fields =====
  useEffect(() => {
    (async () => {
      console.log('Attempting to fetch client token...');
      console.log('FUNCTIONS_URL:', FUNCTIONS_URL);
      console.log('SUPABASE_ANON_KEY exists:', !!SUPABASE_ANON_KEY);
      if (!FUNCTIONS_URL || !SUPABASE_ANON_KEY) {
        console.log('Missing FUNCTIONS_URL or SUPABASE_ANON_KEY');
        return;
      }
      try {
        const res = await fetch(`${FUNCTIONS_URL}/generate-client-token`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
          },
        });
        const json = await res.json();
        console.log('Client token response:', res.status, json);
        if (res.ok && json.clientToken) {
          setClientToken(json.clientToken);
          console.log('Client token set successfully');
        } else {
          console.error('Failed to get client token:', json);
        }
      } catch (e) {
        console.error('Client token fetch error:', e);
      }
    })();
  }, [FUNCTIONS_URL, SUPABASE_ANON_KEY]);

  // Determine Hosted Fields eligibility once SDK present
  useEffect(() => {
    if (!clientToken) return;

    const checkEligibility = () => {
      try {
        console.log('Checking hosted fields eligibility...');
        const paypal = (window as any)?.paypal;
        console.log('PayPal SDK loaded:', !!paypal);
        if (!paypal) {
          console.log('PayPal SDK not loaded yet, retrying...');
          setTimeout(checkEligibility, 500);
          return;
        }

        console.log('HostedFields available:', !!paypal.HostedFields);
        if (!paypal.HostedFields) {
          console.log('HostedFields not available yet, retrying...');
          setTimeout(checkEligibility, 500);
          return;
        }

        const isEligible =
          typeof paypal.HostedFields.isEligible === 'function'
            ? paypal.HostedFields.isEligible()
            : false;

        console.log('Hosted Fields eligible:', isEligible);
        setHfEligible(!!isEligible);
      } catch (error) {
        console.error('Error checking Hosted Fields eligibility:', error);
        setHfEligible(false);
      }
    };

    checkEligibility();
    const timeoutId = setTimeout(checkEligibility, 1000);
    return () => clearTimeout(timeoutId);
  }, [clientToken]);

  // ===== Payment history =====
  const fetchPaymentHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_details')
        .select(
          'id,user_id,amount,amount_paid_usd,currency,status,transaction_id,paypal_order_id,paypal_capture_id,payer_email,payment_mode,created_at,finished_at',
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) console.error(error);
      setPaymentHistory((data as PaymentDetail[]) || []);
    } catch (err) {
      console.error('Error fetching payment history:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory, refreshPaymentsFlag]);

  // ===== Plans =====
  const plans = [
    {
      key: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['3 CareerCasts per month', 'Basic video recording', 'Standard resume upload', 'Community support'],
      current: !isPremiumActive,
    },
    {
      key: 'premium',
      name: 'Premium',
      price: '$9',
      period: 'month',
      features: [
        'Unlimited CareerCasts',
        'HD video recording',
        'Advanced analytics',
        'Priority support',
        'Custom branding',
      ],
      current: isPremiumActive,
    },
  ];

  const renderMethod = (mode?: string | null) => (!mode ? 'PayPal' : mode === 'paypal' ? 'Wallet (PayPal)' : mode === 'card' ? 'Card' : mode);
  const renderDate = (p: PaymentDetail) => new Date(p.finished_at || p.created_at).toLocaleDateString();
  const renderAmount = (p: PaymentDetail) =>
    `$${Number((p.status === 'completed' && p.amount_paid_usd != null) ? p.amount_paid_usd : p.amount).toFixed(2)} ${p.currency}`;

  // helper to submit hosted fields reliably (tries several API shapes)
  async function submitHostedFields(hostedFields: any, payload: any) {
    try {
      console.log('submitHostedFields: hostedFields object:', hostedFields);
      if (hostedFields && typeof hostedFields.submit === 'function') {
        console.log('Using hostedFields.submit(payload)');
        return await hostedFields.submit(payload);
      }
      if (hostedFields?.cardFields && typeof hostedFields.cardFields.submit === 'function') {
        console.log('Using hostedFields.cardFields.submit(payload)');
        return await hostedFields.cardFields.submit(payload);
      }
      if (hostedFields?.instance && typeof hostedFields.instance.submit === 'function') {
        console.log('Using hostedFields.instance.submit(payload)');
        return await hostedFields.instance.submit(payload);
      }
      if (typeof hostedFields.submitCard === 'function') {
        console.log('Using hostedFields.submitCard(payload)');
        return await hostedFields.submitCard(payload);
      }
      console.error('No supported hostedFields.submit method found. HostedFields:', hostedFields);
      throw new Error('HostedFields API not available (check console logs).');
    } catch (err) {
      console.error('submitHostedFields error:', err);
      throw err;
    }
  }

  // ===== Hosted Fields card form =====
  function CardForm({ onApproved }: { onApproved: () => void }) {
    const hostedFields: any = usePayPalHostedFields();
    const [submitting, setSubmitting] = useState(false);

    const payWithCard = async () => {
      try {
        if (!user) throw new Error('Not signed in');
        if (!FUNCTIONS_URL) throw new Error('Functions URL missing');
        if (!SUPABASE_ANON_KEY) throw new Error('Missing anon key');
        const isEligible = (window as any)?.paypal?.HostedFields?.isEligible?.() ?? false;
        if (!isEligible) {
          alert('Card fields not eligible for this buyer.');
          return;
        }

        setSubmitting(true);

        const { data: { session } = {} as any } = await supabase.auth.getSession();
        const accessToken = session?.access_token || '';

        const createRes = await fetch(`${FUNCTIONS_URL}/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
            ...(accessToken ? { 'X-User-Token': accessToken } : {}),
          },
          body: JSON.stringify({
            amount: 9.0,
            currency: 'USD',
            user_id: user.id,
            metadata: { plan: 'premium_monthly', source: 'hosted-fields' },
          }),
        });

        const createJson = await createRes.json();
        if (!createRes.ok) {
          console.error('Create order error:', createJson);
          throw new Error(createJson.error || 'Create order failed');
        }
        const orderId = createJson.orderId as string;
        (window as any).__paymentId = createJson.paymentId as string;

        const cardholderName = (document.getElementById('hf-card-holder') as HTMLInputElement)?.value || undefined;
        const billingAddress = {
          streetAddress: (document.getElementById('hf-addr1') as HTMLInputElement)?.value || undefined,
          extendedAddress: (document.getElementById('hf-addr2') as HTMLInputElement)?.value || undefined,
          locality: (document.getElementById('hf-city') as HTMLInputElement)?.value || undefined,
          region: (document.getElementById('hf-state') as HTMLInputElement)?.value || undefined,
          postalCode: (document.getElementById('hf-postal') as HTMLInputElement)?.value || undefined,
          countryCodeAlpha2: (document.getElementById('hf-country') as HTMLInputElement)?.value || undefined,
        };

        if (!hostedFields) {
          console.error('HostedFields hook returned falsy:', hostedFields);
          throw new Error('Hosted fields not ready');
        }

        await submitHostedFields(hostedFields, {
          orderId,
          contingencies: ['3D_SECURE'],
          cardholderName,
          billingAddress,
        });

        const capRes = await fetch(`${FUNCTIONS_URL}/capture-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            orderId,
            paymentId: (window as any).__paymentId,
            card_holder_name_input: cardholderName,
            billing_address_input: billingAddress,
          }),
        });

        const capJson = await capRes.json();
        if (!capRes.ok || !capJson.ok) {
          console.error('Capture error:', capJson);
          alert(`Payment capture failed.${capJson?.debug_id ? ` Debug ID: ${capJson.debug_id}` : ''}`);
          return;
        }

        alert('Card payment successful! 🎉');
        onApproved();
      } catch (e: any) {
        console.error(e);
        alert(e?.message || 'Card payment failed.');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="space-y-3">
        <input id="hf-card-holder" placeholder="Name on card" className="w-full border rounded px-3 py-2" />
        <input id="hf-addr1" placeholder="Billing address line 1" className="w-full border rounded px-3 py-2" />
        <input id="hf-addr2" placeholder="Address line 2 (optional)" className="w-full border rounded px-3 py-2" />
        <div className="grid grid-cols-2 gap-2">
          <input id="hf-city" placeholder="City" className="border rounded px-3 py-2" />
          <input id="hf-state" placeholder="State" className="border rounded px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input id="hf-postal" placeholder="Postal code" className="border rounded px-3 py-2" />
          <input id="hf-country" placeholder="Country (e.g., US)" className="border rounded px-3 py-2" />
        </div>

        <button
          onClick={payWithCard}
          disabled={submitting}
          className="w-full py-3 rounded-lg font-semibold bg-[#01796F] text-white disabled:opacity-60"
        >
          {submitting ? 'Processing…' : 'Pay with Card'}
        </button>
      </div>
    );
  }

  // Refresh after success
  const onPaymentSuccess = () => {
    setRefreshPaymentsFlag((n) => n + 1);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar userEmail={user?.email || ''} onLogout={handleLogout} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none">
            <Menu className="h-6 w-6" />
          </button>
          <div className="font-bold text-xl text-[#0B4F6C]">Careercast</div>
          <div className="w-10" />
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Billing & Payment</h1>
              <p className="text-gray-600 text-sm sm:text-base">Manage your subscription, payment methods, and billing history</p>
            </div>

            {!PAYPAL_CLIENT_ID ? (
              <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-800">Payment System Not Configured</h3>
                <p className="text-yellow-700 text-sm mt-1">PayPal integration is not properly configured. Please contact support or check your environment variables.</p>
              </div>
            ) : !clientToken ? (
              <div className="mb-8 text-sm text-gray-600">Initializing secure payment system…</div>
            ) : (
              <PayPalScriptProvider
                key={clientToken}
                options={{
                  clientId: PAYPAL_CLIENT_ID || '',
                  intent: 'capture',
                  components: 'buttons,hosted-fields',
                  currency: 'USD',
                  dataClientToken: clientToken || undefined,
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
                  {plans.map((plan) => {
                    const isPremium = plan.key === 'premium';
                    const isCurrent = plan.current;

                    return (
                      <div key={plan.key} className={`bg-white rounded-lg sm:rounded-xl shadow-sm border-2 ${isCurrent ? 'border-[#01796F]' : 'border-gray-200'} overflow-hidden hover:shadow-lg transition-all duration-300`}>
                        {isCurrent && <div className="bg-[#01796F] text-white text-center py-2 text-xs sm:text-sm font-semibold">Current Plan</div>}
                        <div className="p-4 sm:p-6">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                          <div className="mb-4 sm:mb-6">
                            <span className="text-3xl sm:text-4xl font-bold text-gray-900">{plan.price}</span>
                            <span className="text-gray-600 text-sm sm:text-base">/{plan.period}</span>
                          </div>
                          <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                            {plan.features.map((f) => (
                              <li key={f} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#01796F] flex-shrink-0 mt-0.5" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>

                          {isPremium ? (
                            isCurrent ? (
                              <button className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-gray-100 text-gray-500 cursor-not-allowed" disabled>Current Plan</button>
                            ) : (
                              <div className="space-y-6">
                                <div className="p-3 border rounded-lg">
                                  <PayPalButtons
                                    fundingSource="paypal"
                                    style={{ layout: 'vertical' }}
                                    disabled={!user || !FUNCTIONS_URL || !SUPABASE_ANON_KEY}
                                    createOrder={async () => {
  if (!user) throw new Error('Not signed in');
  if (!FUNCTIONS_URL) throw new Error('Functions URL missing');
  if (!SUPABASE_ANON_KEY) throw new Error('Missing anon key');

  // amount should be taken from UI (state) — e.g. selectedPlanAmount
  const amountToCharge = 9.0; // replace with dynamic state you use in UI

  const { data: { session } = {} as any } = await supabase.auth.getSession();
  const accessToken = session?.access_token || '';

  const res = await fetch(`${FUNCTIONS_URL}/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
      ...(accessToken ? { 'X-User-Token': accessToken } : {}),
    },
    body: JSON.stringify({
      amount: amountToCharge,
      currency: 'USD',
      user_id: user.id,
      email: user.email,
      metadata: { plan: 'premium_monthly', source: 'wallet' },
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    console.error('Create order error:', json);
    throw new Error(json.error || 'Create order failed');
  }

  // set the paymentId returned by DB (UUID)
  (window as any).__paymentId = json.paymentId;
  // keep raw PayPal order too if you like: json.paypal_order_raw

  return json.orderId;
}}
                                   // inside PayPalButtons props
                                  // replace your current onApprove with this:
// inside PayPalButtons props
// inside PayPalButtons props
onApprove={async (data, actions) => {
  // return the promise so PayPal knows when client work is done
  return actions.order.capture().then(async (captureResult: any) => {
    try {
      const captureId =
        captureResult?.purchase_units?.[0]?.payments?.captures?.[0]?.id ??
        captureResult?.id ?? null;
      const payerEmail = captureResult?.payer?.email_address ?? null;
      const orderId = data.orderID;
      const paymentId = (window as any).__paymentId; // stored earlier in createOrder flow

      // POST captureResult to your server for DB update
      if (paymentId) {
        await fetch(`${FUNCTIONS_URL}/capture-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            paymentId,
            orderId,
            captureInfo: captureResult,
            payer_email: payerEmail,
            payer_name: `${captureResult?.payer?.name?.given_name ?? ''} ${captureResult?.payer?.name?.surname ?? ''}`.trim() || null,
          }),
        }).catch((e) => console.error('send capture to server failed', e));
      } else {
        console.warn('No paymentId stored; server update skipped.');
      }

      // update UI after short delay so PayPal UI can finish
      setTimeout(() => {
        onPaymentSuccess();
        // use toast instead of alert if available
        alert('Payment successful! 🎉');
      }, 300);

      return captureResult;
    } catch (err) {
      console.error('onApprove client-side error:', err);
      return Promise.reject(err);
    }
  });
}}



                                  />
                                </div>

                                {hfEligible === false && <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">Card fields aren’t eligible for this browser/region/app.</div>}

                                {hfEligible && (
                                  <PayPalHostedFieldsProvider
                                    styles={{
                                      input: { 'font-size': '16px' },
                                      ':focus': { outline: 'none' },
                                      '.invalid': { color: '#ef4444' },
                                    }}
                                    createOrder={async () => {
  if (!user) throw new Error('Not signed in');
  const amountToCharge = selectedAmount ?? 9.0; // <-- use your UI state here
  const { data: { session } = {} as any } = await supabase.auth.getSession();
  const accessToken = session?.access_token || '';

  const res = await fetch(`${FUNCTIONS_URL}/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
      ...(accessToken ? { 'X-User-Token': accessToken } : {}),
    },
    body: JSON.stringify({
      amount: amountToCharge,
      currency: 'USD',
      user_id: user.id,
      email: user.email,
      metadata: { plan: 'premium_monthly', source: 'wallet' },
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    console.error('Create order error:', json);
    throw new Error(json.error || 'Create order failed');
  }

  // important: set DB payment id (uuid)
  (window as any).__paymentId = json.paymentId;
  return json.orderId;
}}


                                  >
                                    <div className="p-4 border rounded-lg">
                                      <h4 className="font-semibold mb-3">Pay with debit/credit card</h4>

                                      <div id="hf-number" className="border rounded px-3 py-2 mb-2 min-h-[44px]" />
                                      <div className="grid grid-cols-2 gap-2">
                                        <div id="hf-cvv" className="border rounded px-3 py-2 min-h-[44px]" />
                                        <div id="hf-exp" className="border rounded px-3 py-2 min-h-[44px]" />
                                      </div>

                                      <PayPalHostedField hostedFieldType="number" options={{ selector: '#hf-number', placeholder: '4111 1111 1111 1111' }} />
                                      <PayPalHostedField hostedFieldType="cvv" options={{ selector: '#hf-cvv', placeholder: '123' }} />
                                      <PayPalHostedField hostedFieldType="expirationDate" options={{ selector: '#hf-exp', placeholder: 'MM/YY' }} />

                                      <div className="mt-3">
                                        <CardForm onApproved={onPaymentSuccess} />
                                      </div>
                                    </div>
                                  </PayPalHostedFieldsProvider>
                                )}
                              </div>
                            )
                          ) : (
                            <button className="w-full py-2 sm:py-3 rounded-lg font-semibold bg-gray-100 text-gray-500 cursor-not-allowed" disabled>{plan.current ? 'Current Plan' : 'Free Plan'}</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PayPalScriptProvider>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Secure Payment Processing</h3>
              <p className="text-blue-700 text-sm sm:text-base mb-3">All payments are processed securely through PayPal. You don't need to share your credit card information with us.</p>
              <div className="flex items-center gap-2">
                <div className="bg-white px-3 py-1 rounded-full border border-blue-300"><span className="text-blue-800 font-medium text-sm">PayPal</span></div>
                <span className="text-blue-600 text-xs">SSL Encrypted</span>
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Payment History</h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#01796F]" />
                  <p className="mt-2 text-gray-600">Loading payment history...</p>
                </div>
              ) : paymentHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentHistory.map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{(p.transaction_id ?? p.paypal_order_id ?? p.id).toString().slice(0, 12)}…</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{renderDate(p)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{renderAmount(p)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{renderMethod(p.payment_mode)}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'completed' ? 'bg-green-100 text-green-800' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
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
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No payment history</h3>
                  <p className="mt-1 text-sm text-gray-500">You haven't made any payments yet.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

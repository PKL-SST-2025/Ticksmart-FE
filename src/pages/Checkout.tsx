import type { Component } from 'solid-js';
import { createStore } from 'solid-js/store';
import { createMemo, createResource, createSignal, Show } from 'solid-js';
import { useParams, A, useNavigate, useSearchParams } from '@solidjs/router';
import DashboardLayout from '../components/DashboardLayout';
import { getEventById } from '../data/events';
import FloatingLabelInput from '../components/input/FloatingLabelInput'; // Using our custom component

// Importing high-quality icons
import { 
  AiOutlineArrowLeft,
  AiOutlineUser,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineEnvironment,
  AiOutlineCreditCard,
  AiOutlineLock,
  AiOutlineLoading
} from 'solid-icons/ai';
import { sendRequest } from '../utils/SendRequest';
import StripePaymentForm from '../components/forms/StripePaymentForm';
// --- Sub-components ---
const formatPrice = (price: number | string) => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(numericPrice);
};

const OrderSummaryCard: Component<{ order: OrderData | undefined; isLoading: boolean }> = (props) => {
  return (
    <div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 space-y-4">
      <h2 class="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Order Summary</h2>
      <Show when={!props.isLoading} fallback={<div class="h-48 animate-pulse"><div class="h-full bg-neutral-200 dark:bg-neutral-700 rounded-md"></div></div>}>
        <Show when={props.order} keyed>
          {(order) => (
            <>
              {/* This part can be enhanced later when you have event/offer names */}
              <div class="space-y-3 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                <h3 class="font-semibold text-neutral-700 dark:text-neutral-300">Your Ticket Order</h3>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">Order ID: {order.id.substring(0, 8)}...</p>
              </div>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between text-neutral-600 dark:text-neutral-400"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                <div class="flex justify-between text-neutral-600 dark:text-neutral-400"><span>Fees</span><span>{formatPrice(order.service_fee)}</span></div>
              </div>
              <div class="flex justify-between items-center pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <span class="text-base font-semibold text-neutral-800 dark:text-neutral-200">Total Price</span>
                <span class="text-xl font-bold text-indigo-600 dark:text-indigo-400">{formatPrice(order.total_amount)}</span>
              </div>
            </>
          )}
        </Show>
      </Show>
    </div>
  );
};

// --- Type Definitions ---
type OrderData = {
  id: string; // UUID
  user_id: number;
  status: string;
  subtotal: string; // Decimal comes as a string
  service_fee: string;
  total_amount: string;
  created_at: string;
  last_updated: string;
  expires_at: string;
};
type PaymentIntentResponse = {
  order: OrderData;
  stripe_client_secret: string;
};


const Checkout: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryParams = createMemo(() => ({
    offerId: parseInt(searchParams.offer || '0'),
    quantity: parseInt(searchParams.qty || '1'),
  }));

  const [paymentIntent] = createResource(
    queryParams,
    async ({ offerId, quantity }) => {
      if (!offerId || !quantity) return; 
      return sendRequest<PaymentIntentResponse>('/orders', {
        method: 'POST',
        body: { items: [{ offer_id: offerId, quantity }] }
      });
    }
  );

  const [billingInfo, setBillingInfo] = createStore({ fullName: '', email: '', phone: '' });

  const handleInput = (e: Event) => {
    const { name, value } = e.currentTarget as HTMLInputElement;
    setBillingInfo(name as keyof typeof billingInfo, value);
  };
  
  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log("Payment successful! Intent ID:", paymentIntentId);
    navigate('/orders');
  };
  
  return (
    <DashboardLayout>
      <div class="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
        <div class="mb-6">
          <A href={`/event/${params.eventId}`} class="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
            <AiOutlineArrowLeft /> Back to Event Details
          </A>

          
        </div>
        
          
          {/* --- Main Content (Left Column) --- */}
          <div class="lg:col-span-2 space-y-8">
            <div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6">
              <h1 class="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-6">Checkout</h1>
              
              {/* Billing Information */}
              <div class="space-y-6">
                <h2 class="text-lg font-semibold text-neutral-700 dark:text-neutral-300">Billing Information</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <FloatingLabelInput name="fullName" label="Full Name" icon={AiOutlineUser} type="text" value={billingInfo.fullName} onInput={handleInput} required />
                  <FloatingLabelInput name="email" label="Email Address" icon={AiOutlineMail} type="email" value={billingInfo.email} onInput={handleInput} required />
                </div>
                <FloatingLabelInput name="phone" label="Phone Number" icon={AiOutlinePhone} type="tel" value={billingInfo.phone} onInput={handleInput} required />
              </div>
            </div>

            {/* Payment Method Section */}
            <div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6">
              <h2 class="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-4">Payment Method</h2>
              <Show 
                when={!paymentIntent.loading && paymentIntent()}
                fallback={<div class="text-center py-12"><AiOutlineLoading class="animate-spin size-6 mx-auto"/></div>}
              >
                <Show when={!paymentIntent.error} fallback={<p class="text-red-500">{paymentIntent.error.message}</p>}>
                  {/* --- THE FIX (Part 3): Pass the correct data to the components --- */}
                  <StripePaymentForm 
                    clientSecret={paymentIntent()!.stripe_client_secret}
                    totalPrice={parseFloat(paymentIntent()!.order.total_amount)}
                    onSuccess={handlePaymentSuccess}
                  />
                </Show>
              </Show>
            </div>
          </div>

          {/* --- Order Summary (Right Column) --- */}
          <div class="lg:col-span-1">
            <div class="sticky top-8 space-y-6">
              <OrderSummaryCard order={paymentIntent()?.order} isLoading={paymentIntent.loading} />

              
            </div>
          </div>
      </div>
    </DashboardLayout>
  );
};

export default Checkout;
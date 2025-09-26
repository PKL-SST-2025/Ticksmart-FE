import { Component, createSignal, Show } from 'solid-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from 'solid-stripe';
import { AiOutlineLoading, AiOutlineLock } from 'solid-icons/ai';

const stripePromise = loadStripe("pk_test_51SAhjrJKgrSacDQdjbvDke4O6BpJaDNb7jYZ46j2Wbh4ZGDgxTrDHvV9Exfe8v6t8Nvul4CnHMt6HLW1iUMp2SOz00CkJ04LAO");

// --- The Inner Form Component ---
interface PaymentFormProps {
  totalPrice: number;
  onSuccess: (paymentIntentId: string) => void;
}

const PaymentForm: Component<PaymentFormProps> = (props) => {
  const [isLoading, setIsLoading] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const stripeInstance = stripe();
    const elementsInstance = elements();
    if (!stripeInstance || !elementsInstance) return;

    setIsLoading(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripeInstance.confirmPayment({
      elements: elementsInstance,
      confirmParams: { return_url: `${window.location.origin}/orders` },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
      setIsLoading(false);
    } else if (paymentIntent?.status === 'succeeded') {
      props.onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-6">
      <div id="payment-element"><PaymentElement /></div>
      <Show when={errorMessage()}><p class="text-sm text-center text-red-500">{errorMessage()}</p></Show>
      <div class="pt-2">
        <button
          type="submit"
          disabled={isLoading() || !stripe() || !elements()}
          class="w-full flex items-center justify-center gap-3 py-3 px-4 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
        >
          <Show when={!isLoading()} fallback={<span>Processing...</span>}>
            <AiOutlineLock /> Pay {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(props.totalPrice)}
          </Show>
        </button>
      </div>
    </form>
  );
};

// --- The Main Exported Component ---
interface StripePaymentFormProps {
  clientSecret: string;
  totalPrice: number;
  onSuccess: (paymentIntentId: string) => void;
}

const StripePaymentForm: Component<StripePaymentFormProps> = (props) => {
  const appearance: StripeElementsOptions['appearance'] = {
    theme: document.documentElement.classList.contains('dark') ? 'night' : 'stripe',
    variables: { colorPrimary: '#4f46e5' },
  };

  return (
    <Elements stripe={stripePromise} options={{ clientSecret: props.clientSecret, appearance }}>
      <PaymentForm totalPrice={props.totalPrice} onSuccess={props.onSuccess} />
    </Elements>
  );
};

export default StripePaymentForm;
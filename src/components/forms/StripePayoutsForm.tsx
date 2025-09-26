import { Component, createSignal, onMount, Show } from 'solid-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from 'solid-stripe';
import { AiOutlineLoading } from 'solid-icons/ai';
import { sendRequest } from '../../utils/SendRequest';

// --- STEP 1: Load Stripe with your Publishable Key from environment variables ---
// IMPORTANT: In your project root, create a file named `.env` and add:
// VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...your_key_here...
const stripePromise = loadStripe("pk_test_51SAhjrJKgrSacDQdjbvDke4O6BpJaDNb7jYZ46j2Wbh4ZGDgxTrDHvV9Exfe8v6t8Nvul4CnHMt6HLW1iUMp2SOz00CkJ04LAO");

// --- The Inner Form Component ---
// It now correctly defines its props, including `onSuccess`.
interface PayoutFormProps {
  onSuccess: (setupIntentId: string) => void;
}


// --- The Inner Form Component (Implementation Detail) ---
// This component must be a child of <Elements> to access Stripe's context.
const PayoutForm: Component<PayoutFormProps> = (props) => {
  const [isLoading, setIsLoading] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  // This hook from `solid-stripe` provides the Stripe and Elements instances.
  const stripe = useStripe();
  const elements = useElements();


   const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    const stripeInstance = stripe();
    const elementsInstance = elements();

    if (!stripeInstance || !elementsInstance) {
      console.error("Stripe.js has not loaded yet.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // We now use `stripeInstance.confirmSetup`
    const { error, setupIntent } = await stripeInstance.confirmSetup({
      elements: elementsInstance,
      confirmParams: {
        return_url: `${window.location.origin}/organizer/onboarding?step=6`,
      },
      // We use `redirect: 'if_required'` so that if no 3D Secure is needed,
      // we can handle the success right here without a page reload.
      redirect: 'if_required',
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setErrorMessage(error.message || "An error occurred.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
      setIsLoading(false);
    } else if (setupIntent?.status === 'succeeded') {
      // --- SUCCESS! ---
      // The SetupIntent was successful without a redirect.
      // We can now call the `onSuccess` callback with the ID.
      props.onSuccess(setupIntent.id);
      // The parent component will handle the loading state from here.
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-6">
      <h3 class="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Payout Details</h3>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 -mt-4">
        Securely provide your bank account details. This information is sent directly to Stripe and never touches our servers.
      </p>

      {/* The <PaymentElement> renders a complete, dynamic form for collecting
          payout details, adapting based on the country and currency. */}
      <div id="payment-element">
        <PaymentElement />
      </div>

      <Show when={errorMessage()}>
        <p class="text-sm text-center text-red-500">{errorMessage()}</p>
      </Show>

      <div class="pt-2">
        <button
          type="submit"
          disabled={isLoading() || !stripe || !elements}
          class="w-full flex justify-center py-3 px-4 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading() ? 'Saving Payout Details...' : 'Save and Continue'}
        </button>
      </div>
    </form>
  );
};


// --- The Main Exported Component ---
// This is the "smart" component that fetches the client secret and provides context.
const StripePayoutForm: Component<PayoutFormProps> = (props) => {
  const [clientSecret, setClientSecret] = createSignal<string | null>(null);
  const [error, setError] = createSignal<string | null>(null);

  // Fetch the SetupIntent client secret from your backend when the component mounts.
  onMount(async () => {
    try {
      const response = await sendRequest<{ client_secret: string }>('/organizer/stripe/setup-intent-handler', { method: 'POST' });
      setClientSecret(response.client_secret);
    } catch (err: any) {
      setError("Failed to initialize secure payment form. Please refresh the page.");
      console.error(err);
    }
  });
  
  // Define the appearance of the Stripe Elements to match your theme.
  const appearance: StripeElementsOptions['appearance'] = {
    theme: document.documentElement.classList.contains('dark') ? 'night' : 'stripe',
    variables: { 
      colorPrimary: '#4f46e5', // Indigo
      borderRadius: '0.5rem',
      fontFamily: 'inherit',
    },
    rules: {
        '.Input': {
            backgroundColor: document.documentElement.classList.contains('dark') ? '#404040' : '#f9fafb', // neutral-700 or gray-50
            color: document.documentElement.classList.contains('dark') ? '#d4d4d4' : '#171717', // neutral-300 or neutral-900
        }
    }
  };

  return (
    <div class="w-full">
      <Show when={clientSecret()} fallback={
        <div class="text-center text-neutral-500 py-12">
          <Show when={!error()} fallback={<p class="text-red-500">{error()}</p>}>
            <div class="flex flex-col items-center gap-2">
              <AiOutlineLoading class="animate-spin size-6" />
              <span>Initializing secure payment form...</span>
            </div>
          </Show>
        </div>
      }>
        <Elements stripe={stripePromise} options={{ clientSecret: clientSecret()!, appearance }}>
          <PayoutForm onSuccess={props.onSuccess} />
        </Elements>
      </Show>
    </div>
  );
};

export default StripePayoutForm;
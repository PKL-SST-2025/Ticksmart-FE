import type { Component } from 'solid-js';
import { createSignal, Show } from 'solid-js';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { sendRequest } from '../../../utils/SendRequest'; // Your API utility

// Icons for visual flair
import { 
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineWarning,
  AiOutlineLoading
} from 'solid-icons/ai';
import BsStripe from '../../../components/icons/BsStripe';

// --- Type definition for the organizer's Stripe status ---
type StripeStatus = 'not_connected' | 'pending' | 'connected' | 'restricted';

const OrganizerStripeConnectPage: Component = () => {
  // In a real app, this status would be fetched from your backend API
  // e.g., from your organizer_profile table
  const [stripeStatus, setStripeStatus] = createSignal<StripeStatus>('not_connected');
  const [isLoading, setIsLoading] = createSignal(false);
  const [apiError, setApiError] = createSignal<string | null>(null);

  // This function simulates the backend call to create a Stripe Onboarding link
  const handleConnectStripe = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // --- REAL API CALL ---
      // This is where you would call your backend endpoint.
      // const response = await sendRequest<{ url: string }>('/stripe/connect-account', { method: 'POST' });
      
      // --- SIMULATION ---
      console.log("Requesting Stripe onboarding link from backend...");
      await new Promise(r => setTimeout(r, 1500));
      const response = { url: 'https://connect.stripe.com/setup/s/something-fake' }; // Fake URL
      // --- END SIMULATION ---
      
      // Redirect the user to the Stripe-hosted onboarding page.
      // Stripe will handle redirecting them back to your site when they are done.
      window.location.href = response.url;

    } catch (err: any) {
      setApiError(err.message || "Failed to initiate Stripe connection. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div class="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
        
        {/* Page Header */}
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Connect with Stripe</h1>
          <p class="mt-1 text-neutral-500 dark:text-neutral-400">
            Securely manage your payouts and finances by connecting your Stripe account.
          </p>
        </div>

        {/* --- Main Content Card --- */}
        <div class="max-w-3xl mx-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div class="p-8 text-center">
            <h2 class="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
              Secure Payouts with Stripe
            </h2>
            <p class="mt-2 max-w-lg mx-auto text-neutral-600 dark:text-neutral-400">
              We partner with Stripe, a global leader in online payments, to handle your payouts securely and efficiently. Connecting your account is required to sell tickets and receive funds.
            </p>
          </div>
          
          <div class="border-t border-neutral-200 dark:border-neutral-700 p-8">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* --- Dynamic Status Display --- */}
              <Show when={stripeStatus() === 'not_connected'}>
                <StatusDisplay
                  icon={AiOutlineWarning}
                  title="Account Not Connected"
                  message="Connect your account to start receiving payouts."
                  color="yellow"
                />
              </Show>
              <Show when={stripeStatus() === 'pending'}>
                 <StatusDisplay
                  icon={AiOutlineClockCircle}
                  title="Verification Pending"
                  message="Stripe is reviewing your information. This can take a few minutes."
                  color="blue"
                />
              </Show>
               <Show when={stripeStatus() === 'connected'}>
                 <StatusDisplay
                  icon={AiOutlineCheckCircle}
                  title="Account Connected"
                  message="You are ready to receive payouts for your events."
                  color="green"
                />
              </Show>

              {/* --- Call-to-Action Button --- */}
              <div>
                <button
                  onClick={handleConnectStripe}
                  disabled={isLoading() || stripeStatus() === 'connected'}
                  class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Show when={isLoading()} fallback={<span>Connect with Stripe</span>}>
                    <AiOutlineLoading class="animate-spin size-5" />
                    <span>Connecting...</span>
                  </Show>
                </button>
              </div>
            </div>
            <Show when={apiError()}>
              <p class="mt-4 text-center text-sm text-red-500">{apiError()}</p>
            </Show>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

// --- Helper component for displaying the status ---
const StatusDisplay: Component<{
  icon: Component;
  title: string;
  message: string;
  color: 'green' | 'yellow' | 'blue';
}> = (props) => {
  const colorClasses = {
    green: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400',
    blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
  };
  return (
    <div class="flex items-center gap-4">
      <div class={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[props.color]}`}>
        <props.icon class="size-6" />
      </div>
      <div>
        <h3 class="font-semibold text-neutral-800 dark:text-neutral-200">{props.title}</h3>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">{props.message}</p>
      </div>
    </div>
  );
};

export default OrganizerStripeConnectPage;
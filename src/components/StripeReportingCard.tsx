import { Component, createSignal, onMount, Show, For } from 'solid-js';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import { sendRequest } from '../utils/SendRequest';
import { AiOutlineLoading } from 'solid-icons/ai';

type ConnectReportComponentType = 'reporting_chart';

interface StripeReportingCardProps {
  title: string;
  reportName: 'net_volume' | 'gross_volume';
}

const INTERVALS: ('day' | 'month' | 'quarter' | 'year')[] = ['day', 'month', 'quarter', 'year'];

interface StripeReportingChart extends HTMLElement {
  setReportName(reportName: 'net_volume' | 'gross_volume'): void;
  setIntervalType(interval: 'day' | 'month' | 'quarter' | 'year'): void;
  setIntervalStart(date: Date): void;
  setIntervalEnd(date: Date): void;
}

const StripeReportingCard: Component<StripeReportingCardProps> = (props) => {
  const [error, setError] = createSignal<string | null>(null);
  const [isLoaded, setIsLoaded] = createSignal(false);
  const [intervalType, setIntervalType] = createSignal<'day' | 'month' | 'quarter' | 'year'>('day');
  let containerRef: HTMLDivElement | undefined;
  let chartComponent: HTMLElement | null = null;

  const reloadChart = async () => {
    if (!containerRef) return;

    try {
      const response = await sendRequest<{ client_secret: string }>('/organizer/stripe/account-session', { method: 'GET' });
      const secret = response.client_secret;

      const connectInstance = await loadConnectAndInitialize({
        publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
        fetchClientSecret: async () => secret,
      });

      // Remove old chart if exists
      if (chartComponent && containerRef.contains(chartComponent)) {
        containerRef.removeChild(chartComponent);
      }

      chartComponent = connectInstance.create('reporting_chart' as any);

      // ⚡️ Configure the chart
      (chartComponent as any).setReportName(props.reportName);
      (chartComponent as any).setIntervalType(intervalType());
      (chartComponent as any).setIntervalStart(new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)); // last 30 days as example
      (chartComponent as any).setIntervalEnd(new Date());

      containerRef.appendChild(chartComponent);
      setIsLoaded(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load reporting chart.');
      console.error(err);
    }
  };

  onMount(() => {
    reloadChart();
  });

  const changeInterval = (newInterval: 'day' | 'month' | 'quarter' | 'year') => {
    setIntervalType(newInterval);
    reloadChart();
  };

  return (
    <div class="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6">
      <h2 class="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
        {props.title}
      </h2>

      <div class="flex gap-2 mb-4">
        <For each={INTERVALS}>
          {(i) => (
            <button
              class={`px-3 py-1 rounded ${
                intervalType() === i ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}
              onClick={() => changeInterval(i)}
            >
              {i.charAt(0).toUpperCase() + i.slice(1)}
            </button>
          )}
        </For>
      </div>

      <Show when={!error()} fallback={<p class="text-center text-red-500">{error()}</p>}>
        <div ref={containerRef} class="min-h-[400px] flex justify-center items-center">
          {!isLoaded() && (
            <div class="flex flex-col items-center justify-center text-neutral-500">
              <AiOutlineLoading class="animate-spin size-8 mb-2" />
              <p>Loading reporting chart...</p>
            </div>
          )}
        </div>
      </Show>
    </div>
  );
};

export default StripeReportingCard;

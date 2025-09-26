import { Component, onMount, Show, createEffect } from 'solid-js';
import { useStripeConnect } from '../context/StripeConnectContext';
import { AiOutlineLoading } from 'solid-icons/ai';

export type ConnectComponentType = 
  | 'balances' | 'payments' | 'payouts' | 'disputes' | 'reports';

interface StripeEmbeddedCardProps {
  title: string;
  componentName: ConnectComponentType;
}

const StripeEmbeddedCard: Component<StripeEmbeddedCardProps> = (props) => {
  const { connectInstance, isLoading, error } = useStripeConnect();
  let containerRef: HTMLDivElement | undefined;

  // This effect runs when the connectInstance becomes available.
  createEffect(() => {
    const instance = connectInstance();
    if (instance && containerRef) {
      // Clear any previous content
      while (containerRef.firstChild) {
        containerRef.removeChild(containerRef.firstChild);
      }
      // Create and mount the component
      const component = instance.create(props.componentName);
      containerRef.appendChild(component);
    }
  });

  return (
    <div class="w-full bg-white dark:bg-[#14171D] border border-neutral-200 dark:border-neutral-700 rounded-xl p-6">
      <h2 class="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
        {props.title}
      </h2>
      <div ref={containerRef} class="min-h-[400px]">
        <Show when={!isLoading() && !error()} fallback={
          <div class="flex flex-col items-center justify-center h-full text-neutral-500 pt-16">
            <Show when={error()} fallback={
              <>
                <AiOutlineLoading class="animate-spin size-8 mb-2" />
                <p>Loading secure data from Stripe...</p>
              </>
            }>
              <p class="text-red-500">Failed to load component: {error().message}</p>
            </Show>
          </div>
        }>
        </Show>
      </div>
    </div>
  );
};

export default StripeEmbeddedCard;
import { Component, createSignal, For, onMount, Show } from 'solid-js';
import { AiOutlineMail, AiOutlineUser, AiOutlineCalendar, AiOutlineEnvironment, AiOutlineLoading } from 'solid-icons/ai';
import { sendRequest } from '../../utils/SendRequest';

// --- Type Definitions to match your schema ---
type Ticket = {
  id: string; ticket_tier_name: string; seat_info: string | null;
  price_paid: number; status: 'valid' | 'checked_in' | 'voided';
};

export type OrderDetailsData = {
  id: string; user_name: string; user_email: string; event_title: string;
  created_at: string; total_amount: number; subtotal: number; service_fee: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  tickets: Ticket[];
};

interface OrderDetailsProps {
  orderId: string;
  // This prop is crucial for security, ensuring we call the correct backend endpoint.
  context: 'admin' | 'organizer';
}

// Helper to format currency
const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

const OrderDetails: Component<OrderDetailsProps> = (props) => {
  const [order, setOrder] = createSignal<OrderDetailsData | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);


  const fetchOrderDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiPath = `/${props.context}/orders/${props.orderId}`;
      const fetchedOrder = await sendRequest<OrderDetailsData>(apiPath);
      setOrder(fetchedOrder);
    } catch (err: any) {
      setError(err.message || "Failed to load order details.");
    } finally {
      setIsLoading(false);
    }
  };


  onMount(fetchOrderDetails);
  return (
    
    <Show when={!isLoading() && order()} fallback={<div class="h-48 flex justify-center items-center"><AiOutlineLoading class="animate-spin size-6 text-indigo-500"/></div>}>
    <div class="space-y-6 text-sm">
      {/* Customer and Event Info */}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div class="space-y-1">
          <h4 class="font-semibold text-neutral-800 dark:text-neutral-200">Customer</h4>
          <p class="flex items-center gap-2 text-neutral-600 dark:text-neutral-400"><AiOutlineUser /> {order()!.user_name}</p>
          <p class="flex items-center gap-2 text-neutral-600 dark:text-neutral-400"><AiOutlineMail /> {order()!.user_email}</p>
        </div>
        <div class="space-y-1">
          <h4 class="font-semibold text-neutral-800 dark:text-neutral-200">Event</h4>
          <p class="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">{order()!.event_title}</p>
          <p class="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <AiOutlineCalendar /> {new Date(order()!.created_at).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>
      </div>

      {/* Tickets List */}
      <div>
        <h4 class="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Tickets ({order()!.tickets.length})</h4>
        <div class="border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <ul class="divide-y divide-neutral-200 dark:divide-neutral-700">
            <For each={order()!.tickets}>
              {(ticket) => (
                <li class="p-3 flex justify-between items-center">
                  <div>
                    <p class="font-medium text-neutral-800 dark:text-neutral-200">{ticket.ticket_tier_name}</p>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400">
                      {ticket.seat_info || 'General Admission'}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-neutral-800 dark:text-neutral-200">{formatPrice(ticket.price_paid)}</p>
                    <p class="text-xs text-green-600 dark:text-green-400 font-semibold">{ticket.status}</p>
                  </div>
                </li>
              )}
            </For>
          </ul>
        </div>
      </div>

        {/* Financial Summary */}
        <div class="border-t border-neutral-200 dark:border-neutral-700 pt-4 flex justify-end">
          <div class="w-full max-w-xs space-y-2">
            <div class="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>Subtotal</span>
              <span>{formatPrice(order()!.subtotal)}</span>
            </div>
            <div class="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>Fees</span>
              <span>{formatPrice(order()!.service_fee)}</span>
            </div>
            <div class="flex justify-between font-bold">
              <span class="text-neutral-800 dark:text-neutral-200">Total</span>
              <span class="text-indigo-600 dark:text-indigo-400">{formatPrice(order()!.total_amount)}</span>
            </div>
          </div>
      </div>
    </div>
    </Show>
  );
};

export default OrderDetails;
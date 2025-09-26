import type { Component } from 'solid-js';
import { createSignal, onMount, For, Show } from 'solid-js';
import DashboardLayout from '../../../layouts/DashboardLayout';
import Table, { type Column } from '../../../components/table/Table';
// import { sendRequest } from '../../utils/sendRequest'; // Your API utility

import { AiOutlineLoading } from 'solid-icons/ai';

// --- Type Definition based on your 'payments' table & JOINs ---
type Payment = {
  id: string; // UUID from DB
  order_id: string;
  stripe_payment_intent_id: string;
  user_name: string; // Joined from users table
  event_title: string; // Joined from orders -> tickets -> events
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  created_at: string;
  amount_charged: number;
  currency: string;
};

// --- Mock Data simulating what the backend API would return ---
const mockPayments: Payment[] = [
  { id: 'pay_uuid_1', order_id: 'ord_uuid_1', stripe_payment_intent_id: 'pi_3Pj...', user_name: 'John Doe', event_title: 'Bruno Mars Live', status: 'succeeded', created_at: '2025-09-10T14:48:00Z', amount_charged: 1750000, currency: 'IDR' },
  { id: 'pay_uuid_2', order_id: 'ord_uuid_2', stripe_payment_intent_id: 'pi_3Pi...', user_name: 'Jane Smith', event_title: 'Tulus Concert', status: 'succeeded', created_at: '2025-09-08T11:21:00Z', amount_charged: 930000, currency: 'IDR' },
  { id: 'pay_uuid_3', order_id: 'ord_uuid_3', stripe_payment_intent_id: 'pi_3Ph...', user_name: 'Alice Johnson', event_title: 'Rockfest 2025', status: 'pending', created_at: '2025-09-12T09:15:00Z', amount_charged: 550000, currency: 'IDR' },
  { id: 'pay_uuid_4', order_id: 'ord_uuid_4', stripe_payment_intent_id: 'pi_3Pg...', user_name: 'Bob Brown', event_title: 'Bruno Mars Live', status: 'refunded', created_at: '2025-08-25T18:05:00Z', amount_charged: 750000, currency: 'IDR' },
  { id: 'pay_uuid_5', order_id: 'ord_uuid_5', stripe_payment_intent_id: 'pi_3Pf...', user_name: 'Charlie Davis', event_title: 'Jazz Festival', status: 'failed', created_at: '2025-09-11T22:30:00Z', amount_charged: 200000, currency: 'IDR' },
];

// --- Helper Components ---
const StatusBadge: Component<{ status: Payment['status'] }> = (props) => {
  const statusClasses = () => {
    switch (props.status) {
      case 'succeeded': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'refunded': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300';
    }
  };
  return (
    <span class={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${statusClasses()}`}>
      {props.status.charAt(0).toUpperCase() + props.status.slice(1)}
    </span>
  );
};
const LoadingSpinner: Component = () => ( <div class="flex justify-center items-center h-64"><AiOutlineLoading class="animate-spin size-8 text-indigo-500" /></div> );
const formatPrice = (price: number, currency: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(price / 100); // Assuming price is in cents

// --- Main Page Component ---
const AdminPaymentsPage: Component = () => {
  const [payments, setPayments] = createSignal<Payment[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [apiError, setApiError] = createSignal<string | null>(null);

  // --- API Functions ---
  const fetchPayments = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // const fetchedPayments = await sendRequest<Payment[]>('/admin/payments');
      // setPayments(fetchedPayments);
      await new Promise(r => setTimeout(r, 1000)); // Simulate network
      setPayments(mockPayments);
    } catch (err: any) {
      setApiError(err.message || 'Failed to fetch payments.');
    } finally {
      setIsLoading(false);
    }
  };

  onMount(fetchPayments);

  // --- Table Column Definitions ---
  const columns: Column<Payment>[] = [
    { 
      header: 'Customer', 
      accessor: 'user_name',
      cell: (item) => (
        <div>
          <p class="font-semibold text-neutral-800 dark:text-neutral-200">{item.user_name}</p>
          <p class="text-xs text-neutral-500">{item.event_title}</p>
        </div>
      )
    },
    { 
      header: 'Stripe ID', 
      accessor: 'stripe_payment_intent_id',
      cell: (item) => (
        <a 
          href={`https://dashboard.stripe.com/payments/${item.stripe_payment_intent_id}`} 
          target="_blank" 
          rel="noopener noreferrer"
          class="font-mono text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {item.stripe_payment_intent_id.substring(0, 10)}...
        </a>
      )
    },
    { header: 'Status', accessor: 'status', cell: (item) => <StatusBadge status={item.status} /> },
    { header: 'Date', accessor: 'created_at', cell: (item) => new Date(item.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) },
    { 
      header: 'Amount', 
      accessor: 'amount_charged', 
      cell: (item) => <span class="font-semibold">{formatPrice(item.amount_charged, item.currency)}</span> 
    },
  ];

  return (
    <DashboardLayout>
      <div class="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Payment Ledger</h1>
          <p class="mt-1 text-neutral-500 dark:text-neutral-400">View a detailed history of all financial transactions.</p>
        </div>

        <Show when={apiError()}><div class="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">{apiError()}</div></Show>

        <Show when={!isLoading()} fallback={<LoadingSpinner />}>
          <Table data={payments()} columns={columns} itemsPerPage={10} />
        </Show>
      </div>
    </DashboardLayout>
  );
};

export default AdminPaymentsPage;
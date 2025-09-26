import type { Component } from 'solid-js';
import { createSignal, onMount, For, Show } from 'solid-js';
import DashboardLayout from '../../../layouts/DashboardLayout';
import Table, { type Column } from '../../../components/table/Table';
import { useModal } from '../../../context/ModalContext';
import { sendRequest } from '../../../utils/SendRequest';
import OrderDetails, { type OrderDetailsData } from '../../../components/forms/OrderDetails';

import { AiOutlineLoading } from 'solid-icons/ai';


// --- Type Definition based on your Rust 'OrderOrganizerView' struct ---
type Order = {
  id: string; // UUID from DB
  user_name: string;
  event_title: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  created_at: string;
  total_amount: number;
};


// --- Helper Components ---
const StatusBadge: Component<{ status: Order['status'] }> = (props) => {
  const statusClasses = () => {
    switch (props.status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'cancelled': return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300';
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
const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

const OrganizerOrdersPage: Component = () => {
    const { openModal } = useModal();
  const [orders, setOrders] = createSignal<Order[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [apiError, setApiError] = createSignal<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Calls GET /api/organizer/orders to fetch orders for the authenticated organizer
      const fetchedOrders = await sendRequest<Order[]>('/organizer/orders');
      setOrders(fetchedOrders);
    } catch (err: any) {
      setApiError(err.message || 'Failed to fetch your orders.');
    } finally {
      setIsLoading(false);
    }
  };

  onMount(fetchOrders);

  // --- Modal Trigger ---
  const handleViewDetailsClick = (order: Order) => {
    openModal(
      `Order Details: ${order.id.substring(0, 8)}...`, 
      () => <OrderDetails orderId={order.id} context="organizer" />
    );
  };

  // --- Table Column Definitions ---
  const columns: Column<Order>[] = [
    { header: 'Order ID', accessor: 'id', cell: (item) => <span class="font-mono text-xs">{item.id.substring(0, 8)}...</span> },
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
    { header: 'Status', accessor: 'status', cell: (item) => <StatusBadge status={item.status} /> },
    { header: 'Date', accessor: 'created_at', cell: (item) => new Date(item.created_at).toLocaleDateString() },
    { header: 'Total', accessor: 'total_amount', cell: (item) => <span class="font-semibold">{formatPrice(item.total_amount)}</span> },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (item) => (
        <button onClick={() => handleViewDetailsClick(item)} class="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-semibold">
          View Details
        </button>
      )
    },
  ];

  return (
    <DashboardLayout>
      <div class="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Manage All Orders</h1>
          <p class="mt-1 text-neutral-500 dark:text-neutral-400">Oversee all transactions across the platform.</p>
        </div>

        <Show when={apiError()}><div class="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">{apiError()}</div></Show>

        <Show when={!isLoading()} fallback={<LoadingSpinner />}>
          <Table data={orders()} columns={columns} itemsPerPage={10} />
        </Show>
      </div>
    </DashboardLayout>
  );
};

export default OrganizerOrdersPage;
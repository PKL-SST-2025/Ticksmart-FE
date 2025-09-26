import type { Component } from 'solid-js';
import { createSignal, onMount, For, Show } from 'solid-js';
import DashboardLayout from '../../../layouts/DashboardLayout';
import Table, { type Column } from '../../../components/table/Table';
import { useModal } from '../../../context/ModalContext';
import { sendRequest } from '../../../utils/SendRequest';
import OrderDetails, { type OrderDetailsData } from '../../../components/forms/OrderDetails';

import { AiOutlineDelete, AiOutlineEye, AiOutlineLoading } from 'solid-icons/ai';
import ConfirmDeleteModal from '../../../components/modal/ConfirmDeleteModal';

// --- Type Definition to match backend JOINs ---
// An admin needs to see who the user and organizer are.
type AdminOrder = {
  id: string; // UUID from DB
  user_name: string;
  event_title: string;
  organizer_name: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  created_at: string;
  total_amount: number;
};


// --- Helper Components ---
const StatusBadge: Component<{ status: AdminOrder['status'] }> = (props) => {
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

// --- Main Page Component ---
const AdminOrdersPage: Component = () => {
  const { openModal, closeModal } = useModal();
  const [orders, setOrders] = createSignal<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [apiError, setApiError] = createSignal<string | null>(null);


  // --- API Functions ---
  const fetchOrders = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Calls GET /api/admin/orders
      const fetchedOrders = await sendRequest<AdminOrder[]>('/admin/orders');
      setOrders(fetchedOrders);
    } catch (err: any) {
      setApiError(err.message || 'Failed to fetch orders.');
    } finally {
      setIsLoading(false);
    }
  };

  onMount(fetchOrders);
  
  const handleDelete = async (order: AdminOrder) => {
    // Calls DELETE /api/admin/orders/:id
    await sendRequest(`/admin/orders/${order.id}`, { method: 'DELETE' });
    closeModal();
    await fetchOrders(); // Refresh the list after deletion
  };

  // --- Modal Triggers ---
  const handleViewDetailsClick = (order: AdminOrder) => {
    openModal(`Order Details: ${order.id.substring(0, 8)}...`, () => <OrderDetails orderId={order.id} context='admin' />);
  };

  const handleDeleteClick = (order: AdminOrder) => {
    openModal("Confirm Deletion", () => <ConfirmDeleteModal itemName={`Order ${order.id.substring(0, 8)}`} itemType="Order" onConfirm={() => handleDelete(order)} />);
  };

  // --- Table Column Definitions ---
  const columns: Column<AdminOrder>[] = [
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
    { header: 'Date', accessor: 'created_at', cell: (item) => new Date(item.created_at).toLocaleDateString('en-US', { dateStyle: 'long' }) },
    { header: 'Total', accessor: 'total_amount', cell: (item) => <span class="font-semibold">{formatPrice(item.total_amount)}</span> },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (item) => (
        <div class="flex items-center gap-x-4">
          <button onClick={() => handleViewDetailsClick(item)} class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300" title="View Details">
            <AiOutlineEye class="size-5" />
          </button>
          <button onClick={() => handleDeleteClick(item)} class="text-red-500 hover:text-red-700 dark:hover:text-red-400" title="Delete Order">
            <AiOutlineDelete class="size-5" />
          </button>
        </div>
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

export default AdminOrdersPage;
import type { Component } from 'solid-js';
import { createSignal, For, onMount, Show } from 'solid-js';
import { A } from '@solidjs/router';
import ImageWithFallback from '../components/ImageWithFallback';
import DashboardLayout from '../layouts/DashboardLayout';
import { getOrders, type Order as StoredOrder } from '../services/orders';

// Importing high-quality icons to replace emojis
import { 
  AiOutlineSearch,
  AiOutlineFileDone,
  AiOutlineClockCircle,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineCalendar,
  AiOutlineEnvironment,
  AiOutlineDollar,
  AiOutlineStar,
  AiOutlineInbox
} from 'solid-icons/ai';
import { sendRequest } from '../utils/SendRequest';

type Order = StoredOrder;

const LoadingSpinner: Component = () => (
  <div class="col-span-full flex justify-center items-center h-96">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
  </div>
);

// --- REWRITTEN: Status badges with proper light/dark mode support ---
const getStatusClasses = (status: string) => {
switch (status) {
case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
case 'used': return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300';
case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300';
}
};

// --- REWRITTEN: Using Solid Icons for a professional look ---
const StatusIcon: Component<{ status: string }> = (props) => {
switch (props.status) {
case 'confirmed': return <AiOutlineCheckCircle class="size-4" />;
case 'pending': return <AiOutlineClockCircle class="size-4" />;
case 'used': return <AiOutlineFileDone class="size-4" />;
case 'cancelled': return <AiOutlineCloseCircle class="size-4" />;
default: return <AiOutlineFileDone class="size-4" />;
}
};





// --- Main Page Component ---
const OrderHistory: Component = () => {
  const [orders, setOrders] = createSignal<Order[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [apiError, setApiError] = createSignal<string | null>(null);

  const [filterStatus, setFilterStatus] = createSignal('all');
  const [searchQuery, setSearchQuery] = createSignal('');

  // --- API Function ---
  const fetchOrders = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // This calls a protected endpoint to get the logged-in user's orders
      const fetchedOrders = await sendRequest<Order[]>('/orders/my-orders');
      setOrders(fetchedOrders);
    } catch (err: any) {
      setApiError(err.message || 'Failed to load your orders.');
    } finally {
      setIsLoading(false);
    }
  };

  onMount(fetchOrders);

  const filteredOrders = () => {
    return orders().filter(order => {
      const matchesStatus = filterStatus() === 'all' || order.status === filterStatus();
      const search = searchQuery().toLowerCase();
      const matchesSearch = order.event_title.toLowerCase().includes(search) ||
                           order.venue.toLowerCase().includes(search) ||
                           order.id.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
  };

  // --- Helper Functions (Unchanged) ---
  const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const getTotalSpent = () => orders().reduce((total, order) => (order.status !== 'cancelled' ? total + order.totalPrice : total), 0);
  const getUpcomingEvents = () => orders().filter(order => new Date(order.eventDate) > new Date() && order.status === 'confirmed').length;

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'used', label: 'Used' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <DashboardLayout>
      <div class="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
        
        {/* --- Header: Cleaned up --- */}
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">My Orders</h1>
          <p class="mt-1 text-neutral-500 dark:text-neutral-400">Manage your ticket purchases and event history.</p>
        </div>

        {/* --- Stats Grid: Rewritten with solid cards and proper icons --- */}
        <Show when={!isLoading()}>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Orders" value={orders().length} icon={AiOutlineInbox} />
          <StatCard title="Upcoming Events" value={getUpcomingEvents()} icon={AiOutlineCalendar} />
          <StatCard title="Total Spent" value={formatPrice(getTotalSpent())} icon={AiOutlineDollar} />
        </div>
                </Show>


        <Show when={!isLoading()} fallback={<LoadingSpinner />}>
          <Show when={!apiError()} fallback={<p class="text-center text-red-500 mb-10">{apiError()}</p>}></Show>

        {/* --- Filters Section: Rewritten with professional styling --- */}
        <div class="mb-8 p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="relative flex-1">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <AiOutlineSearch class="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Search by Order ID, event, or venue..."
                class="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 py-2.5 pl-10 pr-4 text-sm text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-indigo-500 focus:ring-indigo-500"
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
              />
            </div>
            <select
              class="rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 py-2.5 pl-3 pr-8 text-sm text-neutral-800 dark:text-neutral-200 focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer"
              value={filterStatus()}
              onChange={(e) => setFilterStatus(e.currentTarget.value)}
            >
              <For each={statusOptions}>
                {(option) => <option value={option.value}>{option.label}</option>}
              </For>
            </select>
          </div>
        </div>

        {/* --- Orders Grid: Rewritten with professional cards --- */}
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <For each={filteredOrders()}>
            {(order) => (
              <div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden transition-shadow hover:shadow-lg">
                <div class="relative">
                  <ImageWithFallback class="w-full h-40 object-cover" src={order.image} alt={order.eventTitle} />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>
                <div class="p-5">
                  <div class="flex items-center justify-between mb-3">
                        <span class={`inline-flex items-center gap-2 ... ${getStatusClasses(order.status)}`}>
                          <StatusIcon status={order.status} /> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                    <span class="text-xs font-medium text-neutral-500 dark:text-neutral-400">ID: {order.id}</span>
                  </div>
                  <h3 class="font-bold text-lg text-neutral-800 dark:text-neutral-200 truncate">{order.eventTitle}</h3>
                  <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-4">{order.ticketType} &times; {order.quantity}</p>
                  <div class="space-y-2 text-sm text-neutral-600 dark:text-neutral-300 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                    <p class="flex items-center gap-3"><AiOutlineCalendar class="size-4 text-neutral-400" /><span>{formatDate(order.eventDate)}</span></p>
                    <p class="flex items-center gap-3"><AiOutlineEnvironment class="size-4 text-neutral-400" /><span>{order.venue}</span></p>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-xl font-bold text-neutral-800 dark:text-neutral-200">{formatPrice(order.totalPrice)}</span>
                    <A href={`/event/${order.eventId}`} class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
                      View Event
                    </A>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>

        {/* --- "No orders found" message: Themed and icon-driven --- */}
        {filteredOrders().length === 0 && (
          <div class="text-center py-16 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
            <AiOutlineInbox class="mx-auto text-6xl text-neutral-400 dark:text-neutral-500 mb-4" />
            <h3 class="text-xl font-semibold mb-2 text-neutral-800 dark:text-neutral-200">No Orders Found</h3>
            <p class="text-neutral-500 dark:text-neutral-400 mb-6">
              {searchQuery() || filterStatus() !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : "You haven't purchased any tickets yet."
              }
            </p>
            <A href="/dashboard" class="px-6 py-3 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
              Browse Events
            </A>
          </div>
        )}
        </Show>
      </div>
    </DashboardLayout>
  );
};

// --- Helper component for the stat cards to keep the main component clean ---
const StatCard: Component<{ title: string; value: string | number; icon: Component }> = (props) => {
  return (
    <div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-xl">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-lg flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50">
          <props.icon class="size-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">{props.title}</p>
          <p class="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{props.value}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
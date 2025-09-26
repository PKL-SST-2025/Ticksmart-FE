import { createSignal, onMount, Show, type Component } from 'solid-js';
import { A } from '@solidjs/router';
import DashboardLayout from '../../../layouts/DashboardLayout';
import Table, { type Column } from '../../../components/table/Table';
import { AiOutlinePlusCircle, AiOutlineEdit, AiOutlineBarChart, AiOutlineDelete, AiOutlineLoading } from 'solid-icons/ai';
import { useModal } from '../../../context/ModalContext';
import EventForm from '../../../components/forms/EventForm';
import ConfirmDeleteModal from '../../../components/modal/ConfirmDeleteModal';
import { sendRequest } from '../../../utils/SendRequest';

// --- Type Definitions ---
type EventSummary = {
  id: number;
  title: string;
  status: 'draft' | 'published' | 'on_sale' | 'sold_out' | 'completed' | 'cancelled';
  start_time: string;
};

type EventDetail = {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string | null;
  venue_id: number | null;
  segment_id: number | null;
  genre_id: number | null;
  status: 'draft' | 'published' | 'on_sale';
  tiers: any[];
};

// --- Components ---
const StatusBadge: Component<{ status: EventSummary['status'] }> = (props) => {
  const statusClasses = () => {
    switch (props.status) {
      case 'on_sale': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'published': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'sold_out': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'draft': return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300';
      case 'completed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300';
    }
  };
  return (
    <span class={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${statusClasses()}`}>
      {props.status.charAt(0).toUpperCase() + props.status.slice(1).replace('_', ' ')}
    </span>
  );
};

const LoadingSpinner: Component = () => (
  <div class="flex justify-center items-center h-64">
    <AiOutlineLoading class="animate-spin size-8 text-indigo-500" />
  </div>
);

// --- Main Page ---
const OrganizerEvents: Component = () => {
  const { openModal, closeModal } = useModal();
  const [events, setEvents] = createSignal<EventSummary[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [apiError, setApiError] = createSignal<string | null>(null);

  // --- API Fetch ---
  const fetchEvents = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const fetchedEvents = await sendRequest<EventSummary[]>('/organizer/events');
      // Ensure we pass the array, not wrapped in { data: [...] }
      setEvents(fetchedEvents);
    } catch (err: any) {
      setApiError(err.message || 'Failed to fetch your events.');
    } finally {
      setIsLoading(false);
    }
  };

  onMount(fetchEvents);

  // --- Event Handlers ---
  const handleFormSuccess = async () => {
    closeModal();
    await fetchEvents();
  };

  const handleCreateClick = () => {
    openModal('Create a New Event', () => <EventForm onSubmit={handleFormSuccess} />);
  };

  const handleEditClick = async (eventSummary: EventSummary) => {
    try {
      const eventDetail = await sendRequest<EventDetail>(`/events/${eventSummary.id}`);
      openModal(`Edit: ${eventSummary.title}`, () => <EventForm initialData={eventDetail} onSubmit={handleFormSuccess} />);
    } catch (err: any) {
      setApiError(`Failed to load event details: ${err.message}`);
    }
  };

  const handleDeleteClick = (event: EventSummary) => {
    openModal('Confirm Deletion', () => (
      <ConfirmDeleteModal
        itemName={event.title}
        onConfirm={async () => {
          await sendRequest(`/organizer/events/${event.id}`, { method: 'DELETE' });
          closeModal();
          await fetchEvents();
        }}
      />
    ));
  };

  // --- Table Columns ---
  const columns: Column<EventSummary>[] = [
    { header: 'Event Title', accessor: 'title' },
    { header: 'Status', accessor: 'status', cell: (item) => <StatusBadge status={item.status} /> },
    { header: 'Event Date', accessor: 'start_time', cell: (item) => new Date(item.start_time).toLocaleDateString('en-US', { dateStyle: 'long' }) },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (item) => (
        <div class="flex items-center gap-x-4">
          <button onClick={() => handleEditClick(item)} class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300" title="Edit Event">
            <AiOutlineEdit class="size-5" />
          </button>
          <A href={`/organizer/events/${item.id}/analytics`} class="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300" title="View Analytics">
            <AiOutlineBarChart class="size-5" />
          </A>
          <button onClick={() => handleDeleteClick(item)} class="text-red-500 hover:text-red-700 dark:hover:text-red-400" title="Delete Event">
            <AiOutlineDelete class="size-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div class="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">My Events</h1>
            <p class="mt-1 text-neutral-500 dark:text-neutral-400">Manage all your created events in one place.</p>
          </div>
          <button type="button" onClick={handleCreateClick} class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
            <AiOutlinePlusCircle /> Create Event
          </button>
        </div>

        <Show when={apiError()}><div class="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">{apiError()}</div></Show>

        <Show when={!isLoading()} fallback={<LoadingSpinner />}>
          <div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
            <Table data={events()} columns={columns} itemsPerPage={10} />
          </div>
        </Show>
      </div>
    </DashboardLayout>
  );
};

export default OrganizerEvents;

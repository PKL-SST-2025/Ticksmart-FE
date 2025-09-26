import type { Component } from 'solid-js';
import { createSignal, onMount, For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import DashboardLayout from '../../../layouts/DashboardLayout';
import Table, { type Column } from '../../../components/table/Table';
import CreateEventForm from '../../../components/forms/EventForm';
import ConfirmDeleteModal from '../../../components/modal/ConfirmDeleteModal';
import { useModal } from '../../../context/ModalContext';
import { sendRequest } from '../../../utils/SendRequest';

import { AiOutlinePlusCircle, AiOutlineEdit, AiOutlineBarChart, AiOutlineDelete, AiOutlineLoading } from 'solid-icons/ai';
import EventForm from '../../../components/forms/EventForm';

// --- Type Definition for the Admin view of an Event ---
// In a real app, your backend would provide these joined fields
// Summary view for the table
type AdminEventSummary = {
  id: number;
  title: string;
  organizer_name: string;
  venue_name: string | null;
  status: 'draft' | 'published' | 'on_sale' | 'sold_out' | 'completed' | 'cancelled';
  start_time: string;
};

// Detailed view for the edit form (matches the backend Event struct)
type AdminEventDetail = {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string | null;
  venue_id: number | null;
  segment_id: number | null;
  genre_id: number | null;
  status: 'draft' | 'published' | 'on_sale';
  tiers: any[]; // Add tiers if your edit form handles them
};


const StatusBadge: Component<{ status: AdminEventSummary['status'] }> = (props) => {
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
      {props.status.replace('_', ' ').charAt(0).toUpperCase() + props.status.slice(1).replace('_', ' ')}
    </span>
  );
};

const LoadingSpinner: Component = () => (
  <div class="flex justify-center items-center h-64">
    <AiOutlineLoading class="animate-spin size-8 text-indigo-500" />
  </div>
);

const AdminEventsPage: Component = () => {
  const { openModal, closeModal } = useModal();
  const [events, setEvents] = createSignal<AdminEventSummary[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [apiError, setApiError] = createSignal<string | null>(null);

  
  // --- API Functions ---
  const fetchEvents = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const fetchedEvents = await sendRequest<AdminEventSummary[]>('/admin/events');
      setEvents(fetchedEvents);
    } catch (err: any) {
      setApiError(err.message || 'Failed to fetch events.');
    } finally {
      setIsLoading(false);
    }
  };

  onMount(fetchEvents);

  const handleCreate = async (formData: any) => {
    await sendRequest('/admin/events', { method: 'POST', body: formData });
    closeModal();
    await fetchEvents();
  };
  
  const handleUpdate = async (formData: any) => {
    await sendRequest(`/admin/events/${formData.id}`, { method: 'PATCH', body: formData });
    closeModal();
    await fetchEvents();
  };
  
  const handleDelete = async (eventId: number) => {
    await sendRequest(`/admin/events/${eventId}`, { method: 'DELETE' });
    closeModal();
    await fetchEvents();
  };

  // --- Modal Triggers ---
  const handleCreateClick = () => {
    // --- THE FIX: Pass the isAdmin prop to the form ---
    openModal("Create New Event", () => <EventForm onSubmit={handleCreate} isAdmin={true} />);
  };

  const handleEditClick = async (eventSummary: AdminEventSummary) => {
    try {
      const eventDetail = await sendRequest<AdminEventDetail>(`/admin/events/${eventSummary.id}`);
      // --- THE FIX: Pass the isAdmin prop to the form ---
      openModal(`Edit: ${eventSummary.title}`, () => <EventForm onSubmit={handleUpdate} initialData={eventDetail} isAdmin={true} />);
    } catch (err: any) {
      setApiError(`Failed to load event details: ${err.message}`);
    }
  };

  const handleDeleteClick = (event: AdminEventSummary) => {
    openModal("Confirm Deletion", () => <ConfirmDeleteModal itemName={event.title} onConfirm={() => handleDelete(event.id)} />);
  };


  // --- Table Column Definitions ---
  const columns: Column<AdminEventSummary>[] = [
    { 
      header: 'Event', 
      accessor: 'title',
      cell: (item) => (
        <div>
          <p class="font-semibold text-neutral-800 dark:text-neutral-200">{item.title}</p>
          <p class="text-xs text-neutral-500">{item.venue_name || 'No venue assigned'}</p>
        </div>
      )
    },
    { header: 'Organizer', accessor: 'organizer_name' },
    { header: 'Status', accessor: 'status', cell: (item) => <StatusBadge status={item.status} /> },
    { header: 'Date', accessor: 'start_time', cell: (item) => new Date(item.start_time).toLocaleDateString('en-US', { dateStyle: 'long' }) },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (item) => (
        <div class="flex items-center gap-x-4">
          <button onClick={() => handleEditClick(item)} class="text-indigo-600 hover:text-indigo-800" title="Edit Event"><AiOutlineEdit class="size-5" /></button>
          <button onClick={() => handleDeleteClick(item)} class="text-red-500 hover:text-red-700" title="Delete Event"><AiOutlineDelete class="size-5" /></button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div class="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Manage Events</h1>
            <p class="mt-1 text-neutral-500 dark:text-neutral-400">Oversee all events on the platform.</p>
          </div>
          <button onClick={handleCreateClick} class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
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

export default AdminEventsPage;
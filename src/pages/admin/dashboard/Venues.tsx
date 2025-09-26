import type { Component } from 'solid-js';
import { createSignal, onMount, For, Show } from 'solid-js';
import DashboardLayout from '../../../layouts/DashboardLayout';
import Table, { type Column } from '../../../components/table/Table';
import VenueForm from '../../../components/forms/VenueForm';
import ConfirmDeleteModal from '../../../components/modal/ConfirmDeleteModal';
import { useModal } from '../../../context/ModalContext';
import { sendRequest } from '../../../utils/SendRequest';
import { AiOutlinePlusCircle, AiOutlineEdit, AiOutlineDelete, AiOutlineLoading } from 'solid-icons/ai';
import { Venue } from '../../../types/models';



const StatusBadge: Component<{ isActive: boolean }> = (props) => (
  <span class={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${
    props.isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
      : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300'
  }`}>
    {props.isActive ? 'Active' : 'Inactive'}
  </span>
);


// --- A Simple Loading Spinner Component ---
const LoadingSpinner: Component = () => (
  <div class="flex justify-center items-center h-full">
    <AiOutlineLoading class="animate-spin size-8 text-indigo-500" />
  </div>
);


const AdminVenuesPage: Component = () => {
  const { openModal, closeModal } = useModal();
  const [venues, setVenues] = createSignal<Venue[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [apiError, setApiError] = createSignal<string | null>(null);

  // --- API Functions ---
  const fetchVenues = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // --- THE FIX: Call the correct, namespaced admin endpoint ---
      const fetchedVenues = await sendRequest<Venue[]>('/admin/venues');
      setVenues(fetchedVenues);
    } catch (err: any) {
      setApiError(err.message || 'Failed to fetch venues.');
    } finally {
      setIsLoading(false);
    }
  };

  onMount(fetchVenues);

  const handleCreate = async (formData: Partial<Venue>) => {
    // --- THE FIX: Call the correct, namespaced admin endpoint ---
    await sendRequest('/admin/venues', { method: 'POST', body: formData });
    closeModal();
    await fetchVenues();
  };
  
  const handleUpdate = async (formData: Partial<Venue>) => {
    // --- THE FIX: Call the correct, namespaced admin endpoint ---
    await sendRequest(`/admin/venues/${formData.id}`, { method: 'PATCH', body: formData });
    closeModal();
    await fetchVenues();
  };
  
  const handleDelete = async (venueId: number) => {
    // --- THE FIX: Call the correct, namespaced admin endpoint ---
    await sendRequest(`/admin/venues/${venueId}`, { method: 'DELETE' });
    closeModal();
    await fetchVenues();
  };

  // --- Modal Triggers ---
  const handleCreateClick = () => {
    openModal("Create New Venue", () => <VenueForm onSubmit={handleCreate} isAdmin={true} />);
  };
  const handleEditClick = (venue: Venue) => {
    openModal(`Edit: ${venue.name}`, () => <VenueForm onSubmit={handleUpdate} initialData={venue} isAdmin={true} />);
  };
  const handleDeleteClick = (venue: Venue) => {
    openModal("Confirm Deletion", () => <ConfirmDeleteModal itemName={venue.name} itemType="Venue" onConfirm={() => handleDelete(venue.id)} />);
  };

  // --- Table Column Definitions ---
  const columns: Column<Venue>[] = [
    { header: 'Venue Name', accessor: 'name' },
    { header: 'Location', accessor: 'city', cell: (item) => `${item.city}, ${item.country}` },
    { header: 'Capacity', accessor: 'capacity', cell: (item) => item.capacity?.toLocaleString() || 'N/A' },
    { header: 'Status', accessor: 'is_active', cell: (item) => <StatusBadge isActive={item.is_active} /> },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (item) => (
        <div class="flex items-center gap-x-4">
          <button type="button" onClick={() => handleEditClick(item)} class="text-indigo-600 hover:text-indigo-800" title="Edit Venue"><AiOutlineEdit class="size-5" /></button>
          <button type="button" onClick={() => handleDeleteClick(item)} class="text-red-500 hover:text-red-700" title="Delete Venue"><AiOutlineDelete class="size-5" /></button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div class="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Manage Venues</h1>
            <p class="mt-1 text-neutral-500 dark:text-neutral-400">Add, edit, and manage all event venues on the platform.</p>
          </div>
          <button onClick={handleCreateClick} class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
            <AiOutlinePlusCircle /> Create Venue
          </button>
        </div>

        <Show when={apiError()}><div class="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">{apiError()}</div></Show>
        
        <Show when={!isLoading()} fallback={<LoadingSpinner />}>
          <Table data={venues()} columns={columns} itemsPerPage={10} />
        </Show>
      </div>
    </DashboardLayout>
  );
};

export default AdminVenuesPage;
import type { Component } from 'solid-js';
import { createSignal, For, onMount, Show } from 'solid-js';
import DashboardLayout from '../../../layouts/DashboardLayout';
import VenueMap from '../../../components/map/VenueMap';
import VenueForm from '../../../components/forms/VenueForm';
import ConfirmDeleteModal from '../../../components/modal/ConfirmDeleteModal'; // Import the delete modal
import { useModal } from '../../../context/ModalContext';
import { AiOutlinePlusCircle, AiOutlineEdit, AiOutlineDelete, AiOutlineLoading } from 'solid-icons/ai';
import { sendRequest } from '../../../utils/SendRequest';

type Venue = {
  id: number; name: string; address_line_1: string; city: string; capacity: number; latitude: number; longitude: number;
};

// --- A Simple Loading Spinner Component ---
const LoadingSpinner: Component = () => (
  <div class="flex justify-center items-center h-full">
    <AiOutlineLoading class="animate-spin size-8 text-indigo-500" />
  </div>
);


const OrganizerVenues: Component = () => {
  const { openModal, closeModal } = useModal();
  const [venues, setVenues] = createSignal<Venue[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [apiError, setApiError] = createSignal<string | null>(null);
  const [selectedVenueId, setSelectedVenueId] = createSignal<number | null>(null);

  // --- API Functions ---
  const fetchVenues = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const fetchedVenues = await sendRequest<Venue[]>('/venues');
      setVenues(fetchedVenues);
    } catch (err: any) {
      setApiError(err.message || 'Failed to fetch venues.');
    } finally {
      setIsLoading(false);
    }
  };

  onMount(fetchVenues);

  const handleCreateSuccess = async (formData: any) => {
    // The form gives us the data, this function sends it to the API
    await sendRequest('/organizer/venues', {
      method: 'POST',
      body: formData,
    });
    closeModal();
    await fetchVenues(); // Refresh the list
  };
  
  const handleEditSuccess = async (formData: any) => {
    await sendRequest(`/organizer/venues/${formData.id}`, {
      method: 'PATCH',
      body: formData,
    });
    closeModal();
    await fetchVenues(); // Refresh the list
  };
  
  const handleDeleteConfirm = async (venueId: number) => {
    await sendRequest(`/organizer/venues/${venueId}`, {
      method: 'DELETE',
    });
    closeModal();
    await fetchVenues(); // Refresh the list
  };

  // --- Modal Trigger Handlers ---
  const handleCreateClick = () => {
    openModal("Create New Venue", () => <VenueForm onSubmit={handleCreateSuccess} />);
  };

  const handleEditClick = (venue: Venue) => {
    openModal("Edit Venue", () => <VenueForm onSubmit={handleEditSuccess} initialData={venue} />);
  };
  
  const handleDeleteClick = (venue: Venue) => {
    openModal("Confirm Deletion", () => <ConfirmDeleteModal itemName={venue.name} onConfirm={() => handleDeleteConfirm(venue.id)} />);
  };

  return (
    <DashboardLayout>
      <div class="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">My Venues</h1>
            <p class="mt-1 text-neutral-500 dark:text-neutral-400">Manage your event locations.</p>
          </div>
          <button onClick={handleCreateClick} class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
            <AiOutlinePlusCircle /> Create Venue
          </button>
        </div>
        
        <Show when={apiError()}>
          <div class="mb-4 p-4 bg-red-100 border border-red-200 text-red-800 rounded-lg">
            <p class="font-semibold">An error occurred:</p>
            <p>{apiError()}</p>
          </div>
        </Show>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[75vh]">
          <Show when={!isLoading()} fallback={<div class="lg:col-span-3"><LoadingSpinner /></div>}>
            <div class="lg:col-span-1 h-full overflow-y-auto space-y-4 pr-2">
              <For each={venues()} fallback={<p class="text-center text-neutral-500">No venues created yet.</p>}>
                {(venue) => (
                  <div
                    class="bg-white dark:bg-neutral-800 border dark:border-neutral-700 p-4 rounded-lg cursor-pointer transition-all"
                    classList={{ 'border-indigo-500 ring-2 ring-indigo-500': selectedVenueId() === venue.id, 'border-neutral-200': selectedVenueId() !== venue.id }}
                    onClick={() => setSelectedVenueId(venue.id)}
                  >
                    <div class="flex justify-between items-start">
                      <div>
                        <h3 class="font-semibold text-neutral-800 dark:text-neutral-200">{venue.name}</h3>
                        <p class="text-sm text-neutral-500 dark:text-neutral-400">{venue.city}</p>
                      </div>
                      <div class="flex items-center gap-x-3">
                        <button onClick={(e) => { e.stopPropagation(); handleEditClick(venue); }} class="text-neutral-400 hover:text-indigo-600" title="Edit Venue"><AiOutlineEdit class="size-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(venue); }} class="text-neutral-400 hover:text-red-600" title="Delete Venue"><AiOutlineDelete class="size-4" /></button>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
            <div class="lg:col-span-2 h-full">
              <VenueMap venues={venues()} selectedVenueId={selectedVenueId()} />
            </div>
          </Show>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrganizerVenues;
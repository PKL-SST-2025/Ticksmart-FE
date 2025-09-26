import type { Component } from 'solid-js';
import { createSignal, For, onMount, Show } from 'solid-js';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useModal } from '../../../context/ModalContext';
import { sendRequest } from '../../../utils/SendRequest';
import AttractionForm from '../../../components/forms/AttractionForm';
import ConfirmDeleteModal from '../../../components/modal/ConfirmDeleteModal';
import ImageWithFallback from '../../../components/ImageWithFallback';
import { AiOutlinePlusCircle, AiOutlineEdit, AiOutlineDelete, AiOutlineLoading } from 'solid-icons/ai';

// Type definition matches the Rust backend struct
// --- Type Definition based on your Rust 'Attraction' struct ---
export type Attraction = {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  type: 'music' | 'speaker' | 'comedy' | 'special_guest';
};

const LoadingSpinner: Component = () => (
  <div class="flex justify-center items-center h-64">
    <AiOutlineLoading class="animate-spin size-8 text-indigo-500" />
  </div>
);

const OrganizerAttractions: Component = () => {
  const { openModal, closeModal } = useModal();
  const [attractions, setAttractions] = createSignal<Attraction[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [apiError, setApiError] = createSignal<string | null>(null);

  // --- API Functions ---
  const fetchAttractions = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // --- THE FIX: Call the correct, namespaced organizer endpoint ---
      const fetched = await sendRequest<Attraction[]>('/organizer/attractions');
      setAttractions(fetched);
    } catch (err: any) {
      setApiError(err.message || 'Failed to fetch your attractions.');
    } finally {
      setIsLoading(false);
    }
  };

  onMount(fetchAttractions);

  const handleCreate = async (formData: Partial<Attraction>) => {
    // --- THE FIX: Call the correct, namespaced organizer endpoint ---
    await sendRequest('/organizer/attractions', { method: 'POST', body: formData });
    closeModal();
    await fetchAttractions();
  };
  
  const handleEdit = async (formData: Partial<Attraction>) => {
    // --- THE FIX: Call the correct, namespaced organizer endpoint ---
    await sendRequest(`/organizer/attractions/${formData.id}`, { method: 'PATCH', body: formData });
    closeModal();
    await fetchAttractions();
  };
  
  const handleDelete = async (attractionId: number) => {
    // --- THE FIX: Call the correct, namespaced organizer endpoint ---
    await sendRequest(`/organizer/attractions/${attractionId}`, { method: 'DELETE' });
    closeModal();
    await fetchAttractions();
  };
  // --- Modal Triggers ---
  const handleCreateClick = () => {
    openModal("Create New Attraction", () => <AttractionForm onSubmit={handleCreate} />);
  };
  const handleEditClick = (attraction: Attraction) => {
    openModal("Edit Attraction", () => <AttractionForm onSubmit={handleEdit} initialData={attraction} />);
  };
  const handleDeleteClick = (attraction: Attraction) => {
    openModal("Confirm Deletion", () => <ConfirmDeleteModal itemType="Attraction" itemName={attraction.name} onConfirm={() => handleDelete(attraction.id)} />);
  };
  
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'music': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'speaker': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'comedy': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'special_guest': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300';
    }
  }

  return (
    <DashboardLayout>
      <div class="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Attractions</h1>
            <p class="mt-1 text-neutral-500 dark:text-neutral-400">Manage artists, speakers, and performers for your events.</p>
          </div>
          <button onClick={handleCreateClick} class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
            <AiOutlinePlusCircle /> Add Attraction
          </button>
        </div>
        
        <Show when={apiError()}><div class="mb-4 p-4 bg-red-100 border border-red-200 text-red-800 rounded-lg">{apiError()}</div></Show>

        <Show when={!isLoading()} fallback={<LoadingSpinner />}>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <For each={attractions()} fallback={<p class="col-span-full text-center text-neutral-500 py-16">No attractions have been added yet.</p>}>
              {(attraction) => (
                <div class="group bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden flex flex-col">
                  <div class="relative">
                    <ImageWithFallback class="w-full h-48 object-cover" src={attraction.image_url!} alt={attraction.name} />
                    {/* --- SUPERIOR HOVER ACTIONS --- */}
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button onClick={() => handleEditClick(attraction)} class="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors" title="Edit">
                        <AiOutlineEdit class="size-5" />
                      </button>
                      <button onClick={() => handleDeleteClick(attraction)} class="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors" title="Delete">
                        <AiOutlineDelete class="size-5" />
                      </button>
                    </div>
                  </div>
                  <div class="p-4 flex flex-col flex-grow">
                    <div class="flex-grow">
                      <span class={`text-xs font-semibold px-2.5 py-1 rounded-full ${getTypeColor(attraction.type)}`}>
                        {attraction.type.replace('_', ' ')}
                      </span>
                      <h3 class="mt-2 font-semibold text-lg text-neutral-800 dark:text-neutral-200 truncate">{attraction.name}</h3>
                      <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 min-h-[2.5rem]">
                        {attraction.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </DashboardLayout>
  );
};

export default OrganizerAttractions;
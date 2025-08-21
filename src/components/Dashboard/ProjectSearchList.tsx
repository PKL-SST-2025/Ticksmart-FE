import { createSignal, For, createMemo, createEffect, Show } from 'solid-js';
import type { Component } from 'solid-js';
import { IoSearch } from 'solid-icons/io';
import { ProjectListItem } from './ProjectListItem'; // Corrected ProjectListItem import
import { sendRequest } from '../../utils/SendRequest'; // Import sendRequest
import { TbLoader, TbAlertTriangle } from 'solid-icons/tb'; // For loading/error

// --- API Data Structure matching ProjectResponseListItem from backend ---
interface ApiProjectResponseListItem {
    id: number;
    project_name: string;
    business_name: string | null;
    description: string | null;
    owner_user_id: number;
    created_at: string;
    is_owner: boolean;
}

export const ProjectSearchList: Component = () => {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [searchResults, setSearchResults] = createSignal<ApiProjectResponseListItem[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Debounce the search query to avoid too many API calls
  let debounceTimeout: number;
  createEffect(() => {
    // Clear any previous timeout
    clearTimeout(debounceTimeout);

    // If query is empty, clear results and don't search
    if (searchQuery().trim() === '') {
      setSearchResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Set a new timeout to fetch data after a delay
    debounceTimeout = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Call the backend search API
        const data = await sendRequest<ApiProjectResponseListItem[]>(`/projects/search?q=${encodeURIComponent(searchQuery())}`);
        setSearchResults(data);
      } catch (err: any) {
        console.error("Error searching projects:", err);
        setError(err.message || "Failed to search projects.");
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce
  });

  return (
    <div class="w-full max-w-5xl lg:min-w-5xl p-4 rounded-xl border border-gray-700/80 bg-gray-800/60 backdrop-blur-sm flex flex-col h-[27rem]">
      {/* Search Bar */}
      <div class="relative mb-4">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <IoSearch class="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search here..."
          value={searchQuery()}
          onInput={(e) => setSearchQuery(e.currentTarget.value)}
          class="w-full bg-gray-900/70 border border-gray-700 text-white rounded-lg p-2.5 pl-10 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Scrollable Project List */}
      <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <Show when={isLoading()} fallback={
            <Show when={!error()} fallback={
                <div class="text-red-400 text-sm p-4 text-center">
                    <TbAlertTriangle class="inline mr-1"/>{error()}
                </div>
            }>
                <Show when={searchResults().length > 0} fallback={
                    <div class="text-gray-500 italic p-4 text-center">
                        <Show when={searchQuery().trim() === ''} fallback="No projects match your search.">
                            Type to search for projects.
                        </Show>
                    </div>
                }>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <For each={searchResults()}>
                            {(project) => (
                                <ProjectListItem
                                    project={{
                                        id: project.id,
                                        project_name: project.project_name,
                                        business_name: project.business_name,
                                        description: project.description,
                                        href: `/dashboard/project/${project.id}`, // Build dynamic URL
                                    }}
                                />
                            )}
                        </For>
                    </div>
                </Show>
            </Show>
        }>
            <div class="flex justify-center items-center h-full">
                <TbLoader class="w-8 h-8 animate-spin text-gray-400" />
            </div>
        </Show>
      </div>
    </div>
  );
};
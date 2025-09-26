import type { Component } from 'solid-js';
import { createSignal, For, onMount } from 'solid-js';
import { A } from '@solidjs/router';
import ImageWithFallback from '../components/ImageWithFallback';
import DashboardLayout from '../layouts/DashboardLayout';
import { events as allEvents } from '../data/events';

// --- NEW: Importing all necessary icons ---
import { 
  AiOutlineSearch, 
  AiOutlineFire,
  AiOutlineCalendar,
  AiOutlineEnvironment,
  AiOutlineInbox,
  AiOutlinePicCenter
} from 'solid-icons/ai';
import { sendRequest } from '../utils/SendRequest';

// --- NEW: Type Definition to match the backend's EventCardData struct ---
type EventCardData = {
  id: number;
  title: string;
  start_time: string; // ISO string from backend
  price_min: number | null;
  artist_name: string | null;
  venue_name: string | null;
  location: string | null;
  image_url: string | null;
  // We'll add genre on the frontend for now, but it could come from the backend
  genre?: string; 
};

const LoadingSpinner: Component = () => (
  <div class="col-span-full flex justify-center items-center h-96">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
  </div>
);

const Dashboard: Component = () => {
  const [events, setEvents] = createSignal<EventCardData[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [apiError, setApiError] = createSignal<string | null>(null);

  const [searchQuery, setSearchQuery] = createSignal('');
  const [selectedGenre, setSelectedGenre] = createSignal('all');

  // --- API Function ---
  const fetchEvents = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // This calls your public GET /api/events endpoint
      const fetchedEvents = await sendRequest<EventCardData[]>('/events');
      // For demo, we'll add a genre client-side
      const eventsWithGenre = fetchedEvents.map((e, i) => ({ ...e, genre: genres[i % (genres.length - 1) + 1] }));
      setEvents(eventsWithGenre);
    } catch (err: any) {
      setApiError(err.message || 'Failed to load events.');
    } finally {
      setIsLoading(false);
    }
  };

  onMount(fetchEvents);

  const filteredEvents = () => {
    return events().filter(event => {
      const search = searchQuery().toLowerCase();
      const matchesSearch = (event.title?.toLowerCase().includes(search)) ||
                           (event.artist_name?.toLowerCase().includes(search)) ||
                           (event.venue_name?.toLowerCase().includes(search));
      const matchesGenre = selectedGenre() === 'all' || event.genre === selectedGenre();
      return matchesSearch && matchesGenre;
    });
  };

  const genres = ['all', 'indie', 'pop', 'rock', 'jazz', 'electronic', 'classical', 'hiphop', 'folk'];
  const formatPrice = (price: number | null) => {
    if (price === null) return "Free";
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { dateStyle: 'long' });

  return (
    <DashboardLayout>
      <div class="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
        
        {/* --- Hero Section --- */}
        <div class="mb-8 p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
          <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div class="flex-1">
              <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-800 dark:text-neutral-200">
                Find your next event
              </h1>
              <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                Currently showing events in: <span class="font-medium text-neutral-700 dark:text-neutral-300">{"??"}</span>
              </p>
            </div>
            <div class="w-full md:w-auto md:min-w-[380px]">
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <AiOutlineSearch class="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search events, artists, or venues..."
                  class="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 
                         py-2.5 pl-10 pr-4 text-sm text-neutral-800 dark:text-neutral-200 
                         placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                         focus:border-indigo-500 focus:ring-indigo-500"
                  value={searchQuery()}
                  onInput={(e) => setSearchQuery(e.currentTarget.value)}
                />
              </div>
            </div>
          </div>
          <div class="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
            <For each={genres}>
              {(genre) => (
                <button
                  onClick={() => setSelectedGenre(genre)}
                  class="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer" // Added cursor-pointer
                  classList={{
                    'bg-indigo-600 text-white hover:bg-indigo-700': selectedGenre() === genre,
                    'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600': selectedGenre() !== genre,
                  }}
                >
                  {genre === 'all' ? 'All Genres' : genre.charAt(0).toUpperCase() + genre.slice(1)}
                </button>
              )}
            </For>
          </div>
        </div>

        {/* --- Event Grid --- */}
        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4 flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
            <AiOutlineFire class="text-indigo-500" />
            <span>Popular in Indonesia</span>
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <For each={filteredEvents()}>
              {(event) => (
                <A href={`/event/${event.id}`} class="group block">
                  <div class="h-full flex flex-col overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 
                              bg-white dark:bg-neutral-800 transition-all duration-300
                              hover:border-indigo-500 hover:shadow-lg hover:-translate-y-1">
                    <div class="relative">
                          <ImageWithFallback src={event.image_url!} alt={event.title} class="w-full h-48 object-cover" />
                      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </div>
                    <div class="p-4 flex flex-col flex-grow justify-between">
                      <div>
                        <h3 class="font-semibold text-lg mb-1 truncate text-neutral-800 dark:text-neutral-200">{event.title}</h3>
                        <p class="text-neutral-500 dark:text-neutral-400 text-sm mb-4">{event.artist_name}</p>
                        {/* --- NEW: Modernized with Solid Icons --- */}
                        <div class="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <p class="flex items-center gap-2.5">
                            <AiOutlineCalendar class="size-4 text-neutral-400" />
                            <span>{formatDate(event.start_time)}</span>
                          </p>
                          <p class="flex items-center gap-2.5">
                            <AiOutlineEnvironment class="size-4 text-neutral-400" />
                            <span class="truncate">{event.venue_name}</span>
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center justify-between pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-700">
                        <span class="text-lg font-bold text-neutral-800 dark:text-neutral-200">{event.price_min}</span>
                        <button class="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer">Buy Tickets</button>
                      </div>
                    </div>
                  </div>
                </A>
              )}
            </For>
          </div>
        </div>

        {/* --- "No events found" message: Modernized --- */}
        {filteredEvents().length === 0 && (
          <div class="text-center py-16 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl">
            <AiOutlineInbox class="mx-auto text-6xl text-neutral-400 dark:text-neutral-500 mb-4" />
            <h3 class="text-xl font-semibold mb-2 text-neutral-800 dark:text-neutral-200">No Events Found</h3>
            <p class="text-neutral-500 dark:text-neutral-400">Try adjusting your search or filter criteria.</p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
import type { Component } from 'solid-js';
import { createMemo, createResource, createSignal, For, Show } from 'solid-js';
import { useParams, A } from '@solidjs/router';
import ImageWithFallback from '../components/ImageWithFallback';
import DashboardLayout from '../components/DashboardLayout';
import { getEventById } from '../data/events';

// --- Importing high-quality icons ---
import { 
  AiOutlineArrowLeft, 
  AiOutlineCalendar, 
  AiOutlineEnvironment, 
  AiOutlineClockCircle, 
  AiOutlineUser,
  AiOutlinePlus,
  AiOutlineMinus,
  AiOutlineLeft,
  AiOutlineRight
} from 'solid-icons/ai';
import { sendRequest } from '../utils/SendRequest';

// --- Type Definitions ---
interface TicketType { id: string; name: string; price: number; description: string; available: number; }
interface TimeSlot { id: string; startTime: string; endTime: string; available: boolean; }

// --- Sub-components for a Cleaner Main Component ---
const InfoCard: Component<{ label: string; value: string; icon: Component; subValue?: string }> = (props) => (
  <div class="flex items-center gap-4">
    <div class="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
      <props.icon class="size-6 text-indigo-600 dark:text-indigo-400" />
    </div>
    <div>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">{props.label}</p>
      <p class="font-semibold text-neutral-800 dark:text-neutral-200">{props.value}</p>
      <Show when={props.subValue}><p class="text-sm text-neutral-500 dark:text-neutral-400">{props.subValue}</p></Show>
    </div>
  </div>
);

const TicketOption: Component<{ offer: Offer; selected: boolean; onSelect: () => void }> = (props) => {
  const available = () => props.offer.quantity_for_sale;
  return (
    <div
      class="p-4 border rounded-lg transition-all"
      classList={{
        'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500 dark:bg-indigo-900/50 dark:border-indigo-600': props.selected,
        'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700': !props.selected,
        'opacity-60 cursor-not-allowed': available() <= 0,
        'cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600': available() > 0,
      }}
      onClick={() => available() > 0 && props.onSelect()}
    >
      <div class="flex justify-between items-start mb-1">
        <h3 class="font-semibold text-neutral-800 dark:text-neutral-200">{props.offer.name}</h3>
        <span class="font-bold text-indigo-600 dark:text-indigo-400">{formatPrice(props.offer.price)}</span>
      </div>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-2">{props.offer.description}</p>
      <span class={`text-xs font-medium ${available() > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {available() > 0 ? `${available()} available` : 'Sold out'}
      </span>
    </div>
  );
};

// --- Helper Functions ---
const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });


const LoadingSkeleton: Component = () => (
  <div class="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto animate-pulse">
    <div class="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded-md mb-8"></div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-8">
        <div class="w-full h-96 bg-neutral-200 dark:bg-neutral-700 rounded-xl"></div>
        <div class="bg-neutral-200 dark:bg-neutral-700 rounded-xl p-6 h-64"></div>
      </div>
      <div class="lg:col-span-1"><div class="sticky top-8 h-[500px] bg-neutral-200 dark:bg-neutral-700 rounded-xl"></div></div>
    </div>
  </div>
);
// --- THIS IS THE FIX (Part 1): Correct Type Definitions ---
// These types now PERFECTLY match the flat JSON structure from your backend.
type Offer = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  quantity_for_sale: number;
  quantity_sold: number;
};
type Tier = {
  id: number;
  name: string;
  description: string | null;
  total_inventory: number;
  offers: Offer[];
};
type EventDetailData = {
  id: number;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  venue_name: string | null;
  location: string | null;
  artist_name: string | null;
  image_url: string | null;
  gallery: string[]; // Assuming this is part of the event data
  tiers: Tier[];
};

const EventDetail: Component = () => {
  const params = useParams();
  
  const [eventData] = createResource(
    () => params.id,
    async (eventId) => {
      if (!eventId) throw new Error("Event ID is missing.");
      return sendRequest<EventDetailData>(`/events/${eventId}`);
    }
  );

  const [selectedOfferId, setSelectedOfferId] = createSignal<number | null>(null);
  const [quantity, setQuantity] = createSignal(1);
  const [currentIndex, setCurrentIndex] = createSignal(0);

  const galleryImages = createMemo(() => {
    const data = eventData();
    if (!data) return [];
    // Assuming gallery is a separate field for now. If it's part of the main image, adjust as needed.
    return [data.image_url, ...(data.gallery || [])].filter(Boolean) as string[];
  });

  const mainImage = createMemo(() => galleryImages()[currentIndex()] || '');
  
  const nextImage = () => setCurrentIndex(i => (i + 1) % galleryImages().length);
  const prevImage = () => setCurrentIndex(i => (i - 1 + galleryImages().length) % galleryImages().length);
  const goToImage = (index: number) => setCurrentIndex(index);

  // --- THE FIX (Part 2): Logic now works with the flat structure ---
  const allOffers = createMemo(() => eventData()?.tiers.flatMap(tier => tier.offers) || []);

  const calculateTotal = createMemo(() => {
    const offer = allOffers().find(o => o.id === selectedOfferId());
    return offer ? offer.price * quantity() : 0;
  });

  const canPurchase = () => selectedOfferId() !== null && quantity() > 0;

  return (

    <DashboardLayout>
      <Show when={!eventData.loading} fallback={<LoadingSkeleton />}>
        <Show when={!eventData.error} fallback={<p class="p-8 text-center text-red-500">{eventData.error.message}</p>}>
          {/* This <Show> is crucial. It waits for data to exist before rendering anything that uses it. */}
          <Show when={eventData()} keyed>
            {(data) => (
      <div class="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
        <div class="mb-6">
          <A href="/dashboard" class="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
            <AiOutlineArrowLeft /> Back to All Events
          </A>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div class="lg:col-span-2 space-y-8">
            <div class="space-y-4">
              <div class="relative group">
                {/* This ImageWithFallback now works correctly */}
                <ImageWithFallback src={mainImage()} alt={data.title} class="w-full h-64 md:h-[450px] object-cover rounded-xl border border-neutral-200 dark:border-neutral-700 transition-opacity duration-300" />
                
                {/* Prev Button */}
                <button onClick={prevImage} class="absolute top-1/2 left-4 cursor-pointer -translate-y-1/2 p-2 rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none">
                  <AiOutlineLeft class="size-6" />
                </button>
                {/* Next Button */}
                <button onClick={nextImage} class="absolute top-1/2 right-4  cursor-pointer -translate-y-1/2 p-2 rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none">
                  <AiOutlineRight class="size-6" />
                </button>
              </div>
              
              {/* Thumbnails */}
              <div class="grid grid-cols-5 gap-3">
                <For each={galleryImages()}>
                  {(img, index) => (
                    <div
                      class="cursor-pointer rounded-lg overflow-hidden ring-2 ring-transparent hover:ring-indigo-500 transition-all"
                      classList={{ '!ring-indigo-500': currentIndex() === index() }}
                      onClick={[goToImage, index()]}
                    >
                      <ImageWithFallback src={img} alt={`Thumbnail ${index() + 1}`} class="w-full h-20 sm:h-28 object-cover" />
                    </div>
                  )}
                </For>
              </div>

              {/* Pagination Dots */}
              <div class="flex justify-center items-center gap-2 pt-2 ">
                 <For each={galleryImages()}>
                  {(_, index) => (
                    <button 
                      onClick={[goToImage, index()]}
                      class="h-2 rounded-full transition-all "
                      classList={{
                        'w-6 bg-indigo-600': currentIndex() === index(),
                        'w-2 bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 cursor-pointer z-20': currentIndex() !== index(),
                      }}
                    />
                  )}
                </For>
              </div>
            </div>


            {/* Event Details Card (Unchanged) */}
            <div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6">
              <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">{data.title}</h1>
              <p class="text-lg text-neutral-500 dark:text-neutral-400 mb-6">{data.artist_name}</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <InfoCard label="Venue" value={data.venue_name} subValue={data.location} icon={AiOutlineEnvironment} />
                    <InfoCard label="Time" value={data.start_time} icon={AiOutlineClockCircle} />
              </div>
              <div class="border-t border-neutral-200 dark:border-neutral-700 pt-6">
                <h2 class="text-xl font-semibold mb-3 text-neutral-800 dark:text-neutral-200">About This Event</h2>
                <p class="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {data.description}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Sidebar (Unchanged) */}
          <div class="lg:col-span-1">
            <div class="sticky top-8 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 space-y-6">
              <h2 class="text-xl font-semibold text-neutral-800 dark:text-neutral-200">Book Your Tickets</h2>
              <div>
                <label class="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-3">1. Select Ticket Type</label>
                <div class="space-y-3">
                      <For each={allOffers()} fallback={<p class="text-sm text-red-600 ">No tickets on sale.</p>}>
                            {(offer) => (
                              <TicketOption offer={offer} selected={selectedOfferId() === offer.id} onSelect={() => setSelectedOfferId(offer.id)} />
                            )}
                      </For>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-2">2. Select Quantity</label>
                <div class="flex items-center space-x-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity() - 1))} disabled={quantity() <= 1} class="w-10 h-10 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-50">
                    <AiOutlineMinus />
                  </button>
                  <span class="w-10 text-center font-semibold text-lg text-neutral-800 dark:text-neutral-200">{quantity()}</span>
                  <button onClick={() => setQuantity(quantity() + 1)} disabled={quantity() >= 10} class="w-10 h-10 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-50">
                    <AiOutlinePlus />
                  </button>
                </div>
              </div>
              <div class="border-t border-neutral-200 dark:border-neutral-700 pt-6">
                <div class="flex justify-between items-center mb-4">
                  <span class="font-semibold text-neutral-700 dark:text-neutral-300">Total Price:</span>
                  <span class="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{formatPrice(calculateTotal())}</span>
                </div>
                <A
                      href={canPurchase() ? `/checkout/${data.id}?offer=${selectedOfferId()}&qty=${quantity()}` : '#'}
                  class="w-full py-3 px-4 rounded-lg text-center font-semibold transition-colors"
                  classList={{
                    'bg-indigo-600 hover:bg-indigo-700 text-white': canPurchase(),
                    'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed': !canPurchase(),
                  }}
                >
                  {canPurchase() ? 'Proceed to Checkout' : 'Select Ticket to Continue'}
                </A>
              </div>
            </div>
          </div>
        </div>
      </div>
         )}
      </Show>
      </Show>
      </Show>
    </DashboardLayout>
  );
};



export default EventDetail;
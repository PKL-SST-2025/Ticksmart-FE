import type { Component } from 'solid-js';
import { createSignal, For, onMount, createMemo, Show } from 'solid-js';
import DashboardLayout from '../components/DashboardLayout';
import SeatingChart from '../components/seating/SeatingChart';
import { mockSeatingChart, mockEventSeats, mockTicketTiers } from '../data/seatingData';
import { AiOutlineClose } from 'solid-icons/ai';

// A type for our powerful lookup map
interface SeatDetails {
  section: string;
  row: string;
  number: string;
  tierId: number;
  price: number;
}

const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

const TicketTest: Component = () => {
  // --- The selection state now lives in the parent component ---
  const [selectedSeats, setSelectedSeats] = createSignal<Set<number>>(new Set());
  
  // This is a performance optimization: a lookup map to get seat details by ID
  let seatDetailsMap = new Map<number, SeatDetails>();

  // Pre-calculate all seat details on component mount
  onMount(() => {
    const details = new Map<number, SeatDetails>();
    mockSeatingChart.sections.forEach(section => {
      section.rows.forEach(row => {
        if (row.type === 'line') {
          row.seats.forEach(seat => {
            const tier = mockTicketTiers.find(t => t.id === section.defaultTierId);
            details.set(seat.id, {
              section: section.name, row: row.name, number: seat.seat_number,
              tierId: section.defaultTierId, price: tier?.price || 0,
            });
          });
        } else if (row.type === 'curve') {
          for (let i = 0; i < row.seatCount; i++) {
            const seatId = row.id * 1000 + i;
            const tier = mockTicketTiers.find(t => t.id === section.defaultTierId);
            details.set(seatId, {
              section: section.name, row: row.name, number: (i + 1).toString(),
              tierId: section.defaultTierId, price: tier?.price || 0,
            });
          }
        }
      });
    });
    seatDetailsMap = details;
  });

  // Convert the Set signal to an Array signal for easier rendering with <For>
  const selectedSeatsArray = createMemo(() => Array.from(selectedSeats()));

  // Calculate the total price reactively
  const totalPrice = createMemo(() => {
    let total = 0;
    for (const seatId of selectedSeats()) {
      total += seatDetailsMap.get(seatId)?.price || 0;
    }
    return total;
  });

  const handleRemoveSeat = (seatId: number) => {
    setSelectedSeats(prev => {
      const newSet = new Set(prev);
      newSet.delete(seatId);
      return newSet;
    });
  };

  return (
    <DashboardLayout>
      <div class="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Interactive Seating Map</h1>
          <p class="mt-1 text-neutral-500 dark:text-neutral-400">
            Select your desired seats from the map below.
          </p>
        </div>
        
        <div class="mb-8">
          <SeatingChart 
            chartData={mockSeatingChart} 
            eventSeats={mockEventSeats}
            ticketTiers={mockTicketTiers}
            selectedSeats={selectedSeats}
            onSelectionChange={setSelectedSeats} // Pass the setter function
          />
        </div>
        
        {/* --- NEW: Selection Summary Section --- */}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6">
            <h2 class="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200">Your Selected Seats</h2>
            <Show
              when={selectedSeatsArray().length > 0}
              fallback={<p class="text-neutral-500 dark:text-neutral-400">Click on an available seat in the map to add it to your cart.</p>}
            >
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <For each={selectedSeatsArray()}>
                  {(seatId) => {
                    const details = seatDetailsMap.get(seatId);
                    const tier = mockTicketTiers.find(t => t.id === details?.tierId);
                    return (
                      <div class="bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p class="font-semibold text-neutral-800 dark:text-neutral-200">
                            Seat {details?.number}
                          </p>
                          <p class="text-xs text-neutral-500 dark:text-neutral-400">
                            {details?.section}, Row {details?.row}
                          </p>
                          <p class="text-xs font-bold" style={{ color: tier?.color }}>{tier?.name}</p>
                        </div>
                        <button onClick={() => handleRemoveSeat(seatId)} class="p-1 rounded-full text-neutral-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50">
                          <AiOutlineClose />
                        </button>
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>
          </div>

          <div class="lg:col-span-1">
            <div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 sticky top-8">
              <h2 class="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200">Order Summary</h2>
              <div class="space-y-3">
                <div class="flex justify-between text-neutral-600 dark:text-neutral-300">
                  <span>Selected Seats:</span>
                  <span class="font-medium">{selectedSeatsArray().length}</span>
                </div>
                <div class="flex justify-between text-neutral-600 dark:text-neutral-300">
                  <span>Service Fee:</span>
                  <span class="font-medium">{formatPrice(0)}</span>
                </div>
              </div>
              <div class="my-4 border-t border-dashed border-neutral-300 dark:border-neutral-600"></div>
              <div class="flex justify-between items-baseline">
                <span class="font-bold text-neutral-800 dark:text-neutral-200">Total Price:</span>
                <span class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatPrice(totalPrice())}</span>
              </div>
              <button
                disabled={selectedSeatsArray().length === 0}
                class="w-full mt-6 py-3 px-4 rounded-lg text-center font-semibold transition-colors bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed"
              >
                Continue to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TicketTest;
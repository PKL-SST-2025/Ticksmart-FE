import type { Component } from 'solid-js';
import { createSignal, For } from 'solid-js';
import { A } from '@solidjs/router';
import DashboardLayout from '../components/DashboardLayout';
import PageContainer from '../components/PageContainer';

const AdminCreateEvent: Component = () => {
  const [eventData, setEventData] = createSignal({
    title: '',
    artist: '',
    description: '',
    fullDescription: '',
    category: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    location: '',
    address: '',
    capacity: 0,
    ageRestriction: '',
    facilities: [] as string[],
    image: '',
    gallery: [] as string[]
  });

  const [ticketTypes, setTicketTypes] = createSignal([
    { name: 'Regular', price: 0, description: '', quantity: 0 }
  ]);

  const [timeSlots, setTimeSlots] = createSignal([
    { startTime: '', endTime: '' }
  ]);

  const categories = ['Rock', 'Pop', 'Jazz', 'Electronic', 'Classical', 'Hip Hop', 'Country', 'R&B', 'Folk', 'Alternative'];
  const facilityOptions = ['Parking', 'Food Court', 'Merchandise Store', 'Rest Areas', 'First Aid', 'VIP Lounge', 'Coat Check', 'ATM', 'WiFi', 'Accessibility'];

  const updateEventData = (field: string, value: string | number | string[]) => {
    setEventData(prev => ({ ...prev, [field]: value }));
  };

  const updateTicketType = (index: number, field: string, value: string | number) => {
    setTicketTypes(prev => prev.map((ticket, i) => 
      i === index ? { ...ticket, [field]: value } : ticket
    ));
  };

  const addTicketType = () => {
    setTicketTypes(prev => [...prev, { name: '', price: 0, description: '', quantity: 0 }]);
  };

  const removeTicketType = (index: number) => {
    setTicketTypes(prev => prev.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: string, value: string) => {
    setTimeSlots(prev => prev.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    ));
  };

  const addTimeSlot = () => {
    setTimeSlots(prev => [...prev, { startTime: '', endTime: '' }]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFacility = (facility: string) => {
    const facilities = eventData().facilities;
    const updatedFacilities = facilities.includes(facility)
      ? facilities.filter(f => f !== facility)
      : [...facilities, facility];
    updateEventData('facilities', updatedFacilities);
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    console.log('Creating event:', {
      eventData: eventData(),
      ticketTypes: ticketTypes(),
      timeSlots: timeSlots()
    });
    // Handle event creation logic here
  };

  return (
    <DashboardLayout>
    <PageContainer>
    <div class="max-w-6xl mx-auto">
      {/* Header */}
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-white">Create New Event</h1>
            <p class="text-gray-300 mt-2">Add a new concert or event to the platform</p>
          </div>
          <A href="/admin/edit-event" class="border border-white/10 hover:bg-white/10 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Manage Events
          </A>
        </div>
      </div>

      <form onSubmit={handleSubmit} class="space-y-8">
        {/* Basic Information */}
        <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 class="text-xl font-semibold text-white mb-6">Basic Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-200 mb-2">Event Title *</label>
              <input
                type="text"
                required
                class="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-neon"
                placeholder="e.g., Bruno Mars Live in Jakarta"
                value={eventData().title}
                onInput={(e) => updateEventData('title', e.target.value)}
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-200 mb-2">Artist/Performer *</label>
              <input
                type="text"
                required
                class="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-neon"
                placeholder="e.g., Bruno Mars"
                value={eventData().artist}
                onInput={(e) => updateEventData('artist', e.target.value)}
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-200 mb-2">Category *</label>
              <select
                required
                class="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5 text-gray-100 focus-neon"
                value={eventData().category}
                onChange={(e) => updateEventData('category', e.target.value)}
              >
                <option value="">Select Category</option>
                <For each={categories}>
                  {(category) => <option value={category}>{category}</option>}
                </For>
              </select>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-200 mb-2">Short Description *</label>
              <textarea
                required
                rows="3"
                class="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-neon"
                placeholder="Brief description of the event"
                value={eventData().description}
                onInput={(e) => updateEventData('description', e.target.value)}
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-200 mb-2">Full Description</label>
              <textarea
                rows="5"
                class="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-neon"
                placeholder="Detailed description of the event"
                value={eventData().fullDescription}
                onInput={(e) => updateEventData('fullDescription', e.target.value)}
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-200 mb-2">Event Image URL</label>
              <input
                type="url"
                class="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-neon"
                placeholder="https://example.com/image.jpg"
                value={eventData().image}
                onInput={(e) => updateEventData('image', e.target.value)}
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-200 mb-2">Age Restriction</label>
              <select
                class="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5 text-gray-100 focus-neon"
                value={eventData().ageRestriction}
                onChange={(e) => updateEventData('ageRestriction', e.target.value)}
              >
                <option value="">No Restriction</option>
                <option value="13+">13+</option>
                <option value="16+">16+</option>
                <option value="18+">18+</option>
                <option value="21+">21+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date, Time & Location */}
        <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 class="text-xl font-semibold text-white mb-6">Date, Time & Location</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-200 mb-2">Event Date *</label>
              <input
                type="date"
                required
                class="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-neon"
                value={eventData().date}
                onInput={(e) => updateEventData('date', e.target.value)}
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-200 mb-2">Capacity *</label>
              <input
                type="number"
                required
                min="1"
                class="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-neon"
                placeholder="e.g., 5000"
                value={eventData().capacity}
                onInput={(e) => updateEventData('capacity', parseInt(e.target.value) || 0)}
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-200 mb-3">Time Slots</label>
              <div class="space-y-3">
                <For each={timeSlots()}>
                  {(slot, index) => (
                    <div class="flex items-center space-x-3">
                      <input
                        type="time"
                        class="px-3 py-2 rounded-md border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-neon"
                        placeholder="Start Time"
                        value={slot.startTime}
                        onInput={(e) => updateTimeSlot(index(), 'startTime', e.target.value)}
                      />
                      <span class="text-gray-500">to</span>
                      <input
                        type="time"
                        class="px-3 py-2 rounded-md border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-neon"
                        placeholder="End Time"
                        value={slot.endTime}
                        onInput={(e) => updateTimeSlot(index(), 'endTime', e.target.value)}
                      />
                      {timeSlots().length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(index())}
                          class="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </For>
                <button
                  type="button"
                  onClick={addTimeSlot}
                  class="text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  + Add Time Slot
                </button>
              </div>
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-200 mb-2">Venue Name *</label>
              <input
                type="text"
                required
                class="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-neon"
                placeholder="e.g., Gelora Bung Karno Stadium"
                value={eventData().venue}
                onInput={(e) => updateEventData('venue', e.target.value)}
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-200 mb-2">City/Location *</label>
              <input
                type="text"
                required
                class="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-neon"
                placeholder="e.g., Jakarta, Indonesia"
                value={eventData().location}
                onInput={(e) => updateEventData('location', e.target.value)}
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-200 mb-2">Full Address</label>
              <input
                type="text"
                class="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-neon"
                placeholder="Complete venue address"
                value={eventData().address}
                onInput={(e) => updateEventData('address', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Ticket Types */}
        <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 class="text-xl font-semibold text-white mb-6">Ticket Types</h2>
          
          <div class="space-y-4">
            <For each={ticketTypes()}>
              {(ticket, index) => (
                <div class="border border-white/10 rounded-lg p-4 bg-white/5">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-200 mb-1">Ticket Name *</label>
                      <input
                        type="text"
                        required
                        class="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-neon"
                        placeholder="e.g., Regular"
                        value={ticket.name}
                        onInput={(e) => updateTicketType(index(), 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-200 mb-1">Price (IDR) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        class="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-neon"
                        placeholder="350000"
                        value={ticket.price}
                        onInput={(e) => updateTicketType(index(), 'price', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-200 mb-1">Quantity *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        class="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-neon"
                        placeholder="1000"
                        value={ticket.quantity}
                        onInput={(e) => updateTicketType(index(), 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div class="flex items-end">
                      {ticketTypes().length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTicketType(index())}
                          class="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <div class="mt-3">
                    <label class="block text-sm font-medium text-gray-200 mb-1">Description</label>
                    <input
                      type="text"
                      class="w-full px-3 py-2 rounded-md border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-neon"
                      placeholder="e.g., Premium seating near stage"
                      value={ticket.description}
                      onInput={(e) => updateTicketType(index(), 'description', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </For>
            <button
              type="button"
              onClick={addTicketType}
              class="text-red-400 hover:text-red-300 text-sm font-medium"
            >
              + Add Ticket Type
            </button>
          </div>
        </div>

        {/* Facilities */}
        <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 class="text-xl font-semibold text-white mb-6">Event Facilities</h2>
          
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <For each={facilityOptions}>
              {(facility) => (
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    class="rounded border-white/10 bg-white/5 text-red-500 focus:ring-red-500"
                    checked={eventData().facilities.includes(facility)}
                    onChange={() => toggleFacility(facility)}
                  />
                  <span class="ml-2 text-sm text-gray-200">{facility}</span>
                </label>
              )}
            </For>
          </div>
        </div>

        {/* Submit */}
        <div class="flex justify-end space-x-4">
          <A
            href="/admin/edit-event"
            class="px-6 py-3 border border-white/10 rounded-md text-gray-100 hover:bg-white/10 font-medium transition-colors"
          >
            Cancel
          </A>
          <button
            type="submit"
            class="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
          >
            Create Event
          </button>
        </div>
      </form>
  </div>
  </PageContainer>
  </DashboardLayout>
  );
};

export default AdminCreateEvent;

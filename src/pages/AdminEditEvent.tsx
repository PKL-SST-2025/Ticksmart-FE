import type { Component } from 'solid-js';
import { createSignal, For } from 'solid-js';
import { A } from '@solidjs/router';
import ImageWithFallback from '../components/ImageWithFallback';
import DashboardLayout from '../components/DashboardLayout';
import PageContainer from '../components/PageContainer';

interface Event {
  id: number;
  title: string;
  artist: string;
  date: string;
  venue: string;
  location: string;
  category: string;
  status: 'active' | 'draft' | 'cancelled' | 'completed';
  totalTickets: number;
  soldTickets: number;
  revenue: number;
  image: string;
}

const AdminEditEvent: Component = () => {
  const [searchQuery, setSearchQuery] = createSignal('');
  const [statusFilter, setStatusFilter] = createSignal('all');
  const [selectedEvents, setSelectedEvents] = createSignal<number[]>([]);

  // Mock events data
  const [events, setEvents] = createSignal<Event[]>([
    {
      id: 1,
  title: "Bruno Mars Live in Jakarta",
  artist: "Bruno Mars",
      date: "2025-09-15",
      venue: "Gelora Bung Karno Stadium",
      location: "Jakarta, Indonesia",
      category: "Rock",
      status: "active",
      totalTickets: 5000,
      soldTickets: 3200,
      revenue: 1680000000,
  image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=400&fit=crop"
    },
    {
      id: 2,
  title: "Raisa Live Orchestra",
  artist: "Raisa",
      date: "2025-09-20",
      venue: "Taman Mini Indonesia Indah",
      location: "Jakarta, Indonesia",
      category: "Jazz",
      status: "active",
      totalTickets: 2000,
      soldTickets: 1500,
      revenue: 375000000,
  image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop"
    },
    {
      id: 3,
  title: "Alan Walker World Tour",
  artist: "Alan Walker",
      date: "2025-09-25",
      venue: "Beach City International Stadium",
      location: "Jakarta, Indonesia",
      category: "Electronic",
      status: "draft",
      totalTickets: 8000,
      soldTickets: 0,
      revenue: 0,
  image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop"
    },
    {
      id: 4,
  title: "Tulus Intimate Concert",
  artist: "Tulus",
      date: "2025-07-15",
      venue: "Concert Hall Jakarta",
      location: "Jakarta, Indonesia",
      category: "Classical",
      status: "completed",
      totalTickets: 1000,
      soldTickets: 1000,
      revenue: 450000000,
  image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop"
    }
  ]);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'draft': return '🟡';
      case 'completed': return '🔵';
      case 'cancelled': return '🔴';
      default: return '⚪';
    }
  };

  const filteredEvents = () => {
    return events().filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery().toLowerCase()) ||
                           event.artist.toLowerCase().includes(searchQuery().toLowerCase()) ||
                           event.venue.toLowerCase().includes(searchQuery().toLowerCase());
      const matchesStatus = statusFilter() === 'all' || event.status === statusFilter();
      return matchesSearch && matchesStatus;
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTicketsSoldPercentage = (sold: number, total: number) => {
    return total > 0 ? Math.round((sold / total) * 100) : 0;
  };

  const toggleEventSelection = (eventId: number) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const selectAllEvents = () => {
    const filtered = filteredEvents();
    const allSelected = filtered.every(event => selectedEvents().includes(event.id));
    if (allSelected) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(filtered.map(event => event.id));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on events:`, selectedEvents());
    // Handle bulk actions here
    setSelectedEvents([]);
  };

  const changeEventStatus = (eventId: number, newStatus: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, status: newStatus as any } : event
    ));
  };

  const deleteEvent = (eventId: number) => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
    }
  };

  const getTotalStats = () => {
    const allEvents = events();
    return {
      total: allEvents.length,
      active: allEvents.filter(e => e.status === 'active').length,
      totalRevenue: allEvents.reduce((sum, e) => sum + e.revenue, 0),
      totalSold: allEvents.reduce((sum, e) => sum + e.soldTickets, 0)
    };
  };

  const stats = getTotalStats();

  return (
    <DashboardLayout>
  <PageContainer>
  <div class="max-w-7xl mx-auto">
      {/* Header */}
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-white">Manage Events</h1>
            <p class="text-gray-300 mt-2">View, edit, and manage all events</p>
          </div>
          <A href="/admin/create-event" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Create New Event
          </A>
        </div>
      </div>

      {/* Stats */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <span class="text-2xl">📊</span>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-300">Total Events</p>
              <p class="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <span class="text-2xl">🟢</span>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-300">Active Events</p>
              <p class="text-2xl font-bold text-white">{stats.active}</p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <span class="text-2xl">💰</span>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-300">Total Revenue</p>
              <p class="text-lg font-bold text-white">{formatPrice(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <span class="text-2xl">🎫</span>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-300">Tickets Sold</p>
              <p class="text-2xl font-bold text-white">{stats.totalSold.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div class="rounded-2xl border border-white/10 bg-white/5 p-6 mb-8">
        <div class="flex flex-col md:flex-row gap-4 mb-4">
          <div class="flex-1">
            <input
              type="text"
              placeholder="Search events, artists, or venues..."
              class="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-100 placeholder:text-gray-400 focus-neon"
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            class="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-gray-100 focus-neon"
            value={statusFilter()}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <For each={statusOptions}>
              {(option) => (
                <option value={option.value}>{option.label}</option>
              )}
            </For>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedEvents().length > 0 && (
          <div class="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <span class="text-sm text-gray-200">
              {selectedEvents().length} event(s) selected
            </span>
            <div class="flex space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('draft')}
                class="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
              >
                Draft
              </button>
              <button
                onClick={() => handleBulkAction('cancel')}
                class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Events Table */}
      <div class="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-white/10">
            <thead class="bg-white/5">
              <tr>
                <th class="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    class="rounded border-white/10 bg-white/5"
                    checked={filteredEvents().length > 0 && filteredEvents().every(event => selectedEvents().includes(event.id))}
                    onChange={selectAllEvents}
                  />
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Event</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tickets</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Revenue</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10">
              <For each={filteredEvents()}>
                {(event) => (
                  <tr class="hover:bg-white/5">
                    <td class="px-6 py-4">
                      <input
                        type="checkbox"
                        class="rounded border-white/10 bg-white/5"
                        checked={selectedEvents().includes(event.id)}
                        onChange={() => toggleEventSelection(event.id)}
                      />
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center">
                        <ImageWithFallback class="h-16 w-24 object-cover rounded" src={event.image} alt={event.title} />
                        <div class="ml-4">
                          <div class="text-sm font-medium text-white">{event.title}</div>
                          <div class="text-sm text-gray-300">{event.artist}</div>
                          <div class="text-xs text-gray-400">{event.venue}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-white">{formatDate(event.date)}</div>
                      <div class="text-xs text-gray-300">{event.location}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {getStatusIcon(event.status)} {event.status.toUpperCase()}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-white">
                        {event.soldTickets.toLocaleString()} / {event.totalTickets.toLocaleString()}
                      </div>
                      <div class="w-full bg-white/10 rounded-full h-2 mt-1">
                        <div 
                          class="bg-red-500 h-2 rounded-full" 
                          style={`width: ${getTicketsSoldPercentage(event.soldTickets, event.totalTickets)}%`}
                        ></div>
                      </div>
                      <div class="text-xs text-gray-300 mt-1">
                        {getTicketsSoldPercentage(event.soldTickets, event.totalTickets)}% sold
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-white">{formatPrice(event.revenue)}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-2">
                        <A 
                          href={`/event/${event.id}`}
                          class="text-red-400 hover:text-red-300"
                        >
                          View
                        </A>
                        <button class="text-gray-300 hover:text-white">
                          Edit
                        </button>
                        <div class="relative group">
                          <button class="text-gray-300 hover:text-white">
                            Status
                          </button>
                          <div class="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-white/10">
                            <div class="py-1 text-gray-100">
                              <button
                                onClick={() => changeEventStatus(event.id, 'active')}
                                class="block px-4 py-2 text-sm hover:bg-white/10 w-full text-left"
                              >
                                🟢 Set Active
                              </button>
                              <button
                                onClick={() => changeEventStatus(event.id, 'draft')}
                                class="block px-4 py-2 text-sm hover:bg-white/10 w-full text-left"
                              >
                                🟡 Set Draft
                              </button>
                              <button
                                onClick={() => changeEventStatus(event.id, 'cancelled')}
                                class="block px-4 py-2 text-sm hover:bg-white/10 w-full text-left"
                              >
                                🔴 Cancel Event
                              </button>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteEvent(event.id)}
                          class="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>

        {filteredEvents().length === 0 && (
          <div class="text-center py-12">
            <div class="text-6xl mb-4">📋</div>
            <h3 class="text-xl font-semibold text-white mb-2">No events found</h3>
            <p class="text-gray-300 mb-6">
              {searchQuery() || statusFilter() !== 'all' 
                ? 'Try adjusting your search criteria or filters.'
                : 'Create your first event to get started.'
              }
            </p>
            <A href="/admin/create-event" class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-semibold transition-colors">
              Create New Event
            </A>
          </div>
        )}
      </div>
  </div>
  </PageContainer>
  </DashboardLayout>
  );
};

export default AdminEditEvent;

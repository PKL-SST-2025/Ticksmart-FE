import { For } from 'solid-js';
import type { Component } from 'solid-js';
import {
  IoCalendarOutline,
  IoAddCircleOutline,
  IoEllipsisHorizontal,
} from 'solid-icons/io';

import { EventItem } from './EventItem';
import { CalendarEvent } from '../../utils/types/event';

export const upcomingEvents: CalendarEvent[] = [
  { id: 'e1', date: 'Today, June 25', title: 'Pergi ke semarang', isToday: true },
  { id: 'e2', date: 'Sunday, June 28', title: 'Pergi ke semarang' },
  { id: 'e3', date: 'Tuesday, June 26', title: 'Pergi ke jakarta' },
  { id: 'e4', date: 'Sunday, June 28', title: 'Pergi ke jakarta' },
  { id: 'e5', date: 'Friday, June 27', title: 'Kepentingan industri yang sangat rahasia' },
  { id: 'e6', date: 'Sunday, June 28', title: 'Kepentingan industri yang sangat rahasia' },
  { id: 'e7', date: 'Saturday, June 28', title: 'Pergi ke jakarta' },
  { id: 'e8', date: 'Sunday, June 28', title: 'Pergi ke jakarta' },
];

export const UpcomingEvents: Component = () => {
  return (
    <div class="w-full max-w-5xl p-4 rounded-xl border border-gray-700/80 bg-gray-800/40 backdrop-blur-sm">
      {/* Header */}
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-3">
          <IoCalendarOutline class="w-5 h-5 text-gray-400" />
          <h2 class="font-semibold text-gray-200">Upcoming Events</h2>
        </div>
        <div class="flex items-center space-x-2">
          <button class="p-1 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white transition-colors">
            <IoEllipsisHorizontal class="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Responsive Grid of Events */}
      {/* This will be 1 column on small screens and 2 columns on large (lg) screens and up */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full">
        <For each={upcomingEvents}>
          {(event) => <EventItem event={event} />}
        </For>
      </div>

      {/* "See More" Button */}
      <div class="mt-6 text-center">
        <button class="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors">
          See More...
        </button>
      </div>
    </div>
  );
};
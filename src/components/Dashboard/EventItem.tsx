import type { Component } from 'solid-js';
import type { CalendarEvent } from '../../utils/types/event';

interface EventItemProps {
  event: CalendarEvent;
}

export const EventItem: Component<EventItemProps> = (props) => {
  return (
    <button class="bg-gray-950/70 hover:-translate-y-1  ease-in-out border border-gray-700 relative hover:bg-gray-900/40 text-left transition-all duration-200 rounded-lg p-3 flex items-center space-x-4">
      {/* Date Section */}
      <p
        class="font-semibold w-40 shrink-0"
        classList={{
          'text-red-400': props.event.isToday,
          'text-gray-400': !props.event.isToday,
        }}
      >
        {props.event.date}
      </p>

      {/* Divider */}
      <div class="w-[2px] h-6 absolute left-42  bg-gray-600" />

      {/* Title Section */}
      <p class="text-gray-200 truncate">{props.event.title}</p>
    </button>
  );
};
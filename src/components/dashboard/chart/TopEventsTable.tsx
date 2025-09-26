import { Component, For } from "solid-js";

const dummyEvents = [
  { name: "Summer Music Festival 2024", date: "Aug 15, 2024", ticketsSold: 8520, capacity: 10000, revenue: 426000 },
  { name: "Tech Conference AI & Future", date: "Sep 05, 2024", ticketsSold: 450, capacity: 500, revenue: 225000 },
  { name: "Local Charity Gala", date: "Jul 28, 2024", ticketsSold: 180, capacity: 200, revenue: 45000 },
  { name: "Indie Film Screening", date: "Aug 02, 2024", ticketsSold: 75, capacity: 150, revenue: 1125 },
];

export const TopEventsTable: Component = () => {
  return (
    <div class="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700">
      <div class="p-4 md:p-5">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white">
          Top Performing Events
        </h3>
      </div>
      <div class="-m-1.5 overflow-x-auto">
        <div class="p-1.5 min-w-full inline-block align-middle">
          <div class="border-t border-gray-200 dark:border-neutral-700">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
              <thead class="bg-gray-50 dark:bg-neutral-950">
                <tr>
                  <th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Event</th>
                  <th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Capacity</th>
                  <th scope="col" class="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Revenue</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-neutral-700">
                <For each={dummyEvents}>
                  {(event) => (
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">
                        <div class="font-semibold">{event.name}</div>
                        <div class="text-xs text-gray-500">{event.date}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">
                        <div class="flex items-center gap-x-3">
                          <div class="grow">
                            <div class="w-full h-2 bg-gray-200 rounded-full dark:bg-neutral-700">
                              <div class="h-2 bg-blue-600 rounded-full" style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}></div>
                            </div>
                          </div>
                          <div class="text-xs text-gray-500">{event.ticketsSold.toLocaleString()} / {event.capacity.toLocaleString()}</div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-teal-500 font-semibold">
                        {event.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
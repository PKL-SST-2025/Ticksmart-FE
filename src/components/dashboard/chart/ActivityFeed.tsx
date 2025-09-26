import { Component, For, Show } from "solid-js";
import { AiOutlineCheck, AiOutlineReload } from "solid-icons/ai";

const dummyActivity = [
  { id: 1, type: 'purchase', person: 'Alice Johnson', details: '2x VIP Tickets', timestamp: '2m ago' },
  { id: 2, type: 'purchase', person: 'Bob Williams', details: '4x General Admission', timestamp: '5m ago' },
  { id: 3, type: 'refund', person: 'Charlie Brown', details: '1x Early Bird', timestamp: '1h ago' },
  { id: 4, type: 'purchase', person: 'Diana Miller', details: '1x VIP Ticket', timestamp: '3h ago' },
];

export const ActivityFeed: Component = () => {
  return (
    <div class="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700">
      <div class="p-4 md:p-5">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white">
          Recent Activity
        </h3>
      </div>
      <div class="p-4 md:p-5 border-t border-gray-200 dark:border-neutral-700 h-64 overflow-y-auto">
        <ul class="space-y-4">
          <For each={dummyActivity}>
            {(activity) => (
              <li class="flex space-x-3">
                <Show when={activity.type === 'purchase'} fallback={
                  <span class="flex-shrink-0 flex justify-center items-center size-8 rounded-full bg-red-100 dark:bg-red-900/50">
                    <AiOutlineReload class="size-4 text-red-500" />
                  </span>
                }>
                  <span class="flex-shrink-0 flex justify-center items-center size-8 rounded-full bg-teal-100 dark:bg-teal-900/50">
                    <AiOutlineCheck class="size-4 text-teal-500" />
                  </span>
                </Show>
                <div class="grow">
                  <p class="text-sm text-gray-800 dark:text-neutral-200">
                    <span class="font-semibold">{activity.person}</span>
                    {activity.type === 'purchase' ? ' purchased ' : ' refunded '}
                    {activity.details}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-neutral-500">{activity.timestamp}</p>
                </div>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  );
};
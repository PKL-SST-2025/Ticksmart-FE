import { Component, For } from "solid-js";
import { AiOutlineArrowUp, AiOutlineArrowDown, AiOutlineDollar, AiOutlineUser, AiOutlineCalendar } from "solid-icons/ai";

export default function FaSolidTicket(props) {
    return (
      <svg fill="currentColor" stroke-width="0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style="overflow: visible; color: currentcolor;" height="1em" width="1em"><path d="M64 64C28.7 64 0 92.7 0 128v64c0 8.8 7.4 15.7 15.7 18.6C34.5 217.1 48 235 48 256s-13.5 38.9-32.3 45.4C7.4 304.3 0 311.2 0 320v64c0 35.3 28.7 64 64 64h448c35.3 0 64-28.7 64-64v-64c0-8.8-7.4-15.7-15.7-18.6C541.5 294.9 528 277 528 256s13.5-38.9 32.3-45.4c8.3-2.9 15.7-9.8 15.7-18.6v-64c0-35.3-28.7-64-64-64H64zm64 112v160c0 8.8 7.2 16 16 16h288c8.8 0 16-7.2 16-16V176c0-8.8-7.2-16-16-16H144c-8.8 0-16 7.2-16 16zm-32-16c0-17.7 14.3-32 32-32h320c17.7 0 32 14.3 32 32v192c0 17.7-14.3 32-32 32H128c-17.7 0-32-14.3-32-32V160z"></path></svg>
    );
  }
  

const statData = [
  { title: "Revenue Today", value: "$4,285", change: "+12.5%", changeType: "increase", icon: AiOutlineDollar },
  { title: "Tickets Sold Today", value: "352", change: "+8.2%", changeType: "increase", icon: FaSolidTicket },
  { title: "New Attendees", value: "87", change: "-2.1%", changeType: "decrease", icon: AiOutlineUser },
  { title: "Upcoming Events", value: "4", change: "0", changeType: "neutral", icon: AiOutlineCalendar },
];

export const StatCards: Component = () => {
  return (
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <For each={statData}>
        {(stat) => (
          <div class="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700">
            <div class="p-4 md:p-5">
              <div class="flex items-center gap-x-2">
                <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-neutral-500">
                  {stat.title}
                </p>
              </div>
              <div class="mt-1 flex items-center gap-x-2">
                <h3 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-neutral-200">
                  {stat.value}
                </h3>
                {stat.changeType !== "neutral" && (
                  <span
                    class="flex items-center gap-x-1"
                    classList={{
                      "text-teal-500": stat.changeType === "increase",
                      "text-red-500": stat.changeType === "decrease",
                    }}
                  >
                    {stat.changeType === "increase" ? <AiOutlineArrowUp /> : <AiOutlineArrowDown />}
                    <span class="inline-block text-sm font-semibold">{stat.change}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </For>
    </div>
  );
};
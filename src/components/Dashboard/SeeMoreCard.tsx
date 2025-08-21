import type { Component } from 'solid-js';
import { IoHelpCircleOutline } from 'solid-icons/io';

export const SeeMoreCard: Component = () => {
  return (
    <a
      href="#"
      class="group block text-center transition-transform duration-200 ease-in-out hover:-translate-y-1"
    >
      <div class="overflow-hidden rounded-lg bg-gray-700 h-38">
        <div class="flex items-center justify-center h-28 ">
          <div class="flex items-center justify-center w-14 z-20 h-14 bg-gray-600 rounded-full">
            <IoHelpCircleOutline class="w-7 h-7 text-gray-200" />
          </div>
        </div>
        <div class="px-2 py-3  -translate-y-10 pt-8 pb-24  z-10  bg-gray-950">
          <p class="text-sm text-gray-300">See more...</p>
        </div>
      </div>
    </a>
  );
};
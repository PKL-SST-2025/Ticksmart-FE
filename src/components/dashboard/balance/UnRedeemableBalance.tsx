import { AiFillMoneyCollect } from "solid-icons/ai";

export function UnRedeemableBalance() {
  return (
    <div class="flex items-center w-full p-4 bg-white dark:outline-neutral-600 outline-1 rounded-lg shadow dark:bg-neutral-900">
      <div class="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full dark:bg-opacity-50 dark:bg-red-900">
        {/* Replace with your SolidJS icon component */}
        <AiFillMoneyCollect class="text-yellow-600" size={28}  />
      </div>
      <div class="ml-4">
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Unredeemable Balance</p>
        <p class="text-2xl font-semibold text-gray-900 dark:text-white">$1,234.56</p>
      </div>
    </div>
  );
}
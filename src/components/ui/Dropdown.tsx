import { Component, createSignal, onMount, onCleanup, For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { AiOutlineDown } from 'solid-icons/ai';

export interface DropdownAction {
  label: string;
  href: string;
  icon: Component;
}

interface DropdownProps {
  user: { name: string; email: string; avatarUrl: string };
  actions: DropdownAction[];
}

const Dropdown: Component<DropdownProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  let dropdownRef: HTMLDivElement | undefined;

  const handleToggle = () => setIsOpen(!isOpen());

  // Close dropdown if user clicks outside of it
  onMount(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    onCleanup(() => document.removeEventListener('mousedown', handleClickOutside));
  });

  return (
    <div class="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        class="flex items-center gap-x-2 p-1.5 rounded-full text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <img class="w-8 h-8 rounded-full" src={props.user.avatarUrl} alt="User Avatar" />
        <span class="hidden sm:block">{props.user.name}</span>
        <AiOutlineDown class={`w-4 h-4 transition-transform ${isOpen() ? 'rotate-180' : ''}`} />
      </button>

      <Show when={isOpen()}>
        <div class="absolute right-0 mt-2 w-64 origin-top-right rounded-xl shadow-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none z-50">
          <div class="p-2">
            <div class="px-2 py-2 border-b border-neutral-200 dark:border-neutral-700">
              <p class="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{props.user.name}</p>
              <p class="text-sm text-neutral-500 dark:text-neutral-400 truncate">{props.user.email}</p>
            </div>
            <div class="mt-2 space-y-1">
              <For each={props.actions}>
                {(action) => (
                  <A
                    href={action.href}
                    class="group flex w-full items-center gap-x-3 rounded-md px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white"
                    onClick={() => setIsOpen(false)} // Close on navigate
                  >
                    <action.icon class="size-4 text-neutral-400 group-hover:text-indigo-500" />
                    {action.label}
                  </A>
                )}
              </For>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Dropdown;
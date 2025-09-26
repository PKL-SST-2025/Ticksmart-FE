import { Component, createSignal, createMemo, For, Show, onMount, onCleanup, createEffect } from "solid-js";
import { AiOutlineSearch, AiOutlineDown, AiOutlineCheck } from 'solid-icons/ai';
import { Portal } from "solid-js/web";


interface SelectOption {
  value: string;
  label: string;
}

interface FloatingLabelSelectProps {
  label: string;
  name: string;
  icon: Component;
  options: SelectOption[];
  value: string;
  onChange: (newValue: string) => void;
  error?: string;
}

const FloatingLabelSelect: Component<FloatingLabelSelectProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");

  const [popoverStyle, setPopoverStyle] = createSignal({});

    let containerRef: HTMLDivElement | undefined; // Ref for the main input-like button
  let popoverRef: HTMLDivElement | undefined; // Ref for the popover panel

  const selectedLabel = createMemo(() => {
    // --- THIS IS THE RUNTIME FIX ---
    // We add a fallback `|| []` to ensure `.find` never runs on an undefined value.
    const selected = (props.options || []).find(opt => opt.value === props.value);
    return selected ? selected.label : "";
  });

  const filteredOptions = createMemo(() => {
    const query = searchQuery().toLowerCase();
    // --- THIS IS THE RUNTIME FIX ---
    const options = props.options || [];
    if (!query) return options;
    return options.filter(opt => opt.label.toLowerCase().includes(query));
  });

  const handleSelect = (option: SelectOption) => {
    props.onChange(option.value); // This now correctly matches the prop type
    setIsOpen(false);
    setSearchQuery("");
  };

    // --- NEW: Effect to calculate and set the popover's position ---
  createEffect(() => {
    if (isOpen() && containerRef) {
      const rect = containerRef.getBoundingClientRect();
      const top = rect.bottom + window.scrollY + 8; // Position below the input + 8px margin
      const left = rect.left;
      const width = rect.width;
      setPopoverStyle({
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
      });
    }
  });
  
  onMount(() => {
    const close = () => setIsOpen(false);
    
    const handleClickOutside = (e: MouseEvent) => {
      // Close if click is outside both the button and the popover
      if (
        containerRef && !containerRef.contains(e.target as Node) &&
        popoverRef && !popoverRef.contains(e.target as Node)
      ) {
        close();
      }
    };
    
    // Close the popover on scroll or resize to prevent it from becoming detached
    window.addEventListener('scroll', close, true); // Use capture phase to catch scrolls inside other elements
    window.addEventListener('resize', close);
    document.addEventListener('mousedown', handleClickOutside);

    onCleanup(() => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      document.removeEventListener('mousedown', handleClickOutside);
    });
  });



  const hasValue = createMemo(() => props.value !== undefined && props.value !== null && props.value !== '');


  return (
    <div class="relative" ref={containerRef}>
      <div class="absolute start-0 top-5 flex items-center ps-3.5 pointer-events-none">
        <props.icon class="size-4 text-gray-400" />
      </div>
      
      <button
        type="button" name={props.name} id={props.name}
        onClick={() => setIsOpen(!isOpen())}
        class="peer p-4 ps-10 pe-9 block w-full border bg-gray-50 rounded-lg text-sm text-left focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
        classList={{
          'border-red-500': !!props.error,
          'border-gray-200 dark:border-neutral-700': !props.error,
          'text-neutral-800 dark:text-neutral-200': hasValue(),
        }}
      >
        {selectedLabel() || <span class="text-transparent">_</span>}
      </button>

      <label 
        for={props.name}
        class="absolute text-sm pointer-events-none text-gray-500 dark:text-neutral-400 duration-300 transform bg-gray-50 dark:bg-neutral-800 top-4 z-10 origin-[0] start-10 px-2"
        classList={{
          '-translate-y-6 scale-75': hasValue() || isOpen(),
          'translate-y-0 scale-100': !hasValue() && !isOpen(),
          'text-indigo-600 dark:text-indigo-500': isOpen(),
        }}
      >
        {props.label}
      </label>

      <div class="absolute end-0 top-5 flex items-center pe-3.5 pointer-events-none">
        <AiOutlineDown class={`size-4 text-gray-400 transition-transform ${isOpen() ? 'rotate-180' : ''}`} />
      </div>

      <Show when={props.error}><p class="text-xs text-red-600 mt-2">{props.error}</p></Show>

     <Portal>
        <Show when={isOpen()}>
          <div 
            ref={popoverRef}
            class="absolute max-h-60 w-full overflow-y-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 transition-opacity"
            style={popoverStyle()}
          >
            <div class="p-2 sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <div class="relative">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <AiOutlineSearch class="h-4 w-4 text-gray-400" />
                </div>
                <input type="text" placeholder="Search..."
                  class="w-full rounded-md border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 py-2 pl-9 pr-3 text-sm text-neutral-800 dark:text-neutral-200"
                  value={searchQuery()} onInput={(e) => setSearchQuery(e.currentTarget.value)} autofocus
                />
              </div>
            </div>
            <ul class="p-2 pt-0">
              <For each={filteredOptions()} fallback={<li class="px-3 py-2 text-sm text-center text-neutral-500">No options found.</li>}>
              {(option) => (
                <li
                  class="flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors"
                  classList={{
                    'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300': props.value === option.value,
                    'text-gray-800 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-700': props.value !== option.value,
                  }}
                  onClick={() => handleSelect(option)}
                >
                  <span>{option.label}</span>
                  <Show when={props.value === option.value}><AiOutlineCheck class="size-4 text-indigo-600" /></Show>
                </li>
              )}
              </For>
            </ul>
          </div>
        </Show>
      </Portal>
    </div>
  );
};

export default FloatingLabelSelect;
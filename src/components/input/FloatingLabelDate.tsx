import { Component, Show, createMemo } from 'solid-js';
import { openDatePicker } from '../modal/DatePickerModalContent'; // Import the new function

interface FloatingDateInputProps {
  label: string;
  name: string;
  icon: Component;
  value: string; // The selected date string, e.g., "2025-09-15"
  error?: string;
  onUpdate: (dateString: string) => void;
}

const FloatingDateInput: Component<FloatingDateInputProps> = (props) => {
  const handleInputClick = () => {
    // When the input is clicked, call the global function to open the modal
    openDatePicker(props.value, props.onUpdate);
  };

  const hasValue = createMemo(() => !!props.value);
  const formattedValue = createMemo(() => {
    if (!props.value) return "";
    // Format the date for display, e.g., "September 15, 2025"
    return new Date(props.value).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    });
  });

  return (
    // We use a div and a button to create the "fake" input
    <div class="relative">
      <div class="absolute start-0 top-5 flex items-center ps-3.5 pointer-events-none">
        <props.icon class="size-4 text-gray-400" />
      </div>

      <button
        type="button"
        name={props.name}
        id={props.name}
        onClick={handleInputClick}
        class="peer p-4 ps-10 block w-full border bg-gray-50 rounded-lg text-sm text-left
               focus:border-indigo-500 focus:ring-indigo-500 cursor-pointer
               dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
        classList={{
          'border-red-500': !!props.error,
          'border-gray-200': !props.error,
        }}
      >
        <span classList={{
          'text-neutral-800 dark:text-neutral-200': hasValue(),
          'text-transparent': !hasValue()
        }}>
          {formattedValue() || '_'}
        </span>
      </button>

      {/* Label logic is now cleaner, based on `hasValue` */}
      <label 
        for={props.name}
        class="absolute text-sm pointer-events-none text-gray-500 dark:text-neutral-400 duration-300 transform 
               bg-gray-50 dark:bg-neutral-800 
               top-4 z-10 origin-[0] start-10 px-2"
        classList={{
          '-translate-y-6 scale-75': hasValue(),
          'translate-y-0 scale-100': !hasValue(),
        }}
      >
        {props.label}
      </label>

      <Show when={props.error}><p class="text-xs text-red-600 mt-2">{props.error}</p></Show>
    </div>
  );
};

export default FloatingDateInput;
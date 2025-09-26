import { Component, Show } from 'solid-js';
import { AiOutlineUp, AiOutlineDown } from 'solid-icons/ai';

// Define the props for our new component
interface FloatingNumeralInputProps {
  label: string;
  name: string;
  icon: Component;
  error?: string;
  value?: string | number; // Can accept a string or number
  onUpdate: (newValue: number) => void; // Emits the new number value
  min?: number;
  max?: number;
  step?: number;
}

const FloatingNumeralInput: Component<FloatingNumeralInputProps> = (props) => {
  // --- Helper functions to manage the numeric value ---
  const numericValue = () => Number(props.value) || 0;
  const step = () => props.step || 1;
  const min = () => props.min ?? -Infinity;
  const max = () => props.max ?? Infinity;

  const handleIncrement = () => {
    const newValue = Math.min(max(), numericValue() + step());
    props.onUpdate(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min(), numericValue() - step());
    props.onUpdate(newValue);
  };

  // Handles direct text input from the user
  const handleInput = (e: Event) => {
    const rawValue = (e.currentTarget as HTMLInputElement).value;
    // Allow empty input to clear the field
    if (rawValue === '') {
      props.onUpdate(0); // or another default, like `null` if your logic supports it
      return;
    }
    const parsed = parseInt(rawValue, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min(), Math.min(max(), parsed));
      props.onUpdate(clamped);
    }
  };

  return (
    <div class="relative">
      {/* Icon (same as before) */}
      <div class="absolute start-0 top-5 flex items-center ps-3.5 pointer-events-none">
        <props.icon class="size-4 text-gray-400" />
      </div>

      <input
        type="number" // Use type="number" for better mobile UX
        name={props.name}
        id={props.name}
        value={numericValue()}
        onInput={handleInput}
        // --- STYLING CHANGES ---
        class="peer p-4 ps-10 pe-12 block w-full border bg-gray-50 rounded-lg text-sm
               focus:border-indigo-500 focus:ring-indigo-500 !cursor-text
               dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300
               [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        classList={{
          'border-red-500': !!props.error,
          'border-gray-200 dark:border-neutral-700': !props.error,
        }}
        placeholder=" "
        min={props.min}
        max={props.max}
        step={props.step}
      />
      
      {/* Floating Label (same as before) */}
      <label 
        for={props.name} 
        class="absolute text-sm pointer-events-none text-gray-500 dark:text-neutral-400 duration-300 transform -translate-y-6 bg-gray-50 dark:bg-neutral-800 scale-75 top-4 z-10 origin-[0] start-10 peer-focus:text-indigo-600 peer-focus:dark:text-indigo-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-7 px-2"
      >
        {props.label}
      </label>

      {/* --- NEW: Stepper Buttons --- */}
      <div class="absolute top-0 end-0 h-full flex flex-col justify-center px-2.5">
        <button type="button" onClick={handleIncrement} class="p-1 text-gray-500 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700 disabled:opacity-50" disabled={numericValue() >= max()}>
          <AiOutlineUp class="size-3 text-black dark:text-white" />
        </button>
        <button type="button" onClick={handleDecrement} class="p-1 text-gray-500 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700 disabled:opacity-50" disabled={numericValue() <= min()}>
          <AiOutlineDown class="size-3 text-black dark:text-white" />
        </button>
      </div>

      <Show when={props.error}>
        <p class="text-xs text-red-600 mt-2">{props.error}</p>
      </Show>
    </div>
  );
};

export default FloatingNumeralInput;
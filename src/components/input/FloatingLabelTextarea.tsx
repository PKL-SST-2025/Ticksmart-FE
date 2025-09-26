import { Component, Show } from "solid-js";

interface FloatingLabelTextareaProps {
  label: string;
  name: string;
  icon: Component;
  rows?: number;
  error?: string;
  onInput: (e: Event) => void;
  value?: string;
  required?: boolean;
}

const FloatingLabelTextarea: Component<FloatingLabelTextareaProps> = (props) => {
  return (
    <div class="relative">
      {/* 
        The icon is positioned at the top-left to align with the first line of text,
        matching the feel of the single-line input.
      */}
      <div class="absolute start-0 top-4 flex items-center ps-3.5 pointer-events-none">
        <props.icon class="size-4 text-gray-400" />
      </div>

      <textarea
        name={props.name}
        id={props.name}
        value={props.value || ''}
        onInput={props.onInput}
        rows={props.rows || 4} // Use the rows prop with a default value
        class="peer p-4 ps-10 block w-full border bg-gray-50 rounded-lg text-sm
               focus:border-indigo-500 focus:ring-indigo-500
               dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
        classList={{
          'border-red-500': !!props.error,
          'border-gray-200': !props.error, // Assuming this is light-mode border
        }}
        placeholder=" " // The "magic" placeholder is essential for the label animation
        required={props.required}
      />

      {/* 
        The label uses the exact same positioning and animation classes as your
        FloatingLabelInput to ensure they are visually identical.
      */}
      <label 
        for={props.name}
        class="absolute text-sm pointer-events-none text-gray-500 dark:text-neutral-400 duration-300 transform -translate-y-6 bg-gray-50 dark:bg-neutral-800 scale-75 top-4 z-10 origin-[0] start-10 
               peer-focus:text-indigo-600 peer-focus:dark:text-indigo-500 
               peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 
               peer-focus:scale-75 peer-focus:-translate-y-7 px-2"
      >
        {props.label}
      </label>

      <Show when={props.error}>
        <p class="text-xs text-red-600 mt-2">{props.error}</p>
      </Show>
    </div>
  );
};

export default FloatingLabelTextarea;
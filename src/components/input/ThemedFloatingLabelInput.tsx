// src/components/input/ThemedFloatingLabelInput.tsx
import { Component, Show } from "solid-js";

interface ThemedFloatingLabelInputProps {
  label: string;
  name: string;
  icon: Component;
  type?: string;
  onInput: (e: Event) => void;
  value?: string;
  error?: string;
}

const ThemedFloatingLabelInput: Component<ThemedFloatingLabelInputProps> = (props) => {
  return (
    <div class="relative">
      <div class="absolute start-0 top-5 flex items-center ps-3.5 pointer-events-none">
        <props.icon class="size-4 text-neutral-400" />
      </div>
      <input 
        type={props.type || 'text'} 
        name={props.name} 
        id={props.name} 
        value={props.value || ''}
        // 👇 NEW & UPDATED CLASSES 👇
        class="peer p-4 ps-10 block w-full bg-neutral-700/50 rounded-lg text-sm text-neutral-200 cursor-text

               focus:ring-indigo-500 placeholder-transparent
               [&:-webkit-autofill]:bg-transparent
               [&:-webkit-autofill]:text-neutral-200
               [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_theme(colors.neutral.700)]
               [&:-webkit-autofill:focus]:border-indigo-500
               "
        classList={{
            'border-red-500 focus:border-red-500': !!props.error,
            'border-neutral-600 focus:border-indigo-500': !props.error
        }}
        placeholder={props.label}
        onInput={props.onInput}
      />
      <label 
        for={props.name} 
        // 👇 NEW & UPDATED CLASSES 👇
        class="absolute text-sm duration-300 transform -translate-y-7 scale-75 top-4 z-10 origin-[0] cursor-text
               start-10 px-2 pointer-events-none
               peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
               peer-focus:scale-75 peer-focus:-translate-y-6
               peer-autofill:scale-75 peer-autofill:-translate-y-6
               rounded-md
               bg-neutral-800
               peer-valid:dark:bg-transparent
                [&:-webkit-autofill]:bg-transparent
               [&:-webkit-autofill]:text-neutral-200
               [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_theme(colors.neutral.700)]
               [&:-webkit-autofill:focus]:border-indigo-500
               peer-focus:!bg-neutral-800 peer-autofill:!bg-neutral-800
               "
        classList={{
            'text-red-500 peer-focus:text-red-500': !!props.error,
            'text-neutral-400 peer-focus:text-indigo-400': !props.error
        }}
      >
        {props.label}
      </label>
      <Show when={props.error}>
        <p class="text-xs text-red-500 mt-1 ps-1">{props.error}</p>
      </Show>
    </div>
  );
};

export default ThemedFloatingLabelInput;
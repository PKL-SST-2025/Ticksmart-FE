import { Component, Show } from "solid-js";


interface FloatingLabelInputProps {
  label: string;
  name: string;
  icon: Component;
  type?: string;
  error?: string;
  onInput: (e: Event) => void;
  value?: string;
  onClick?: (e: MouseEvent) => void;
  ref?: any;
  readOnly?: boolean;
  required?: boolean;

}

const FloatingLabelInput: Component<FloatingLabelInputProps> = (props) => {
  return (
    <div ref={props.ref} class="relative" onClick={props.onClick}>
      <div class="absolute start-0 top-5 flex items-center ps-3.5 pointer-events-none">
        <props.icon class="size-4 text-gray-400" />
      </div>
      <input 
        type={props.type || 'text'} 
        name={props.name} 
        id={props.name} 
        value={props.value || ''}

        class="peer p-4 ps-10 !cursor-text block w-full border bg-gray-50 rounded-lg text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300" 
        classList={{
          'border-red-500': !!props.error,
          'border-gray-200': !props.error,
          'pointer-events-none': props.readOnly,
          'cursor-pointer': props.readOnly 
        }}
        placeholder=" " 
        onInput={props.onInput}
        readOnly={props.readOnly}
        required={props.required}
      />
      <label 
        for={props.name} 
                class="absolute text-sm pointer-events-none text-gray-500 dark:text-neutral-400 duration-300 transform -translate-y-6 bg-gray-50 dark:bg-neutral-800 scale-75 top-4 z-10 origin-[0] start-10 peer-focus:text-indigo-600 peer-focus:dark:text-indigo-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-7 px-2 peer-valid:dark:bg-neutral-800  "
      >
        {props.label}
      </label>
      <Show when={props.error}>
        <p class=" text-xs text-red-600 mt-2">{props.error}</p>
      </Show>
    </div>
  );
};

export default FloatingLabelInput;
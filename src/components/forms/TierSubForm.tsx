import type { Component } from 'solid-js';
import { createStore } from 'solid-js/store';
import { createSignal, on, createEffect, Show } from 'solid-js';
import FloatingLabelInput from '../input/FloatingLabelInput';
import FloatingLabelTextarea from '../input/FloatingLabelTextarea';
import FloatingNumeralInput from '../input/FloatingNumeralInput';
import { AiOutlineTag, AiOutlineFileText, AiOutlineTeam } from 'solid-icons/ai';
import { TempId, TierWithOffers } from './EventForm';

export type TierFormData = {
  id: number | string;
  name: string;
  description: string;
  total_inventory: number;
  offers: any[]; // Keep offers to pass them through
};


interface TierSubFormProps {
  key: number | string; // Used to reset state when switching to a new item
  initialData?: TierFormData;
    onSubmit: (formData: TierFormData) => void; 
  onCancel: () => void;
}

const TierSubForm: Component<TierSubFormProps> = (props) => {
  const [form, setForm] = createStore({
    id: props.initialData?.id || props.key,
    name: props.initialData?.name || '',
    description: props.initialData?.description || '',
    total_inventory: props.initialData?.total_inventory || 100,
    offers: props.initialData?.offers || [],
  });
    const [errors, setErrors] = createStore<Partial<Record<keyof TierFormData, string>>>({});
    const [isLoading, setIsLoading] = createSignal(false);
  const [apiError, setApiError] = createSignal<string | null>(null);


    // --- Validation Logic ---
  const validate = () => {
    const newErrors: Partial<Record<keyof TierFormData, string>> = {};
    if (!form.name.trim()) {
      newErrors.name = "Tier name is required.";
    } else if (form.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters.";
    }

    if (form.total_inventory <= 0) {
      newErrors.total_inventory = "Inventory must be greater than 0.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if valid
  };

  // --- Handlers ---
  const handleInput = (e: Event) => {
    const { name, value } = e.currentTarget as HTMLInputElement | HTMLTextAreaElement;
    setForm(name as keyof TierFormData, value);
    // Optional: clear error on input for better UX
    if (errors[name]) {
      setErrors(name, undefined);
    }
  };
  
    const handleInventoryUpdate = (newValue: number) => {
    setForm('total_inventory', newValue);
    if (errors.total_inventory) {
      setErrors('total_inventory', undefined);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setApiError(null);
    
    // Run validation. If it fails, stop submission.
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      // The parent component (EventForm) handles the async logic
    props.onSubmit(form);
    } catch (err: any) {
      setApiError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    // Use a proper <form> element
    <form class="space-y-4" onSubmit={handleSubmit} novalidate>
      <h4 class="font-semibold text-neutral-800 dark:text-neutral-200">
        {props.initialData ? 'Edit Tier' : 'Add New Tier'}
      </h4>
      
      <FloatingLabelInput 
        name="name" 
        label="Tier Name (e.g., General Admission)" 
        icon={AiOutlineTag} 
        value={form.name} 
        onInput={handleInput} 
        error={errors.name}
      />

      <FloatingLabelTextarea
        name="description"
        label="Description (Optional)"
        icon={AiOutlineFileText}
        value={form.description}
        onInput={handleInput}
        error={errors.description}
      />

      <FloatingNumeralInput 
        name="total_inventory" 
        label="Total Inventory for this Tier" 
        icon={AiOutlineTeam} 
        value={form.total_inventory} 
        onUpdate={handleInventoryUpdate} 
        min={1} 
        step={10} 
        error={errors.total_inventory}
      />
      
      <Show when={apiError()}>
        <p class="text-sm text-center text-red-500">{apiError()}</p>
      </Show>

      <div class="flex justify-end gap-3 pt-2">
        <button type="button" onClick={props.onCancel} class="px-4 py-2 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isLoading()} class="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50">
          {isLoading() ? 'Saving...' : 'Save Tier'}
        </button>
      </div>
    </form>
  );

};

export default TierSubForm;
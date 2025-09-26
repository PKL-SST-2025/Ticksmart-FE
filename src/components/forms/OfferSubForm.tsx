import { createSignal, Show, type Component } from 'solid-js';
import { createStore, } from 'solid-js/store';
import FloatingLabelInput from '../input/FloatingLabelInput';
import FloatingNumeralInput from '../input/FloatingNumeralInput';
import { AiOutlineTag, AiOutlineDollar, AiOutlineTeam } from 'solid-icons/ai';
import { TempId } from './EventForm';


export type OfferFormData = {
  id: number | string;
  name: string;
  price: number;
  quantity_for_sale: number;
};

interface OfferSubFormProps {
  key: number | string;
  tierInventory: number; // The maximum available quantity
  initialData?: OfferFormData;
  onSubmit: (formData: OfferFormData) => void;
  onCancel: () => void;
}





const OfferSubForm: Component<OfferSubFormProps> = (props) => {
  const [form, setForm] = createStore({
    id: props.initialData?.id || props.key,
    name: props.initialData?.name || '',
    price: props.initialData?.price || 0,
    quantity_for_sale: props.initialData?.quantity_for_sale || 0,
  });

  const [errors, setErrors] = createStore<Partial<Record<keyof OfferFormData, string>>>({});
  const [isLoading, setIsLoading] = createSignal(false);
  const [apiError, setApiError] = createSignal<string | null>(null);
  
  // --- Validation Logic ---
  const validate = () => {
    const newErrors: Partial<Record<keyof OfferFormData, string>> = {};
    if (!form.name.trim()) {
      newErrors.name = "Offer name is required.";
    }
    if (form.price < 0) { // Price can be 0 (free), but not negative
      newErrors.price = "Price cannot be negative.";
    }
    if (form.quantity_for_sale <= 0) {
      newErrors.quantity_for_sale = "Quantity must be at least 1.";
    }
    if (form.quantity_for_sale > props.tierInventory) {
      newErrors.quantity_for_sale = `Cannot exceed tier inventory of ${props.tierInventory}.`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Handlers ---
  const handleInput = (e: Event) => {
    const { name, value } = e.currentTarget as HTMLInputElement;
    setForm(name as keyof OfferFormData, value);
    if (errors[name]) setErrors(name, undefined);
  };
  
  const handleNumeralUpdate = (name: keyof OfferFormData, newValue: number) => {
    setForm(name, newValue);
    if (errors[name]) setErrors(name, undefined);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      props.onSubmit(form);
    } catch (err: any) {
      setApiError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };  

  return (
    <form class="space-y-4" onSubmit={handleSubmit} novalidate>
      <h4 class="font-semibold text-neutral-800 dark:text-neutral-200">
        {props.initialData ? 'Edit Offer' : 'Add New Offer'}
      </h4>
      
      <FloatingLabelInput 
        name="name" 
        label="Offer Name (e.g., Presale)" 
        icon={AiOutlineTag} 
        value={form.name} 
        onInput={handleInput}
        error={errors.name}
      />
      
      <div class="grid grid-cols-2 gap-4">
        <FloatingNumeralInput 
          name="price" 
          label="Price" 
          icon={AiOutlineDollar} 
          value={form.price} 
          onUpdate={(val) => handleNumeralUpdate('price', val)} 
          min={0}
          step={1000}
          error={errors.price}
        />
        <FloatingNumeralInput 
          name="quantity_for_sale" 
          label="Quantity" 
          icon={AiOutlineTeam} 
          value={form.quantity_for_sale} 
          onUpdate={(val) => handleNumeralUpdate('quantity_for_sale', val)} 
          min={1} 
          max={props.tierInventory}
          error={errors.quantity_for_sale}
        />
      </div>
      
      <Show when={apiError()}>
        <p class="text-sm text-center text-red-500">{apiError()}</p>
      </Show>

      <div class="flex justify-end gap-3 pt-2">
        <button type="button" onClick={props.onCancel} class="px-4 py-2 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isLoading()} class="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50">
          {isLoading() ? 'Saving...' : 'Save Offer'}
        </button>
      </div>
    </form>
  );
};

export default OfferSubForm;
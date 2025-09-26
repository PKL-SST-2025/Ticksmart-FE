import type { Component } from 'solid-js';
import { createStore } from 'solid-js/store';
import { createSignal, createEffect, Show, on } from 'solid-js';
import FloatingLabelInput from '../input/FloatingLabelInput';
import FloatingLabelSelect from '../input/FloatingLabelSelect';
import FloatingLabelTextarea from '../input/FloatingLabelTextarea'; // --- Import the new component ---
import { AiOutlineUser, AiOutlineFileText, AiOutlinePicture, AiOutlineTag } from 'solid-icons/ai';
import { Attraction } from '../../pages/organizer/dashboard/Attraction';

interface AttractionFormProps {
  initialData?: Attraction;
  onSubmit: (formData: Partial<Attraction>) => Promise<void>; 
}

const AttractionForm: Component<AttractionFormProps> = (props) => {
  const [form, setForm] = createStore<Partial<Attraction>>({
    name: '', description: '', image_url: '', type: 'music',
  });
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  createEffect(on(() => props.initialData, (data) => {
    if (data) setForm(data);
  }));

  const handleInput = (e: Event) => {
    const { name, value } = e.currentTarget as HTMLInputElement | HTMLTextAreaElement;
    setForm(name as keyof typeof form, value);
  };

  const handleTypeChange = (newValue: string) => {
    setForm('type', newValue as Attraction['type']);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (!form.name?.trim()) throw new Error("Attraction Name is required.");
      if (!form.type) throw new Error("Attraction Type is required.");
      
      await props.onSubmit(form);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const attractionTypeOptions = [
    { value: 'music', label: 'Musical Act' },
    { value: 'speaker', label: 'Speaker / Panelist' },
    { value: 'comedy', label: 'Comedy Act' },
    { value: 'special_guest', label: 'Special Guest' },
  ];

  return (
    <form class="space-y-6" onSubmit={handleSubmit}>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FloatingLabelInput name="name" label="Attraction Name" icon={AiOutlineUser} type="text" value={form.name} onInput={handleInput} required />
        <FloatingLabelSelect 
          name="type" 
          label="Attraction Type" 
          icon={AiOutlineTag} 
          options={attractionTypeOptions} 
          value={form.type!} 
          onChange={handleTypeChange}
        />
      </div>

      {/* --- THE REPLACEMENT --- */}
      {/* The old label and textarea are replaced with our new, single component */}
      <FloatingLabelTextarea
        name="description"
        label="Description"
        icon={AiOutlineFileText}
        value={form.description || ''}
        onInput={handleInput}
        rows={4}
      />

      <FloatingLabelInput name="image_url" label="Image URL" icon={AiOutlinePicture} type="url" value={form.image_url || ''} onInput={handleInput} />
      
      <Show when={error()}><p class="text-sm text-center text-red-500">{error()}</p></Show>
      
      <div class="pt-4 flex justify-end">
        <button type="submit" disabled={isLoading()} class="px-6 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
          {isLoading() ? 'Saving...' : 'Save Attraction'}
        </button>
      </div>
    </form>
  );
};

export default AttractionForm;
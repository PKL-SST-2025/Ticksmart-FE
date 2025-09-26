import { Component, createSignal, Show } from 'solid-js';
import FloatingLabelInput from '../input/FloatingLabelInput';
import { AiOutlineTag } from 'solid-icons/ai';


interface CategoryFormProps {
  initialName?: string;
  itemType: string;
  // This prop expects an async function to perform the actual API call
  onSubmit: (name: string) => Promise<void>;
}

const CategoryForm: Component<CategoryFormProps> = (props) => {
  const [name, setName] = createSignal(props.initialName || '');
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!name().trim()) {
      setError("Name cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // The parent component handles the API call and success/failure
      await props.onSubmit(name());
    } catch (err: any) {
      setError(err.message || `Failed to save ${props.itemType}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form class="space-y-6" onSubmit={handleSubmit}>
      <FloatingLabelInput 
        name="name" 
        label={`${props.itemType} Name`} 
        icon={AiOutlineTag} 
        value={name()}
        onInput={(e) => setName(e.currentTarget.value)}
        required
      />
      <Show when={error()}><p class="text-sm text-center text-red-500">{error()}</p></Show>
      <div class="pt-2 flex justify-end">
        <button type="submit" disabled={isLoading()} class="px-6 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
          {isLoading() ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
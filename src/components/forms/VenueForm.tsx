import type { Component } from 'solid-js';
import { createStore  } from 'solid-js/store';
import { createSignal, on, createEffect, Show } from 'solid-js';
import FloatingLabelInput from '../input/FloatingLabelInput';
import LocationPickerMap, { type LocationData } from '../map/LocationPickerMap';
import FloatingNumeralInput from '../input/FloatingNumeralInput';
import { AiOutlineEnvironment, AiOutlineTeam, AiOutlineUser } from 'solid-icons/ai';
import { Venue } from '../../types/models';
import FloatingLabelSelect from '../input/FloatingLabelSelect';
import { sendRequest } from '../../utils/SendRequest';



interface VenueFormProps {
  initialData?: Partial<Venue>;
  // This prop now expects an async function to perform the API call
  onSubmit: (formData: Partial<Venue>) => Promise<void>; 
    isAdmin?: boolean;
}

const VenueForm: Component<VenueFormProps> = (props) => {
  const [form, setForm] = createStore<Partial<Venue>>({
    name: '', address_line_1: '', city: '', postal_code: '', country: '', 
    capacity: 0, latitude: null, longitude: null,
  });
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

    // NEW: State to hold the list of organizers for the dropdown
  const [organizers, setOrganizers] = createSignal<{ value: string, label: string }[]>([]);

  // Fetch organizers if in admin mode
  createEffect(() => {
    if (props.isAdmin) {
      sendRequest<{id: number, username: string, role: string}[]>('/admin/users') // Assuming an endpoint to get users
        .then(users => {
          const organizerOptions = users
            .filter(u => u.role === 'organizer') // Assuming user object has a role
            .map(u => ({ value: String(u.id), label: u.username }));
          setOrganizers(organizerOptions);
        });
    }
  });

  createEffect(on(() => props.initialData, (data) => { if (data) setForm(data); }));


  createEffect(on(() => props.initialData, (data) => {
    if (data) setForm(data);
  }));

  const handleInput = (e: Event) => {
    const { name, value } = e.currentTarget as HTMLInputElement;
    setForm(name as keyof typeof form, value);
  };
  
  const handleCapacityUpdate = (newValue: number) => {
    setForm('capacity', newValue);
  };

  const handleMapLocationChange = (data: LocationData) => {
    setForm({
      ...form,
      latitude: data.latitude, longitude: data.longitude,
      address_line_1: data.address_line_1, city: data.city,
      postal_code: data.postal_code, country: data.country,
    });
  };

  const handleOrganizerChange = (newValue: string) => {
    setForm('organizer_id', Number(newValue));
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (!form.name?.trim()) throw new Error("Venue Name is required.");
      if (props.isAdmin && !form.organizer_id) throw new Error("An organizer must be selected.");
      
      await props.onSubmit(form);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form class="space-y-6" onSubmit={handleSubmit}>
      <LocationPickerMap latitude={form.latitude} longitude={form.longitude} onLocationChange={handleMapLocationChange} />
            {/* --- NEW: Conditional Organizer Select for Admins --- */}
      <Show when={props.isAdmin}>
        <FloatingLabelSelect 
          name="organizer_id"
          label="Assign to Organizer"
          icon={AiOutlineUser}
          options={organizers()}
          value={String(form.organizer_id || '')}
          onChange={handleOrganizerChange}
        />
      </Show>

      <FloatingLabelInput name="name" label="Venue Name" icon={AiOutlineEnvironment} type="text" value={form.name} onInput={handleInput} required />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FloatingLabelInput name="address_line_1" label="Address" icon={AiOutlineEnvironment} type="text" value={form.address_line_1 || ''} onInput={handleInput} />
        <FloatingLabelInput name="city" label="City" icon={AiOutlineEnvironment} type="text" value={form.city} onInput={handleInput} required />
        <FloatingLabelInput name="postal_code" label="Postal Code" icon={AiOutlineEnvironment} type="text" value={form.postal_code} onInput={handleInput} required />
        <FloatingLabelInput name="country" label="Country" icon={AiOutlineEnvironment} type="text" value={form.country} onInput={handleInput} required />
        <div class="sm:col-span-2">
          <FloatingNumeralInput name="capacity" label="Capacity" icon={AiOutlineTeam} value={form.capacity || 0} onUpdate={handleCapacityUpdate} min={0} step={50} />
        </div>
      </div>

      <Show when={error()}><p class="text-sm text-center text-red-500">{error()}</p></Show>

      <div class="pt-4 flex justify-end">
        <button type="submit" disabled={isLoading()} class="px-6 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
          {isLoading() ? 'Saving...' : 'Save Venue'}
        </button>
      </div>
    </form>
  );
};

export default VenueForm;
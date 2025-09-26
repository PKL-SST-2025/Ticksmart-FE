import type { Component } from 'solid-js';
import { createStore  } from 'solid-js/store';
import { createSignal, on, createEffect, Show } from 'solid-js';
import FloatingLabelInput from '../input/FloatingLabelInput';
import FloatingLabelSelect from '../input/FloatingLabelSelect';
import { AiOutlineUser, AiOutlineMail, AiOutlineKey, AiOutlineTeam } from 'solid-icons/ai';

// --- Type Definition ---
type UserFormData = {
  id?: number | null;
  username: string;
  email: string;
  password?: string;
  role: 'attendee' | 'organizer';
};

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  // This prop expects an async function to perform the API call
  onSubmit: (formData: Partial<UserFormData>) => Promise<void>;
}

const UserForm: Component<UserFormProps> = (props) => {
  const [form, setForm] = createStore<Partial<UserFormData>>({
    username: '', email: '', password: '', role: 'attendee',
  });
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const isEditing = () => !!props.initialData?.id;

  createEffect(on(() => props.initialData, (data) => {
    if (data) setForm(data);
  }));

  const handleInput = (e: Event) => {
    const { name, value } = e.currentTarget as HTMLInputElement;
    setForm(name as keyof typeof form, value);
  };

  const handleRoleChange = (newValue: string) => {
    setForm('role', newValue as UserFormData['role']);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (!form.username?.trim()) throw new Error("Username is required.");
      if (!form.email?.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) throw new Error("A valid email is required.");
      if (!isEditing() && (form.password?.length || 0) < 8) throw new Error("Password must be at least 8 characters for new users.");
      
      // The parent component handles the API call
      await props.onSubmit(form);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'attendee', label: 'Attendee' },
    { value: 'organizer', label: 'Organizer' },
  ];

  return (
    <form class="space-y-6" onSubmit={handleSubmit}>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FloatingLabelInput name="username" label="Username" icon={AiOutlineUser} type="text" value={form.username} onInput={handleInput} required />
        <FloatingLabelSelect name="role" label="Role" icon={AiOutlineTeam} options={roleOptions} value={form.role!} onChange={handleRoleChange} />
      </div>
      <FloatingLabelInput name="email" label="Email Address" icon={AiOutlineMail} type="email" value={form.email} onInput={handleInput} required />
      
      {/* Password field logic is enhanced for editing vs. creating */}
      <FloatingLabelInput 
        name="password" 
        label={isEditing() ? "New Password (Optional)" : "Password"}
        icon={AiOutlineKey} 
        type="password" 
        value={form.password} 
        onInput={handleInput} 
        required={!isEditing()} 
      />

      <Show when={error()}><p class="text-sm text-center text-red-500">{error()}</p></Show>
      
      <div class="pt-4 flex justify-end">
        <button type="submit" disabled={isLoading()} class="px-6 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
          {isLoading() ? 'Saving...' : 'Save User'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
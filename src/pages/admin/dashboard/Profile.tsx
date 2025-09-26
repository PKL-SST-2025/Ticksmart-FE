import { Component, createSignal, Show } from "solid-js";
import {
  AiOutlineUser,
  AiOutlineMail,
  AiOutlineKey,
  AiOutlineBlock
} from 'solid-icons/ai';
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import FloatingLabelSelect from "../../../components/input/FloatingLabelSelect";
import { A } from "@solidjs/router";


// --- Data Structure (based on your schema) ---
interface AdminProfile {
  id: number;
  email: string;
  username: string;
  role: 'superadmin' | 'moderator';
  is_active: boolean;
  avatarUrl: string;
  created_at: Date;
  last_login_at: Date | null;
}

// --- Mock Data ---
// In a real app, this would come from an API call or a global store.
const mockAdmin: AdminProfile = {
  id: 1,
  email: "james.collison@site.com",
  username: "James Collison",
  role: 'superadmin',
  is_active: true,
  avatarUrl: "https://images.unsplash.com/photo-1659482633369-9fe69af50bfb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=3&w=320&h=320&q=80",
  created_at: new Date('2023-01-15T10:30:00Z'),
  last_login_at: new Date('2024-05-21T09:00:00Z'),
};

const AdminProfilePage: Component = () => {
  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = createSignal({
    username: mockAdmin.username,
    email: mockAdmin.email,
    role: mockAdmin.role,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = createSignal("");

  const handleInput = (e: Event) => {
    const { name, value } = e.currentTarget as HTMLInputElement | HTMLSelectElement;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    if (errors()[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };
  
  const roleOptions = [
    { value: 'superadmin', label: 'Super Administrator' },
    { value: 'moderator', label: 'Moderator' }
  ];

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setSuccessMessage(""); // Clear previous success message
    const newErrors: Record<string, string> = {};

    // Basic Validation
    if (!formData().username) newErrors.username = "Username cannot be empty.";
    if (!formData().email.includes('@')) newErrors.email = "Please enter a valid email.";
    if (formData().newPassword && formData().newPassword !== formData().confirmPassword) {
      newErrors.confirmPassword = "New passwords do not match.";
    }
    
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // In a real app, you would send this data to your API
      console.log("Submitting form data:", formData());
      setSuccessMessage("Profile updated successfully!");
      // Optionally reset password fields
      setFormData(prev => ({...prev, currentPassword: "", newPassword: "", confirmPassword: ""}));
    }
  };

  return (
    <main class="w-full min-h-screen bg-zinc-100 dark:bg-neutral-900 p-4 sm:p-6 lg:p-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-neutral-200">Admin Profile</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-neutral-400">Manage your profile details and password.</p>
        
        <form onSubmit={handleSubmit}>
          <div class="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3">
            {/* --- Left Column: Profile Card --- */}
            <div class="lg:col-span-1">
              <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6 text-center">
                <div class="relative inline-block mx-auto">
                  <img class="inline-block size-32 rounded-full ring-2 ring-white dark:ring-neutral-700" src={mockAdmin.avatarUrl} alt="Admin Avatar" />
                  <span class="absolute block end-3 bottom-2 size-4 rounded-full ring-2 ring-white dark:ring-neutral-800" classList={{ 'bg-green-400': mockAdmin.is_active, 'bg-gray-400': !mockAdmin.is_active }}></span>
                </div>
                <h2 class="mt-4 text-xl font-semibold text-gray-800 dark:text-neutral-200">{mockAdmin.username}</h2>
                <p class="text-sm text-gray-500 dark:text-neutral-400">{mockAdmin.email}</p>
                <div class="mt-3">
                   <span class="py-1 px-2.5 inline-flex items-center gap-x-1.5 text-xs font-medium rounded-full"
                      classList={{
                        'bg-indigo-100 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-500': mockAdmin.role === 'superadmin',
                        'bg-teal-100 text-teal-800 dark:bg-teal-800/30 dark:text-teal-500': mockAdmin.role === 'moderator'
                      }}
                   >
                    {mockAdmin.role.charAt(0).toUpperCase() + mockAdmin.role.slice(1)}
                  </span>
                </div>
                <div class="mt-6 text-sm text-left space-y-2 text-gray-600 dark:text-neutral-400">
                  <p><strong>Last Login:</strong> {mockAdmin.last_login_at?.toLocaleDateString() || 'Never'}</p>
                  <p><strong>Member Since:</strong> {mockAdmin.created_at.toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* --- Right Column: Form Fields --- */}
            <div class="lg:col-span-2 space-y-6">
              {/* Personal Info Card */}
              <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
                <div class="border-b border-gray-200 dark:border-neutral-700 p-4 sm:p-6">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-neutral-200">Personal Information</h3>
                </div>
                <div class="p-4 sm:p-6 space-y-6">
                  <FloatingLabelInput
                    label="Username"
                    name="username"
                    icon={AiOutlineUser}
                    value={formData().username}
                    onInput={handleInput}
                    error={errors().username}
                  />
                  <FloatingLabelInput
                    label="Email Address"
                    name="email"
                    type="email"
                    icon={AiOutlineMail}
                    value={formData().email}
                    onInput={handleInput}
                    error={errors().email}
                  />
                   <FloatingLabelSelect
                    label="Role"
                    name="role"
                    icon={AiOutlineBlock}
                    options={roleOptions}
                    onChange={handleInput}
                    value={formData().role}
                    error={errors().role}
                  />
                </div>
              </div>

              {/* Change Password Card */}
              <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
                <div class="border-b border-gray-200 dark:border-neutral-700 p-4 sm:p-6">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-neutral-200">Change Password</h3>
                </div>
                <div class="p-4 sm:p-6 space-y-6">
                  <FloatingLabelInput
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    icon={AiOutlineKey}
                    value={formData().currentPassword}
                    onInput={handleInput}
                    error={errors().currentPassword}
                  />
                  <FloatingLabelInput
                    label="New Password"
                    name="newPassword"
                    type="password"
                    icon={AiOutlineKey}
                    value={formData().newPassword}
                    onInput={handleInput}
                    error={errors().newPassword}
                  />
                  <FloatingLabelInput
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    icon={AiOutlineKey}
                    value={formData().confirmPassword}
                    onInput={handleInput}
                    error={errors().confirmPassword}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div class="flex justify-end items-center gap-x-4">
                <Show when={successMessage()}>
                  <p class="text-sm text-green-600 dark:text-green-500">{successMessage()}</p>
                </Show>
                <A href="/admin">
                    <button type="button" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700">
                    Cancel
                    </button>
                </A>
                <button type="submit" class="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none">
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AdminProfilePage;
import { Component, createSignal, Show } from "solid-js";
import {
  AiOutlineUser,
  AiOutlineMail,
  AiOutlineKey,
  AiOutlinePhone,
  AiOutlineGlobal,
  AiOutlineBuild
} from 'solid-icons/ai';
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import { A } from "@solidjs/router";


// --- Data Structure (based on your schemas) ---
interface OrganizerProfile {
  id: number;
  email: string;
  username: string;
  avatarUrl: string; // Common UI element, added for visuals
  created_at: Date;
  // From organizer_profiles table
  company_name: string | null;
  contact_phone: string | null;
  website_url: string | null;
}

// --- Mock Data ---
// In a real app, this would be fetched via an API call (e.g., GET /api/profile)
const mockOrganizer: OrganizerProfile = {
  id: 101,
  email: "contact@eventcorp.com",
  username: "EventCorp",
  avatarUrl: "https://images.unsplash.com/photo-1543269664-7eef42226a21?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=3&w=320&h=320&q=80",
  created_at: new Date('2022-08-20T14:00:00Z'),
  company_name: "EventCorp Inc.",
  contact_phone: "+1 (555) 123-4567",
  website_url: "https://www.eventcorp.com",
};

const OrganizerProfilePage: Component = () => {
  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = createSignal({
    username: mockOrganizer.username,
    email: mockOrganizer.email,
    company_name: mockOrganizer.company_name || "",
    contact_phone: mockOrganizer.contact_phone || "",
    website_url: mockOrganizer.website_url || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = createSignal<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = createSignal("");

  const handleInput = (e: Event) => {
    const { name, value } = e.currentTarget as HTMLInputElement;
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

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setSuccessMessage("");
    const newErrors: Record<string, string> = {};

    // Basic Validation
    if (!formData().username) newErrors.username = "Username cannot be empty.";
    if (!formData().email.includes('@')) newErrors.email = "Please enter a valid email.";
    if (formData().website_url && !formData().website_url.startsWith('http')) {
        newErrors.website_url = "Website URL must start with http or https.";
    }
    if (formData().newPassword && formData().newPassword.length < 8) {
        newErrors.newPassword = "New password must be at least 8 characters.";
    }
    if (formData().newPassword && formData().newPassword !== formData().confirmPassword) {
      newErrors.confirmPassword = "New passwords do not match.";
    }
    
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Submitting organizer profile data:", formData());
      setSuccessMessage("Profile updated successfully!");
      setFormData(prev => ({...prev, currentPassword: "", newPassword: "", confirmPassword: ""}));
    }
  };

  return (
    <main class="w-full min-h-screen bg-zinc-100 dark:bg-neutral-900 p-4 sm:p-6 lg:p-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-neutral-200">Organizer Profile</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-neutral-400">Manage your organization's details and your account password.</p>
        
        <form onSubmit={handleSubmit}>
          <div class="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3">
            {/* --- Left Column: Profile Card --- */}
            <div class="lg:col-span-1">
              <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-6">
                <div class="text-center">
                  <img class="inline-block size-32 rounded-full ring-2 ring-white dark:ring-neutral-700" src={mockOrganizer.avatarUrl} alt="Organizer Avatar" />
                  <h2 class="mt-4 text-xl font-semibold text-gray-800 dark:text-neutral-200">{formData().username}</h2>
                  <p class="text-sm text-gray-500 dark:text-neutral-400">{formData().email}</p>
                </div>
                <div class="mt-6 pt-6 border-t border-gray-200 dark:border-neutral-700 text-sm text-gray-600 dark:text-neutral-400 space-y-3">
                    <p class="flex items-center gap-x-3"><AiOutlineBuild class="size-5 text-gray-500"/> <strong>Company:</strong> {formData().company_name || 'N/A'}</p>
                    <p class="flex items-center gap-x-3"><AiOutlineGlobal class="size-5 text-gray-500"/> <strong>Website:</strong> <a href={formData().website_url || '#'} target="_blank" class="text-blue-600 hover:underline">{formData().website_url || 'N/A'}</a></p>
                    <p class="flex items-center gap-x-3"><AiOutlinePhone class="size-5 text-gray-500"/> <strong>Phone:</strong> {formData().contact_phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* --- Right Column: Form Fields --- */}
            <div class="lg:col-span-2 space-y-6">
              {/* Account Info Card */}
              <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
                <div class="border-b border-gray-200 dark:border-neutral-700 p-4 sm:p-6">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-neutral-200">Account Information</h3>
                </div>
                <div class="p-4 sm:p-6 space-y-6">
                  <FloatingLabelInput label="Username" name="username" icon={AiOutlineUser} value={formData().username} onInput={handleInput} error={errors().username} />
                  <FloatingLabelInput label="Email Address" name="email" type="email" icon={AiOutlineMail} value={formData().email} onInput={handleInput} error={errors().email} />
                </div>
              </div>

              {/* Organizer Details Card */}
              <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
                <div class="border-b border-gray-200 dark:border-neutral-700 p-4 sm:p-6">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-neutral-200">Organizer Details</h3>
                </div>
                <div class="p-4 sm:p-6 space-y-6">
                  <FloatingLabelInput label="Company Name" name="company_name" icon={AiOutlineBuild} value={formData().company_name} onInput={handleInput} error={errors().company_name} />
                  <FloatingLabelInput label="Contact Phone" name="contact_phone" type="tel" icon={AiOutlinePhone} value={formData().contact_phone} onInput={handleInput} error={errors().contact_phone} />
                  <FloatingLabelInput label="Website URL" name="website_url" type="url" icon={AiOutlineGlobal} value={formData().website_url} onInput={handleInput} error={errors().website_url} />
                </div>
              </div>

              {/* Change Password Card */}
              <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
                <div class="border-b border-gray-200 dark:border-neutral-700 p-4 sm:p-6">
                  <h3 class="text-lg font-semibold text-gray-800 dark:text-neutral-200">Change Password</h3>
                </div>
                <div class="p-4 sm:p-6 space-y-6">
                  <FloatingLabelInput label="Current Password" name="currentPassword" type="password" icon={AiOutlineKey} value={formData().currentPassword} onInput={handleInput} error={errors().currentPassword} />
                  <FloatingLabelInput label="New Password" name="newPassword" type="password" icon={AiOutlineKey} value={formData().newPassword} onInput={handleInput} error={errors().newPassword} />
                  <FloatingLabelInput label="Confirm New Password" name="confirmPassword" type="password" icon={AiOutlineKey} value={formData().confirmPassword} onInput={handleInput} error={errors().confirmPassword} />
                </div>
              </div>

              {/* Form Actions */}
              <div class="flex justify-end items-center gap-x-4">
                <Show when={successMessage()}>
                  <p class="text-sm text-green-600 dark:text-green-500">{successMessage()}</p>
                </Show>
                <A href="/organizer">
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

export default OrganizerProfilePage;
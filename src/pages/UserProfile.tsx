import type { Component } from 'solid-js';
import { createStore } from 'solid-js/store';
import { createSignal, Show, For, createEffect,on } from 'solid-js';
import DashboardLayout from '../layouts/DashboardLayout';
import FloatingLabelInput from '../components/input/FloatingLabelInput';
import FloatingLabelTextarea from '../components/input/FloatingLabelTextarea';
import FloatingDateInput from '../components/input/FloatingLabelInput';
import { useUser } from '../context/UserContext';
import { sendRequest } from '../utils/SendRequest';

import { 
  AiOutlineUser, AiOutlineMail, AiOutlinePhone, AiOutlineCalendar, 
  AiOutlineEnvironment, AiOutlineFileText, AiOutlineEdit, AiOutlineSave, 
  AiOutlineClockCircle, AiOutlineSlackSquare,
  AiOutlineKey
} from 'solid-icons/ai';

// --- Helper Sub-components ---
const ProfileHeader: Component<{ fullName: string; email: string; location: string }> = (props) => {
  const initials = () => props.fullName.split(' ').map(n => n[0]).join('').substring(0, 2);
  return (
    <div class="flex items-center gap-4 sm:gap-6">
      <div class="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center border-4 border-white dark:border-neutral-800">
        <span class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{initials()}</span>
      </div>
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-neutral-800 dark:text-neutral-200">{props.fullName}</h2>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">{props.email}</p>
        <p class="mt-1 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <AiOutlineEnvironment /> {props.location}
        </p>
      </div>
    </div>
  );
};

const ProfileStatCard: Component<{ value: number; label: string; icon: Component }> = (props) => (
  <div class="bg-neutral-100 dark:bg-neutral-900/50 p-4 rounded-lg flex items-center gap-4">
    <div class="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-md">
      <props.icon class="size-5 text-indigo-600 dark:text-indigo-400" />
    </div>
    <div>
      <p class="text-xl font-bold text-neutral-800 dark:text-neutral-200">{props.value}</p>
      <p class="text-xs text-neutral-500 dark:text-neutral-400">{props.label}</p>
    </div>
  </div>
);

const InfoDisplay: Component<{ label: string; value: string; icon: Component }> = (props) => (
  <div>
    <label class="text-xs font-medium text-neutral-500 dark:text-neutral-400">{props.label}</label>
    <p class="mt-1 flex items-center gap-2 text-sm text-neutral-800 dark:text-neutral-200">
      <props.icon class="size-4 text-neutral-400" />
      <span>{props.value || '-'}</span>
    </p>
  </div>
);

// --- Main Page Component ---
const UserProfile: Component = () => {
  const { user, refetchUser, isLoading: isUserLoading } = useUser();
  
  const [isEditing, setIsEditing] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);
  const [apiError, setApiError] = createSignal<string | null>(null);

  // Mock data for display, to be replaced by user() object fields
  const mockExtraData = {
    phone: '+62 812-3456-7890',
    dateOfBirth: '1995-05-15',
    location: 'Jakarta, Indonesia',
    bio: 'Music enthusiast and concert lover. Always looking for the next great show!',
    favoriteGenres: ['Rock', 'Jazz', 'Electronic'],
    totalTickets: 15,
    upcomingEvents: 3
  };

  const [editData, setEditData] = createStore({
    username: '', email: '',
  });

    const [password, setPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [passwordError, setPasswordError] = createSignal<string | null>(null);

  createEffect(() => {
    const currentUser = user();
    if (currentUser) {
      setEditData({ username: currentUser.username, email: currentUser.email });
    }
  });

  const handleEdit = () => {
    const currentUser = user();
    if (currentUser) setEditData({ username: currentUser.username, email: currentUser.email });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Clear any password inputs when cancelling
    setPassword('');
    setConfirmPassword('');
    setPasswordError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setApiError(null);
    setPasswordError(null);

    // --- NEW: Password Validation ---
    if (password()) {
      if (password().length < 8) {
        setPasswordError("New password must be at least 8 characters.");
        setIsSaving(false);
        return;
      }
      if (password() !== confirmPassword()) {
        setPasswordError("Passwords do not match.");
        setIsSaving(false);
        return;
      }
    }

    try {
      // --- NEW: Conditional Payload ---
      // Start with the base profile data
      const payload: { username: string; email: string; password?: string } = { ...editData };
      // Only add the password to the payload if the user entered a new one
      if (password()) {
        payload.password = password();
      }

      await sendRequest('/users/me', {
        method: 'PATCH',
        body: payload,
      });
      
      await refetchUser();
      setIsEditing(false);
      // Clear password fields on successful save
      setPassword('');
      setConfirmPassword('');

    } catch (err: any) {
      setApiError(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <DashboardLayout>
      <div class="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
        <Show when={!isUserLoading()} fallback={<p class="text-center">Loading profile...</p>}>
          <Show when={user()} fallback={<p class="text-center">Could not load user profile. Please try logging in again.</p>}>
            {(currentUser) => (
              <>
                {/* --- Header Section --- */}
                <div class="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Your Profile</h1>
                    <p class="mt-1 text-neutral-500 dark:text-neutral-400">Manage your account information and preferences.</p>
                  </div>
                  <Show
                    when={isEditing()}
                    fallback={
                      <button onClick={handleEdit} class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                        <AiOutlineEdit /> Edit Profile
                      </button>
                    }
                  >
                    <div class="flex items-center gap-3">
                      <button onClick={handleCancel} class="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">
                        Cancel
                      </button>
                      <button onClick={handleSave} disabled={isSaving()} class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50">
                        {isSaving() ? 'Saving...' : <><AiOutlineSave /> Save Changes</>}
                      </button>
                    </div>
                  </Show>
                </div>
                
                <Show when={apiError()}><p class="mb-4 text-center text-sm text-red-500 p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">{apiError()}</p></Show>

                {/* --- Main Content Grid --- */}
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div class="lg:col-span-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6">
                    <ProfileHeader fullName={currentUser().username} email={currentUser().email} location={mockExtraData.location} />
                    <div class="my-6 border-t border-neutral-200 dark:border-neutral-700"></div>
                    
                    <Show
                      when={isEditing()}
                      fallback={
                        <div class="space-y-6">
                          <h3 class="font-semibold text-neutral-800 dark:text-neutral-200">Personal Information</h3>
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                            <InfoDisplay label="Username" value={currentUser().username} icon={AiOutlineUser} />
                            <InfoDisplay label="Email Address" value={currentUser().email} icon={AiOutlineMail} />
                          </div>
                        </div>
                      }
                    >
                      {/* --- EDITING FORM --- */}
                      <div class="space-y-6">
                        <h3 class="font-semibold text-neutral-800 dark:text-neutral-200">Edit Information</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <FloatingLabelInput name="username" label="Username" icon={AiOutlineUser} type="text" value={editData.username} onInput={(e) => setEditData('username', e.currentTarget.value)} />
                          <FloatingLabelInput name="email" label="Email Address" icon={AiOutlineMail} type="email" value={editData.email} onInput={(e) => setEditData('email', e.currentTarget.value)} />
                        </div>
                      </div>
                    </Show>
                  </div>


                  <div class="space-y-8">
                    {/* --- NEW: Change Password Card (Only visible in edit mode) --- */}
                    <Show when={isEditing()}>
                      <div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 space-y-4">
                        <h3 class="font-semibold text-neutral-800 dark:text-neutral-200">Change Password</h3>
                        <FloatingLabelInput name="password" label="New Password" icon={AiOutlineKey} type="password" value={password()} onInput={(e) => setPassword(e.currentTarget.value)} />
                        <FloatingLabelInput name="confirmPassword" label="Confirm New Password" icon={AiOutlineKey} type="password" value={confirmPassword()} onInput={(e) => setConfirmPassword(e.currentTarget.value)} />
                        <Show when={passwordError()}>
                          <p class="text-xs text-red-600">{passwordError()}</p>
                        </Show>
                      </div>
                    </Show>

                  </div>
                </div>
              </>
            )}
          </Show>
        </Show>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useUser } from '../context/UserContext';
import { AiOutlineWarning, AiOutlineLogout } from 'solid-icons/ai';

const BannedPage: Component = () => {
  const { logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    // After the context clears the user, we manually navigate.
    navigate('/login');
  };

  return (
    <main class="min-h-screen w-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md text-center bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/50">
          <AiOutlineWarning class="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 class="mt-6 text-2xl font-bold text-neutral-800 dark:text-neutral-200">
          Account Suspended
        </h1>
        <p class="mt-2 text-neutral-600 dark:text-neutral-400">
          Your account has been suspended due to a violation of our terms of service. You will not be able to access any platform features.
        </p>
        <p class="mt-4 text-sm text-neutral-500 dark:text-neutral-500">
          If you believe this is a mistake, please contact our support team.
        </p>
        <div class="mt-8">
          <button
            onClick={handleLogout}
            class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <AiOutlineLogout />
            Logout
          </button>
        </div>
      </div>
    </main>
  );
};

export default BannedPage;
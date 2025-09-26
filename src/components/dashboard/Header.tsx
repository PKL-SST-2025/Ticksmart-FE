import { Component, createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { A, useNavigate } from '@solidjs/router';
import { useUI } from "../../context/UIContext"; // Import our new context hook

import { 
  AiOutlineBell, 
  AiOutlineUser, 
  AiOutlineSetting, 
  AiOutlineLogout,
  AiOutlineMenu,
  AiOutlineDown
} from 'solid-icons/ai';
import { useUser } from "../../context/UserContext";
import { useAdmin } from "../../context/AdminContext";

const DashboardHeader: Component = () => {
  const { openSidebar } = useUI();
  const navigate = useNavigate();
  
  // --- REAL CONTEXT INTEGRATION ---
  const userContext = useUser();
  const adminContext = useAdmin();

  // This memo unifies the user/admin data for display
  const currentUser = createMemo(() => {
    if (adminContext.isAdminAuthenticated()) {
      return {
        name: adminContext.admin()!.username,
        email: adminContext.admin()!.email,
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?&w=320&h=320&fit=facearea&facepad=3", // Placeholder admin avatar
      };
    }
    if (userContext.isAuthenticated()) {
      return {
        name: userContext.user()!.username,
        email: userContext.user()!.email,
        avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?&w=320&h=320&fit=facearea&facepad=3", // Placeholder user avatar
      };
    }
    return null;
  });

  const userActions = [
    { text: "Your Profile", href: "/profile", icon: AiOutlineUser },
  ];

  // --- Self-Contained Dropdown Logic ---
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  let dropdownRef: HTMLDivElement | undefined;
  onMount(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    onCleanup(() => document.removeEventListener('mousedown', handleClickOutside));
  });

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    if (adminContext.isAdminAuthenticated()) {
      await adminContext.logout();
      navigate('/admin/login');
    } else {
      await userContext.logout();
      navigate('/login');
    }
  };

  return (
    <header class="sticky top-0 z-20 w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
      <nav class="px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          
          <div class="lg:hidden">
            <button
              type="button"
              onClick={openSidebar}
              class="-ml-2 p-2 text-neutral-500 dark:text-neutral-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <span class="sr-only">Open sidebar</span>
              <AiOutlineMenu class="w-6 h-6" />
            </button>
          </div>

          <div class="flex-grow"></div>
          
          <div class="flex items-center gap-x-4">
            <Show when={currentUser()} fallback={
              <A href="/login" class="text-sm font-semibold text-indigo-600 hover:underline">Sign In</A>
            }>
              {(user) => (
                <div class="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    class="flex items-center gap-x-2 rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen())}
                  >
                    <img class="size-9 rounded-full" src={user().avatarUrl} alt="User Avatar" />
                    <div class="text-left hidden sm:block">
                      <span class="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">{user().name}</span>
                      <span class="block text-xs text-neutral-500 dark:text-neutral-400">{user().email}</span>
                    </div>
                    <AiOutlineDown class={`size-4 text-neutral-500 transition-transform hidden sm:block ${isDropdownOpen() ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <div 
                    class="absolute right-0 mt-2 w-60 origin-top-right rounded-xl shadow-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-all duration-200"
                    classList={{
                      'opacity-100 scale-100': isDropdownOpen(),
                      'opacity-0 scale-95 pointer-events-none': !isDropdownOpen()
                    }}
                  >
                    <div class="p-2">
                      <div class="px-3 py-2 sm:hidden border-b border-neutral-200 dark:border-neutral-700 mb-2">
                        <span class="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">{user().name}</span>
                        <span class="block text-xs text-neutral-500 dark:text-neutral-400">{user().email}</span>
                      </div>
                      
                      <For each={userActions}>
                        {(action) => (
                          <A 
                            href={action.href} 
                            class="group w-full flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <action.icon class="size-4 text-neutral-400" />
                            {action.text}
                          </A>
                        )}
                      </For>
                      
                      <div class="my-2 mx-8 border-t border-neutral-200 dark:border-neutral-700"></div>

                      <a
                      href="#"
                        onClick={(e) => { e.preventDefault(); handleLogout(); }}
                        class="group w-full flex items-center cursor-pointer gap-x-3.5 py-2 px-3 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
                      >
                        <AiOutlineLogout class="size-4 text-red-500" />
                        Logout
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </Show>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default DashboardHeader;
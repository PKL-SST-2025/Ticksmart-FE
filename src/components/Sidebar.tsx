import { Component, For, createSignal, createEffect, onMount, onCleanup } from 'solid-js';
import { A, useLocation, useNavigate } from '@solidjs/router';
import { useUI } from '../context/UIContext'; // For mobile open/close state
import { useUser } from '../context/UserContext'; // For the logout function

// Using consistent icons from a single library
import { 
  AiOutlineAppstore, 
  AiOutlineFileText, 
  AiOutlineUser, 
  AiOutlineLogout,
  AiOutlineMenu,
  AiOutlineClose
} from 'solid-icons/ai';

// --- Data-Driven Navigation (Self-Contained) ---
// These are the links specifically for a standard user.
const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: AiOutlineAppstore },
  { href: '/orders', label: 'My Orders', icon: AiOutlineFileText },
  { href: '/profile', label: 'Profile', icon: AiOutlineUser },
];

const Sidebar: Component = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen, closeSidebar, openSidebar } = useUI();
  const { logout } = useUser(); // Get the logout function from the context

  // Improved active check to handle nested routes
  const isActive = (href: string) => {
    if (href === '/dashboard') return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  // --- THE FIX: Logout Handler ---
  const handleLogout = async () => {
    await logout(); // Call the async logout function from the context
    navigate('/login'); // Navigate to the login page after state is cleared
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        type="button" 
        onClick={openSidebar}
        class="lg:hidden fixed top-4 left-4 z-20 p-2 text-neutral-500 dark:text-neutral-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <span class="sr-only">Open sidebar</span>
        <AiOutlineMenu class="w-6 h-6" />
      </button>

      {/* Mobile Backdrop Overlay */}
      <div 
        class={`fixed inset-0 bg-black/50 z-30 transition-opacity lg:hidden ${
          isSidebarOpen() ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeSidebar}
      />

      {/* The Sidebar Panel */}
      <aside 
        class={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ease-in-out ${
          isSidebarOpen() ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div class="h-full px-4 py-6 flex flex-col overflow-y-auto 
                    bg-white dark:bg-neutral-900 
                    border-r border-neutral-200 dark:border-neutral-800"
        >
          {/* Header */}
          <div class="flex items-center justify-between mb-8 px-2">
            <A href="/dashboard" class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-500/20">
                <span class="font-bold text-xl text-indigo-600 dark:text-indigo-400">T</span>
              </div>
              <span class="text-xl font-bold text-neutral-800 dark:text-neutral-200">TikSmart</span>
            </A>
            <button onClick={closeSidebar} class="lg:hidden text-neutral-500 dark:text-neutral-400">
              <AiOutlineClose class="w-6 h-6" />
            </button>
          </div>

          {/* This flex container pushes the logout button to the bottom */}
          <div class="flex-grow flex flex-col justify-between">
            
            {/* Main Navigation */}
            <nav class="space-y-1">
              <For each={navigationItems}>
                {(item) => (
                  <A 
                    href={item.href} 
                    class="group flex items-center px-3 py-2 text-sm rounded-md transition-colors"
                    classList={{
                      'font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400': isActive(item.href),
                      'font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800': !isActive(item.href),
                    }}
                  >
                    <item.icon class={`mr-3 size-5 ${isActive(item.href) ? 'text-indigo-500 dark:text-indigo-400' : 'text-neutral-400 dark:text-neutral-500'}`} />
                    {item.label}
                  </A>
                )}
              </For>
            </nav>

            {/* --- Logout Button at the bottom --- */}
            <div class="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={handleLogout}
                class="group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <AiOutlineLogout class="mr-3 size-5 text-neutral-400 dark:text-neutral-500" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>
    </> 
  );
};

export default Sidebar;
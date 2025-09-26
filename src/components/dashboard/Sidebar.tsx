import { Component, For, Show, createEffect, createMemo } from "solid-js";
import { A, useLocation, useNavigate } from "@solidjs/router";
import { useUI } from "../../context/UIContext"; // Import our new context hook
import { getSidebarDataForRole, UserRole } from "../../config/sidebarConfig";
import { useAdmin } from "../../context/AdminContext";
import { useUser } from "../../context/UserContext";
import { AiOutlineLogout, AiOutlinePlusCircle } from "solid-icons/ai";



const DashboardSidebar: Component = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarOpen, closeSidebar } = useUI();
  
  // --- REAL CONTEXT INTEGRATION ---
  const userContext = useUser();
  const adminContext = useAdmin();

  // This memo is the single source of truth for the current user's role.
  // It prioritizes an admin session over a user session.
  const currentUserRole = createMemo<UserRole | null>(() => {
    if (adminContext.isAdminAuthenticated()) return 'admin';
    if (userContext.isAuthenticated()) return userContext.user()!.role;
    return null;
  });

  const visibleSidebarData = createMemo(() => getSidebarDataForRole(currentUserRole()));

  // Improved active check: highlights parent routes as well.
  const isActive = (href: string) => {
    // Special case for exact dashboard match
    if (href === '/dashboard' || href === '/organizer/dashboard' || href === '/admin/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  // Effect to close the sidebar on mobile when the route changes
  createEffect(() => {
    location.pathname;
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  });

  const handleLogout = async () => {
    if (currentUserRole() === 'admin') {
      await adminContext.logout();
      navigate('/admin/login');
    } else {
      await userContext.logout();
      navigate('/login');
    }
  };

  return (
    <>
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
          <div class="flex items-center mb-8 px-2">
            <A href="/dashboard" class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-500/20">
                <span class="font-bold text-xl text-indigo-600 dark:text-indigo-400">T</span>
              </div>
              <span class="text-xl font-bold text-neutral-800 dark:text-neutral-200">TikSmart</span>
            </A>
          </div>

          {/* Main Navigation Sections */}
          <div class="flex-grow">
            <For each={visibleSidebarData()}>
              {(section) => (
                <div class="mb-6">
                  <Show when={section.title}>
                    <span class="px-3 mb-2 block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      {section.title}
                    </span>
                  </Show>
                  <nav class="space-y-1">
                    <For each={section.items}>
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
                          {item.text}
                        </A>
                      )}
                    </For>
                  </nav>
                </div>
              )}
            </For>
          </div>
          
          {/* --- NEW: Logout Button at the bottom --- */}
          <div class="mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-800">
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleLogout(); }}
                         class="group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <AiOutlinePlusCircle /> Create Venue
                      </a>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
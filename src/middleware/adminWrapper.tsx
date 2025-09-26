import { Component, Show } from "solid-js";
import { Navigate } from "@solidjs/router";
import { useAdmin } from "../context/AdminContext"; // --- THE FIX: Use the AdminContext ---

const FullPageLoader: Component = () => (
  <div class="fixed inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
  </div>
);

/**
 * A Higher-Order Component (HOC) specifically for protecting Admin routes.
 */
export function withAdminAuth(PageComponent: Component): Component {
  return () => {
    const { isAdminAuthenticated, isLoading } = useAdmin();

    return (
      <Show when={!isLoading()} fallback={<FullPageLoader />}>
        <Show
          when={isAdminAuthenticated()}
          // If not an authenticated admin, redirect to the admin login page.
          fallback={<Navigate href="/admin/login" />}
        >
          <PageComponent />
        </Show>
      </Show>
    );
  };
}
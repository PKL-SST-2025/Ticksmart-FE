import { Component, createEffect, Show } from "solid-js";
import { Navigate, useLocation, useNavigate } from "@solidjs/router";
import { useUser } from "../context/UserContext";

const FullPageLoader: Component = () => (
  <div class="fixed inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
  </div>
);

type Role = 'user' | 'organizer' | 'admin';

interface AuthOptions {
  requires?: Role[];
}

/**
 * A Higher-Order Component (HOC) that protects a page component.
 * It now handles loading, authentication, banned status, and authorization.
 */
export function withAuth(PageComponent: Component, options: AuthOptions = {}): Component {
  // This is the new, protected component that will be rendered by the router.
  return () => {
    const { isAuthenticated, isLoading, isBanned, user, isBoarding } = useUser();
    const location = useLocation();
    const navigate = useNavigate();

        createEffect(() => {
        // If the user is logged in AND they are in the middle of onboarding,
        // force them to the onboarding page.
        if (isAuthenticated() && isBoarding()) {
          navigate('/organizer/onboarding', { replace: true });
        }
      });

    const hasRequiredRole = () => {
      const requiredRoles = options.requires;
      if (!requiredRoles) return true;
      if (!user()) return false;

      const userRole = user()!.role;
      if (userRole === 'organizer' && requiredRoles.includes('user')) return true;
      console.log(user())

      return requiredRoles.includes(userRole);

    };

    return (
      <Show when={!isLoading()} fallback={<FullPageLoader />}>
        <Show
          when={isAuthenticated()}
          fallback={<Navigate href="/login" />}
        >
          {/* --- THIS IS THE NEW LOGIC --- */}
          {/* If the user is authenticated, we then check if they are banned. */}
          <Show
            when={!isBanned()}
            // If they are banned, redirect them to the dedicated /banned page.
            // We prevent an infinite redirect loop by checking the current path.
            fallback={
              location.pathname === '/banned' ? <PageComponent /> : <Navigate href="/banned" />
            }
          >
            {/* If they are authenticated AND NOT banned, we check their role. */}
            <Show
              when={hasRequiredRole()}
              // If their role is insufficient, redirect them to a safe page (e.g., dashboard).
              fallback={<Navigate href="/dashboard" />}
            >
              {/* If all checks pass, render the actual page component. */}
              <PageComponent />
            </Show>
          </Show>
        </Show>
      </Show>
    );
  };
}
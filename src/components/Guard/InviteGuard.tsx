// src/components/guards/InviteGuard.tsx

import { Component, Show } from "solid-js";
import { Navigate, useParams, useLocation } from "@solidjs/router";
import { useAuth } from "../../context/AuthContext";
import { TbLoader } from "solid-icons/tb";

const InviteGuard: Component<{ children: any }> = (props) => {
    const auth = useAuth();
    const params = useParams(); // To get invite_code
    const location = useLocation(); // To get current path for redirect

    // The full path to redirect back to after login
    // This correctly extracts the path without the domain
    const redirectToPath = location.pathname; // This will be /invite/HEX_CODE

    return (
        <Show when={!auth.isAuthLoading()} fallback={
            <div class="fixed inset-0 flex items-center justify-center bg-gray-900 text-white">
                <TbLoader class="w-12 h-12 animate-spin" />
                <p class="ml-4">Checking session...</p>
            </div>
        }>
            <Show when={auth.isAuthenticated()} fallback={
                // If NOT authenticated, redirect to login page
                // and pass the original invite path as a `redirect` query parameter.
                <Navigate href={`/login?redirect=${encodeURIComponent(redirectToPath)}`} />
            }>
                {props.children}
            </Show>
        </Show>
    );
};

export default InviteGuard;
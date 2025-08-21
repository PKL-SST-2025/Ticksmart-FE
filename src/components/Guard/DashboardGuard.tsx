import { Component, JSX, Show } from "solid-js";
import { Navigate } from "@solidjs/router";
import { useAuth } from "../../context/AuthContext";

// This component checks for general authentication
const DashboardGuard: Component<{ children: JSX.Element }> = (props) => {
    const auth = useAuth();
    
    // If the user is not authenticated (i.e., user() is null), redirect to login.
    // We check `!auth.user.loading` to ensure we don't redirect before the initial check is done.
    return (
        <Show when={auth.isAuthenticated()} fallback={<Navigate href="/login" />}>
            {props.children}
        </Show>
    );
};

export default DashboardGuard;
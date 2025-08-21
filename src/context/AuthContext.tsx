// src/context/AuthContext.tsx

import { createContext, useContext, createSignal, createResource, Accessor, Show } from "solid-js";
import { sendRequest } from "../utils/SendRequest";
import { TbLoader } from "solid-icons/tb";

type User = {
    id: number;
    email: string;
    username?: string; // Add username if your User model has it
};

interface IAuthContext {
    user: Accessor<User | undefined | null>;
    isAuthenticated: Accessor<boolean>;
    isAuthLoading: Accessor<boolean>;
    refetchUser: () => void;
    logout: () => Promise<void>; // NEW: Add logout function
}

const AuthContext = createContext<IAuthContext>();

export function AuthProvider(props: { children: any }) {
    const [user, { refetch, mutate }] = createResource<User | null>(async () => { // Add `mutate` for direct updates
        try {
            return await sendRequest<User>('/auth/me');
        } catch (error) {
            console.log("Not authenticated, clearing user (error on /auth/me).");
            return null;
        }
    });

    const performLogout = async () => {
        try {
            // FIX: Explicitly cast to void or {} as T since we expect 204
            await sendRequest<void>('/auth/logout', { method: 'POST' }); 
            mutate(null); // Clear the user state in the context
            console.log("Logged out successfully.");
        } catch (error) {
            console.error("Logout failed:", error);
            alert("Logout failed. Please try again.");
        }
    };

    const store: IAuthContext = {
        user,
        isAuthenticated: () => !!user(),
        isAuthLoading: () => user.loading,
        refetchUser: refetch,
        logout: performLogout, // Expose the logout function
    };

    return (
        <AuthContext.Provider value={store}>
            <Show when={!user.loading} fallback={
                <div class="fixed inset-0 flex items-center justify-center bg-gray-900">
                    <TbLoader class="w-12 h-12 animate-spin text-blue-500" />
                </div>
            }>
                {props.children}
            </Show>
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext)!;
}
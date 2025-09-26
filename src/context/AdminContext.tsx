import { createContext, useContext, createSignal, onMount, Component, JSX } from "solid-js";
import { sendRequest } from "../utils/SendRequest";

// --- Type Definition for the Admin Profile ---
export type AdminProfile = {
  id: number;
  email: string;
  username: string;
  role: 'superadmin' | 'moderator';
};

interface AdminContextType {
  admin: () => AdminProfile | null;
  isAdminAuthenticated: () => boolean;
  isLoading: () => boolean;
  logout: () => Promise<void>;
  refetchAdmin: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType>();

export const AdminProvider: Component<{ children: JSX.Element }> = (props) => {
  const [admin, setAdmin] = createSignal<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);

  const isAdminAuthenticated = () => !!admin();

  const checkAdminAuthStatus = async () => {
    setIsLoading(true);


    try {
      // --- THE FIX (Part 1): Use the correct method (GET) for the /me endpoint ---
      // Your backend router for `/api/admin/me` should be a GET request.
      const profile = await sendRequest<AdminProfile>('/admin/auth/me', { method: 'GET' });


      setAdmin(profile);
    } catch (error) {
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  onMount(
    checkAdminAuthStatus
  );


  const logout = async () => {
    try {
      // Admins have their own logout to clear their specific cookie/session
      await sendRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Admin logout failed:", error);
    } finally {
      setAdmin(null);
    }
  };

  const store: AdminContextType = {
    admin,
    isAdminAuthenticated,
    isLoading,
    logout,
    refetchAdmin: checkAdminAuthStatus,
  };


  return (
    <AdminContext.Provider value={store}>
      {props.children}
    </AdminContext.Provider>
  );
};

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within an AdminProvider");
  return context;
}
import { createContext, useContext, createSignal, onMount, Component, JSX } from "solid-js";
import { sendRequest } from "../utils/SendRequest";

// --- Type Definitions (Unchanged) ---
interface OrganizerProfile {
  company_name: string | null;
}
interface UserMeResponse {
  id: number;
  email: string;
  username: string;
  is_banned: boolean;
  role: 'organizer' | 'attendee';
  currently_boarding: boolean;
  organizer_profile?: OrganizerProfile | null; 
}
export type UserProfile = {
  id: number;
  email: string;
  username: string;
  is_banned: boolean;
  currently_boarding: boolean;
  role: 'organizer' | 'user';
  organizer_profile?: OrganizerProfile | null;
};
interface UserContextType {
  user: () => UserProfile | null;
  isAuthenticated: () => boolean;
  isLoading: () => boolean;
  isBanned: () => boolean;
  isBoarding: () => boolean;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>();

export const UserProvider: Component<{ children: JSX.Element }> = (props) => {
  const [user, setUser] = createSignal<UserProfile | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);

  const isAuthenticated = () => !!user();
  const isBanned = () => user()?.is_banned ?? false;
  const isBoarding = () => user()?.currently_boarding ?? false;

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      // --- THIS IS THE DEFINITIVE FIX ---
      // The `/auth/me` endpoint is a GET request. By removing the `method` option,
      // `sendRequest` will correctly default to GET. This will bypass the CSRF guard.
      const response = await sendRequest<UserMeResponse>('/auth/me');

      const profile: UserProfile = {
        id: response.id,
        email: response.email,
        username: response.username,
        is_banned: response.is_banned,
        organizer_profile: response.organizer_profile,
        role: response.role === 'attendee' ? 'user' : response.role,
        currently_boarding: response.currently_boarding
      };
      
      setUser(profile);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  onMount(checkAuthStatus);

  const logout = async () => {
    try {
      // Logout is a state-changing action, so it correctly remains a POST
      await sendRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  const store: UserContextType = {
    user,
    isAuthenticated,
    isLoading,
    isBanned,
    isBoarding,
    logout,
    refetchUser: checkAuthStatus,
  };

  return (
    <UserContext.Provider value={store}>
      {props.children}
    </UserContext.Provider>
  );
};

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}
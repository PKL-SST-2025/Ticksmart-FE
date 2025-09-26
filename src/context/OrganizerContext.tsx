import { createContext, useContext, createSignal, Component, JSX, createEffect } from "solid-js";
import { useUser } from "./UserContext";

// --- Type Definitions (from your 'organizer_profiles' schema) ---
interface OrganizerProfile {
  user_id: number; // Corresponds to the ID in the users table
  company_name: string | null;
  contact_phone: string | null;
  website_url: string | null;
  // You might also join the stripe_account_id here
  stripe_account_id?: string | null;
}

interface OrganizerContextType {
  profile: () => OrganizerProfile | null;
  isOrganizer: () => boolean;
  isLoading: () => boolean;
}

// --- Context Creation ---
const OrganizerContext = createContext<OrganizerContextType>();

export const OrganizerProvider: Component<{ children: JSX.Element }> = (props) => {
  const { user } = useUser();
  const [profile, setProfile] = createSignal<OrganizerProfile | null>(null);
  const [isLoading, setIsLoading] = createSignal(true);

  const isOrganizer = () => user()?.role === 'organizer' && !!profile();

  createEffect(async () => {
    const currentUser = user();
    if (currentUser && currentUser.role === 'organizer') {
      setIsLoading(true);
      try {
        // --- API CALL SIMULATION ---
        // In a real app: const data = await fetchOrganizerProfile(currentUser.id);
        console.log("Fetching organizer profile...");
        const mockOrganizerProfile: OrganizerProfile = {
          user_id: currentUser.id,
          company_name: "EventCorp Inc.",
          contact_phone: "+1 (555) 123-4567",
          website_url: "https://www.eventcorp.com",
          stripe_account_id: "acct_123456789"
        };
        setProfile(mockOrganizerProfile);
        // --- END SIMULATION ---
      } catch (error) {
        console.error("Failed to fetch organizer profile:", error);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setProfile(null);
      setIsLoading(false);
    }
  });

  const store: OrganizerContextType = {
    profile,
    isOrganizer,
    isLoading,
  };

  return (
    <OrganizerContext.Provider value={store}>
      {props.children}
    </OrganizerContext.Provider>
  );
};

// --- Custom Hook ---
export function useOrganizer() {
  const context = useContext(OrganizerContext);
  if (!context) {
    throw new Error("useOrganizer must be used within an OrganizerProvider");
  }
  return context;
}
import { createContext, useContext, onMount, ParentComponent, createResource, createSignal } from "solid-js";
import {  loadConnectAndInitialize, StripeConnectInstance } from '@stripe/connect-js';
import { sendRequest } from "../utils/SendRequest";

interface StripeConnectContextType {
  connectInstance: () => StripeConnectInstance | undefined;
  isLoading: () => boolean;
  error: () => any;
}

// The appearance variables used in dark mode
const darkModeAppearanceVariables = {
  // Note: These properties will depend on how your application looks!
  colorPrimary: "#0085FF",
  colorText: "#C9CED8",
  colorBackground: "#14171D",
  buttonSecondaryColorBackground: "#2B3039",
  buttonSecondaryColorText: "#C9CED8",
  colorSecondaryText: "#8C99AD",
  actionSecondaryColorText: "#C9CED8",
  actionSecondaryTextDecorationColor: "#C9CED8",
  colorBorder: "#2B3039",
  colorDanger: "#F23154",
  badgeNeutralColorBackground: "#1B1E25",
  badgeNeutralColorBorder: "#2B3039",
  badgeNeutralColorText: "#8C99AD",
  badgeSuccessColorBackground: "#152207",
  badgeSuccessColorBorder: "#20360C",
  badgeSuccessColorText: "#3EAE20",
  badgeWarningColorBackground: "#400A00",
  badgeWarningColorBorder: "#5F1400",
  badgeWarningColorText: "#F27400",
  badgeDangerColorBackground: "#420320",
  badgeDangerColorBorder: "#61092D",
  badgeDangerColorText: "#F46B7D",
  offsetBackgroundColor: "#1B1E25",
  formBackgroundColor: "#14171D",
  overlayBackdropColor: "rgba(0,0,0,0.5)",
};

const lightModeAppearanceVariables = {
    // These properties will depend on how your application looks!
    colorPrimary: "#0085FF",
}

const StripeConnectContext = createContext<StripeConnectContextType>();

export const StripeConnectProvider: ParentComponent = (props) => {


      const [isDarkMode, setIsDarkMode] = createSignal(false);

      onMount(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(mediaQuery.matches); // Initial check

        // Listen for changes in OS preference
        mediaQuery.addEventListener('change', (e) => {
          setIsDarkMode(e.matches);
        });
      });


  // Use createResource to handle the async loading of the client secret and instance
  const [connectInstanceResource] = createResource(async () => {
    try {
      // 1. Fetch the client secret from the backend. This happens only once.
      const response = await sendRequest<{ client_secret: string }>('/organizer/stripe/account-session', { method: 'POST' });
      const secret = response.client_secret;

      // 2. Load the Stripe Connect JS instance with the secret.
      const instance = loadConnectAndInitialize({
      publishableKey: "pk_test_51SAhjrJKgrSacDQdjbvDke4O6BpJaDNb7jYZ46j2Wbh4ZGDgxTrDHvV9Exfe8v6t8Nvul4CnHMt6HLW1iUMp2SOz00CkJ04LAO",
        fetchClientSecret: async () => secret,
          appearance: {
    variables: isDarkMode() ? darkModeAppearanceVariables : lightModeAppearanceVariables, // You should initialize depending on your website's current UI state
  },
      }
    );
      
      return instance;
    } catch (err) {
      console.error("Failed to initialize Stripe Connect:", err);
      throw err; // Propagate the error to the resource
    }
  });

  const store: StripeConnectContextType = {
    connectInstance: () => connectInstanceResource(),
    isLoading: () => connectInstanceResource.loading,
    error: () => connectInstanceResource.error,
  };

  return (
    <StripeConnectContext.Provider value={store}>
      {props.children}
    </StripeConnectContext.Provider>
  );
};

export function useStripeConnect() {
  const context = useContext(StripeConnectContext);
  if (!context) throw new Error("useStripeConnect must be used within a StripeConnectProvider");
  return context;
}
import { createContext, useContext, createSignal, onMount, onCleanup, ParentComponent } from 'solid-js';

interface UIContextType {
  isSidebarOpen: () => boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const UIContext = createContext<UIContextType>();

export const UIProvider: ParentComponent = (props) => {
  const [isSidebarOpen, setIsSidebarOpen] = createSignal(false);

  // This reactive logic is now safely inside a component that will be
  // managed by a root. When DashboardLayout is unmounted, this logic will be disposed.
  onMount(() => {
    const checkScreenSize = () => setIsSidebarOpen(window.innerWidth >= 1024);
    window.addEventListener('resize', checkScreenSize);
    checkScreenSize();
    onCleanup(() => window.removeEventListener('resize', checkScreenSize));
  });

  const store: UIContextType = {
    isSidebarOpen,
    openSidebar: () => setIsSidebarOpen(true),
    closeSidebar: () => setIsSidebarOpen(false),
    toggleSidebar: () => setIsSidebarOpen(prev => !prev),
  };

  return (
    <UIContext.Provider value={store}>
      {props.children}
    </UIContext.Provider>
  );
};

// This custom hook stays the same, for use in Header and Sidebar
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within a UIProvider");
  return context;
};

import { Component, JSXElement, Show, type ParentComponent } from 'solid-js';
import { Navbar } from '../components/Dashboard/Navbar';
import { InboxSidebar } from '../components/Dashboard/InboxSidebar';
import { isInboxOpen, toggleInbox } from '../stores/dashboardStore';
import { JSX } from 'solid-js/h/jsx-runtime';
import DashboardGrid from '../components/Dashboard/GridBackground';

// Define the props interface for DashboardLayout
interface DashboardLayoutProps {
  children?: JSXElement; // ParentComponent sets children as optional JSXElement
  username: string; // Add the username prop
}

// Change from ParentComponent to Component<DashboardLayoutProps>
export const DashboardLayout: Component<DashboardLayoutProps> = (props) => {
  return (
    <div class="flex overflow-hidden w-[100vw] h-[100vh]  dark:bg-gray-2">
      <Navbar onInboxToggle={toggleInbox} />
      <main class="w-full h-[100vh] bg-gray-950 relative flex flex-col items-center pointer-events-auto   justify-center flex-1 overflow-hidden">
        {/* Main application content goes here */}
        <DashboardGrid />

        {props.children}
      </main>

      {/* Conditionally render the Inbox sidebar */}
      <div class='absolute overflow-hidden  w-[100vw] h-[100vh] '>
      <Show when={isInboxOpen()}>
        <InboxSidebar onClose={toggleInbox} />
      </Show>
      </div>

    </div>
  );
};
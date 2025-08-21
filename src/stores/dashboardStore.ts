import { createSignal } from 'solid-js';

// Create a global, reactive signal for the inbox's visibility state.
const [isInboxOpen, setIsInboxOpen] = createSignal(false);

// Create a global function to toggle the state.
const toggleInbox = () => {
  setIsInboxOpen(!isInboxOpen());
};

// Export the reactive state and the function to modify it.
export { isInboxOpen, toggleInbox };
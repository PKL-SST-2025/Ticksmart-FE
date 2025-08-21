import type { Component } from 'solid-js';
import { IoArchiveOutline, IoFilter, IoClose } from 'solid-icons/io';
import { gsap } from 'gsap';
import { onMount } from 'solid-js';

interface InboxSidebarProps {
  onClose: () => void;
}

export const InboxSidebar: Component<InboxSidebarProps> = (props) => {
  let sidebarRef: HTMLElement | undefined;

  // --- Animation on Mount ---
  onMount(() => {
    if (!sidebarRef) return;
    // Animate the sidebar into view from the right
    gsap.to(sidebarRef, {
      x: '0%',
      duration: 0.5,
      ease: 'power3.out',
    });
  });

  // --- Close Handler with Exit Animation ---
  const handleClose = () => {
    if (!sidebarRef) return;
    
    // Animate the sidebar out of view to the right
    gsap.to(sidebarRef, {
      x: '100%',
      duration: 0.4,
      ease: 'power3.in',
      // CRUCIAL: Call the parent's onClose function only after the animation is complete
      onComplete: props.onClose,
    });
  };

  return (
    <>
      {/* Backdrop: Covers the screen behind the sidebar. Clicking it triggers the close animation. */}
      <div 
        onClick={handleClose} 
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        aria-hidden="true"
      />

      {/* 
        The sidebar itself. It's full-screen by default (mobile-first).
        On large screens (lg:), it becomes a 96-unit wide sidebar on the right.
      */}
      <aside
        ref={sidebarRef}
        class="fixed inset-0   lg:inset-auto lg:top-0 lg:right-0 lg:h-screen lg:w-96 z-[300] flex flex-col bg-gray-900 border-l border-gray-800 transform translate-x-full"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inbox-title"
      >
        {/* Header */}
        <div class="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
          <h2 id="inbox-title" class="font-semibold text-lg text-slate-200">Inbox</h2>
          <div class="flex items-center space-x-2">
            <button class="p-1 cursor-pointer text-slate-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors" aria-label="Filter inbox">
              <IoFilter class="w-5 h-5" />
            </button>
            {/* The new Close (X) button */}
            <button
              onClick={handleClose}
              class="p-1 cursor-pointer text-slate-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              aria-label="Close inbox"
            >
              <IoClose class="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div class="flex-grow flex items-center justify-center h-full p-4">
          <div class="rounded-lg text-center">
            <IoArchiveOutline class="w-12 h-12 mx-auto text-gray-500 mb-4" />
            <h3 class="text-xl font-bold text-slate-200">Inbox is Empty</h3>
            <p class="mt-2 text-sm text-slate-400 max-w-xs">
              Welcome to your Inbox. You will be alerted in this space about key activities, including direct mentions, updates on your pages, and new invitations to collaborate.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
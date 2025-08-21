 // src/components/MobileSidebar.tsx

import { Component, createSignal, createEffect, onMount, For, Accessor } from 'solid-js';
import { A } from '@solidjs/router';
import { IoClose, IoChevronDown } from 'solid-icons/io';
import gsap from 'gsap';
import Logo from './Logo';


// --- Reusable Menu Item Components for Mobile ---
const MobileLink: Component<{ href: string; children: any; new?: boolean; onClick: () => void; }> = (props) => (
  <li class="mobile-menu-item">
    <A
      href={props.href}
      onClick={props.onClick}
      class="flex w-full items-center p-3 text-lg text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      <span class="flex-1">{props.children}</span>
      {props.new && <span class="ml-2 text-xs font-semibold text-blue-800 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-md">New</span>}
    </A>
  </li>
);

const AccordionItem: Component<{ title: string; children: any }> = (props) => {
  const [isOpen, setIsOpen] = createSignal(true); // Default to open like the image
  let contentRef: HTMLUListElement | undefined;

  createEffect(() => {
    if (!contentRef) return;
    gsap.to(contentRef, {
      height: isOpen() ? 'auto' : 0,
      duration: 0.3,
      ease: 'power2.inOut',
    });
  });

  return (
    <div class="mobile-menu-item">
      <button
        onClick={() => setIsOpen(!isOpen())}
        class="flex w-full items-center p-3 text-xl font-semibold text-gray-800 dark:text-white"
      >
        <span class="flex-1 text-left">{props.title}</span>
        <IoChevronDown class="w-5 h-5 transition-transform duration-300" classList={{ 'rotate-180': isOpen() }} />
      </button>
      <ul ref={contentRef} class="overflow-hidden pl-4">
        {props.children}
      </ul>
    </div>
  );
};

// --- The Main Mobile Sidebar Component ---
interface MobileSidebarProps {
  isOpen: Accessor<boolean>;
  onClose: () => void;
}

const MobileSidebar: Component<MobileSidebarProps> = (props) => {
  let sidebarRef: HTMLElement | undefined;
  let overlayRef: HTMLDivElement | undefined;

  const handleClose = () => {
    if (!sidebarRef || !overlayRef) return;

    // Animate out, then call the parent's onClose function
    const tl = gsap.timeline({ onComplete: props.onClose });
    tl.to(overlayRef, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' });
    tl.to(sidebarRef, { x: '-100%', duration: 0.4, ease: 'power2.in' }, '<'); // '<' starts at the same time
  };

  createEffect(() => {
    if (!sidebarRef || !overlayRef) return;

    if (props.isOpen()) {
      // Animate in
      const tl = gsap.timeline();
      const items = sidebarRef?.querySelectorAll('.mobile-menu-item');
      
      tl.to(overlayRef, { autoAlpha: 1, duration: 0.3 });
      tl.to(sidebarRef, { x: '0%', autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, '<');
      
      if (items) {
        tl.fromTo(items,
          { autoAlpha: 0, x: -20 },
          { autoAlpha: 1, x: 0, stagger: 0.05, duration: 0.3, ease: 'power2.out' },
          '-=0.2' // Starts 0.2s before the previous animation ends
        );
      }
    }
  });

  onMount(() => {
    if (!sidebarRef || !overlayRef) return;

    // Set initial hidden state
    gsap.set([sidebarRef, overlayRef], { autoAlpha: 0 });
    gsap.set(sidebarRef, { x: '-100%' });
  });

  return (
    // We only render the elements if isOpen is true to avoid interfering with the DOM when hidden
    <div classList={{ 'hidden': !props.isOpen() }}>
      {/* Overlay */}
      <div
        ref={overlayRef}
        class="fixed inset-0 z-[995] bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Sidebar Panel */}
      <aside
        ref={sidebarRef}
        class="fixed top-0 left-0 z-[996] w-full md:w-sm  h-screen bg-white dark:bg-gray-800 shadow-2xl"
        tabindex="-1"
      >
        <div class="flex flex-col h-full">
          {/* Top Bar */}
          <div class="flex items-center justify-between p-4 border-b dark:border-white/10">
            <A href="/" aria-label="Homepage" onClick={handleClose}>
              <Logo />
            </A>
            <button onClick={handleClose} class="p-2 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <IoClose size={24} />
            </button>
          </div>

          {/* Scrollable Menu Content */}
          <div class="flex-1 p-4 overflow-y-auto">
            <ul class="flex flex-col">
            <AccordionItem title="CollabSpark">
                <MobileLink href="/dashboard" onClick={handleClose}>Dashboard</MobileLink>
                <MobileLink href="/dashboard" onClick={handleClose}>Projects</MobileLink>
                {/* These might be sections of Dashboard or sub-features */}
                <MobileLink href="/dashboard" onClick={handleClose}>Global Search</MobileLink> 
                <MobileLink href="/dashboard" onClick={handleClose}>Inbox</MobileLink>
              </AccordionItem>
              
              <hr class="my-4 border-gray-200 dark:border-gray-700" />

              <AccordionItem title="Company">
                <MobileLink href="/about" onClick={handleClose}>About Us</MobileLink>
                <MobileLink href="/terms-privacy" onClick={handleClose}>Terms & Privacy</MobileLink>
                <MobileLink href="/contact" onClick={handleClose}>Contact Us</MobileLink>
                <MobileLink href="/faq" onClick={handleClose}>FAQ</MobileLink>
                <MobileLink href="/pricing" onClick={handleClose}>Pricing</MobileLink>
              </AccordionItem>
            </ul>
          </div>

          {/* Footer - Login/Register/Start Collaborating */}
          <div class="p-4 border-t dark:border-white/10 mt-auto">
            <div class="flex flex-col space-y-3">
              <A 
                href="/dashboard" 
                onClick={handleClose} 
                class="inline-flex w-full justify-center items-center px-5 py-3 text-base font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-colors"
              >
                Start Collaborating
              </A>
              <A 
                href="/login" 
                onClick={handleClose} 
                class="inline-flex w-full justify-center items-center px-5 py-3 text-base font-medium text-center text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 transition-colors"
              >
                Login
              </A>
              <A 
                href="/register" 
                onClick={handleClose} 
                class="inline-flex w-full justify-center items-center px-5 py-3 text-base font-medium text-center text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:bg-gray-500 dark:hover:bg-gray-600 dark:focus:ring-gray-500 transition-colors"
              >
                Register
              </A>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default MobileSidebar;
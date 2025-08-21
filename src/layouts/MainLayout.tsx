import { createSignal, onMount, onCleanup, createEffect, type ParentComponent, Component } from 'solid-js';
import { A } from '@solidjs/router';
import { IoChevronDown } from 'solid-icons/io';
import gsap from 'gsap';
import Logo from '../components/Logo';
import { initFlowbite } from 'flowbite';
import MobileSidebar from '../components/MobileSidebar'; 
import MainFooter from '../components/MainFooter';

// A reusable component for the items in the mega menu
const MenuItem: Component<{ href: string; title: string; subtitle: string; new?: boolean }> = (props) => (
  <A href={props.href} class="dropdown-item group block p-3  rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
    <div class="flex items-center gap-3">
      <p class="font-semibold text-gray-900 dark:text-white">{props.title}</p>
      {props.new && <span class="text-xs font-semibold text-blue-800 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-md">New</span>}
    </div>
    <p class="text-sm text-gray-500 dark:text-gray-400">{props.subtitle}</p>
  </A>
);

const MainLayout: ParentComponent = (props) => {
  // Refs for DOM elements we need to animate or track
  let dropdownContainerRef: HTMLDivElement | undefined;

  // --- State Management ---
  // Signal to control the open/closed state of the mega menu
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  // Signal to control the open/closed state of the mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);

  // A variable to hold the timeout ID for closing the menu on mouse leave
  let closeMenuTimeoutId: number | undefined;

  // --- Animation with GSAP ---
  // This effect runs whenever the isDropdownOpen signal changes
  createEffect(() => {
    if (!dropdownContainerRef) return;

    // Get all the individual items to stagger their animation
    const items = dropdownContainerRef.querySelectorAll('.dropdown-item');

    if (isDropdownOpen()) {
      // --- OPEN ANIMATION ---
      gsap.to(dropdownContainerRef, { 
        autoAlpha: 1, // Fades in and sets display: block
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
      // Stagger the items in
      gsap.fromTo(items, 
        { autoAlpha: 0, y: -10 }, 
        { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.04, ease: 'power2.out', delay: 0.1 },
      );
    } else {
      // --- CLOSE ANIMATION ---
      gsap.to(dropdownContainerRef, {
        autoAlpha: 0, // Fades out and sets display: none
        y: -10,
        duration: 0.2,
        ease: 'power2.in'
      });
    }
  });

  // --- Event Handlers for Hover ---
  const handleMouseEnter = () => {
    // If there's a timeout scheduled to close the menu, cancel it.
    // This prevents the menu from closing if the user quickly moves from the button to the menu.
    if (closeMenuTimeoutId) {
      clearTimeout(closeMenuTimeoutId);
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    // Schedule the menu to close after a short delay.
    // This gives the user time to move their cursor from the button to the dropdown content.
    closeMenuTimeoutId = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };
  const handleMouseDown = () => {
    if (isDropdownOpen()) {
        setIsDropdownOpen(false);
        return;
    }

    setIsDropdownOpen(true);
  }

  onMount(() => {
    initFlowbite();
    // Set initial state for GSAP (hidden)
    if (dropdownContainerRef) {
      gsap.set(dropdownContainerRef, { autoAlpha: 0, y: -10 });
    }

    // Cleanup the timeout when the component is unmounted to prevent memory leaks
    onCleanup(() => {
      if (closeMenuTimeoutId) clearTimeout(closeMenuTimeoutId);
    });
  });

  return (

    <div class="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
        {/*Custom Cursor */}

        {/* We pass the state and the closer function to the mobile sidebar */}
      <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <div class="h-1 bg-gray-900 dark:bg-gray-700"></div>

      <nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 relative z-30">
        <div class="container mx-auto px-6 py-3 flex justify-between items-center text-gray-800 dark:text-gray-300">
          <div class="flex items-center space-x-8">
            <A href="/" aria-label="Homepage">
              <Logo />
            </A>
            <ul class="hidden lg:flex items-center space-x-6 text-sm font-medium">
              {/* The list item now handles the hover events for both the button and the dropdown */}
              <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onMouseDown={handleMouseDown}>
                {/* This button is now a visual trigger, not a click target for the menu */}
                <button
                  class="flex items-center hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors p-2 rounded-lg hover:text-blue-500 dark:hover:text-blue-400 h-full cursor-pointer"
                  classList={{ 'text-blue-600 dark:text-blue-400': isDropdownOpen() }}
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen()}
                  // The onClick is removed to favor the hover interaction
                >
                  CollabSpark
                  <IoChevronDown 
                    class="w-4 h-4 ml-1 transition-transform duration-200"
                    classList={{ 'transform rotate-180': isDropdownOpen() }}
                  />
                </button>
              </li>
              {/* Other nav items remain the same */}
              <li>
                <A 
                  href="/" 
                  class="transition-colors p-2 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-800 hover:text-blue-500 dark:hover:text-blue-400"
                  activeClass="bg-blue-600 text-white"
                  end={true} // 'end' prop ensures it only matches the exact "/" path
                >
                  Home
                </A>
              </li>
              <li>
                <A 
                  href="/pricing" 
                  class="transition-colors p-2 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-800 hover:text-blue-500 dark:hover:text-blue-400"
                  activeClass="bg-blue-600 text-white"
                >
                  Pricing
                </A>
              </li>
              <li>
                <A 
                  href="/contact" 
                  class="transition-colors p-2 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-800 hover:text-blue-500 dark:hover:text-blue-400"
                  activeClass="bg-blue-600 text-white"
                >
                  Contact
                </A>
              </li>
              <li>
                <A 
                  href="/faq" 
                  class="transition-colors p-2 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-800 hover:text-blue-500 dark:hover:text-blue-400"
                  activeClass="bg-blue-600 text-white"
                >
                  FAQ
                </A>
              </li>
            </ul>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="hidden lg:flex items-center space-x-4 text-sm font-medium">
              <A href="/login" class="hover:text-blue-500 dark:hover:text-blue-400">Log in</A>
              <A href="/register" class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-colors">
                Register
              </A>
            </div>
            {/* Mobile menu button */}
            <div class="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                type="button"
                class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              >
                <span class="sr-only">Open main menu</span>
                <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- The Mega Menu Dropdown --- */}
      <div
        ref={dropdownContainerRef}
        class="absolute w-full left-0 -mt-1 bg-white dark:bg-gray-800 shadow-xl rounded-b-lg border-t border-gray-200 dark:border-gray-700 z-20"
        style="display: visible; opacity: 0;" // Initial state for GSAP
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div class="container mx-auto grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-10 p-8">
          {/* Column 1 */}
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Features</h3>
            <div class="space-y-1">
              <MenuItem href="/dashboard" title="Dashboard" subtitle="Your central command center" />
              <MenuItem href="/dashboard" title="Projects" subtitle="Manage any project" />
            </div>
          </div>
          
          {/* Column 3 */}
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Get Started</h3>
            <div class="space-y-1">
              <MenuItem href="/about" title="About Us" subtitle="Learn about our mission" />
              <MenuItem href="/terms-privacy" title="Terms & Privacy" subtitle="Read our policies" />
            </div>
          </div>
          
          {/* Column 4 - Promo Card */}
          <div class="bg-gray-100 dark:bg-gray-700/50 p-6 h-fit rounded-lg flex flex-col justify-between">
            <div>                             
              <p class="font-semibold text-gray-800 dark:text-gray-200">Ready to bring your ideas to life? Start your first project in less than a minute.</p>
              <A href="/dashboard" class="mt-4 inline-block text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 text-center">
                Start Collaborating
              </A>                                                                                                                                                                        
            </div>
          </div>                                        
        </div>
      </div>

      <main class="relative z-10 lg:pl-0">
        {props.children}
      </main>
    <MainFooter />

    </div>

  );
};

export default MainLayout;
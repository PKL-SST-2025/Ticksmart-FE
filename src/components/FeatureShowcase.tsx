import { Component, onMount } from "solid-js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register the GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * FeatureShowcase Component: Displays three distinct panels with a sticky,
 * progressive reveal animation using GSAP and ScrollTrigger.
 * The first panel stays pinned while the second and third panels fade in/out
 * to replace its content as the user scrolls.
 */
const FeatureShowcase: Component = () => {
  let mainContainerRef: HTMLDivElement | undefined; // The full scrollable container
  let stickyWrapperRef: HTMLDivElement | undefined; // The element that gets pinned (holds the panels)
  let panel1Ref: HTMLDivElement | undefined;
  let panel2Ref: HTMLDivElement | undefined;
  let panel3Ref: HTMLDivElement | undefined;
  let sectionTitleRef: HTMLHeadingElement | undefined; // Ref for the new section title

  onMount(() => {
    // Ensure all necessary refs are available before animating
    if (!mainContainerRef || !stickyWrapperRef || !panel1Ref || !panel2Ref || !panel3Ref || !sectionTitleRef) {
      console.warn("GSAP FeatureShowcase: Missing one or more refs for animation.");
      return;
    }

    // Set initial states for elements
    gsap.set(panel1Ref, { autoAlpha: 1, y: 0 });
    gsap.set([panel2Ref, panel3Ref], { autoAlpha: 0, y: 50 });
    gsap.set(sectionTitleRef, { opacity: 0, y: -20 }); // Initial state for the new title

    // Create a master timeline for the entire panel sequence
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: mainContainerRef, // The entire scrollable section
        pin: stickyWrapperRef,     // Pin the wrapper div that contains the panels
        start: "top top",          // Start pinning when the top of the trigger hits the top of the viewport
        end: "bottom top",         // Pin until the bottom of the trigger hits the top of the viewport
        scrub: 1,                  // Smoothly scrub the timeline based on scroll position
        // markers: true,           // Uncomment for visual debugging of ScrollTrigger
      },
      defaults: {
        duration: 0.5,             // Default duration for each fade/slide transition
        ease: "power2.out",        // Easing for smooth animations
      },
    });

    // Define the sequence of panel reveals within the master timeline:

    // Animate in the section title early on
    masterTl.to(sectionTitleRef, { opacity: 1, y: 0, duration: 0.8 }, 0); // Animate title in at the very start

    // 1. Initially, panel1Ref is visible (already set with gsap.set)
    masterTl.to(panel1Ref, { autoAlpha: 1 }, 0.2); // Start timeline at 0.2, ensure P1 is active

    // 2. Transition from Panel 1 to Panel 2 (Content Left, Text Right)
    masterTl
      .to(panel1Ref, { autoAlpha: 0, y: -50 }, "<+0.5")
      .to(panel2Ref, { autoAlpha: 1, y: 0 }, "<");

    // 3. Transition from Panel 2 to Panel 3 (Text Left, Content Right)
    masterTl
      .to(panel2Ref, { autoAlpha: 0, y: -50 }, "<+0.5")
      .to(panel3Ref, { autoAlpha: 1, y: 0 }, "<");
  });

  return (
    // The main container for the entire section. Its `min-h` creates the necessary scroll space.
    // `relative` is needed for `sticky` to work correctly within it.
    <div ref={mainContainerRef} class="relative w-full overflow-hidden bg-slate-950 text-white min-h-[300vh] py-16">

      {/* The sticky wrapper. This div will be pinned to the top of the viewport.
          Its `h-screen` ensures it fills the viewport height when pinned.
          `flex flex-col items-center justify-center` centers its content (heading + panels) vertically. */}
      <div ref={stickyWrapperRef} class="sticky top-0 h-screen flex flex-col items-center justify-center px-4">

        {/* The new H2 heading */}
        <h2 ref={sectionTitleRef} class="text-center text-4xl md:text-5xl font-black mb-8 text-slate-50">
          From Plan to Progress
        </h2>

        {/* Inner container for panels. `relative` for `absolute` children.
            `max-w-screen-xl mx-auto` centers the panels horizontally and limits their width. */}
        <div class="relative w-full max-w-screen-xl mx-auto h-[420px] md:h-[500px]"> {/* Set a fixed height for panel container */}

          {/* Panel 1: "Keep every plan on track" - Text Left, Content Right */}
          <div
            ref={panel1Ref}
            class="absolute inset-0 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between"
          >
            {/* Left Side Content - Text */}
            <div class="w-full md:w-1/2 flex flex-col justify-between items-start text-left">
              <div>
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  </div>
                </div>
                <h2 class="text-4xl md:text-5xl font-bold tracking-tight text-slate-50">
                  Keep every plan on track.
                </h2>
              </div>
              <button class="hidden md:flex items-center justify-center w-12 h-12 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full transition-all duration-300 mt-8">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>

            {/* Right Side Content - Cards (Responsive Adaptation) */}
            <div class="w-full md:w-1/2 relative h-full flex flex-col items-center justify-center md:block p-4 md:p-0"> {/* Added padding for mobile spacing */}
              {/* Card 1: Checklist */}
              <div class="w-full max-zlg:hidden max-w-xs mx-auto z-10 bg-white/10 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-xl shadow-black/20
                          mb-6 md:mb-0 md:absolute md:top-8 md:left-0 md:w-[300px] md:max-w-none"> {/* Added max-w-xs and mx-auto for mobile capping/centering, increased mb */}
                <h3 class="font-bold text-xl  text-slate-100 mb-4">Key Milestones</h3>
                <div class="flex items-center gap-2 text-slate-300 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg>
                  <span class="font-medium">Pre-launch</span>
                </div>
                <ul class="space-y-3 text-slate-300">
                  <li class="flex items-center gap-3">
                    <div class="w-5 h-5 flex-shrink-0 bg-blue-500 border border-blue-400 rounded-md flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                    <span>Test backup systems</span>
                  </li>
                  <li class="flex items-center gap-3">
                    <div class="w-5 h-5 flex-shrink-0 bg-blue-500 border border-blue-400 rounded-md flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                    <span>Run final system diagnostics</span>
                  </li>
                  <li class="flex items-center gap-3">
                    <div class="w-5 h-5 flex-shrink-0 bg-slate-700 border border-slate-600 rounded-md"></div>
                    <span>Confirm launch module</span>
                  </li>
                </ul>
              </div>

              {/* Card 2: Timeline */}
              <div class="w-full max-w-md mx-auto bg-white/10 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-xl shadow-black/20
                          md:absolute md:top-1/2 md:-translate-y-1/2 md:right-0 md:w-[450px] md:max-w-none"> {/* Added max-w-md and mx-auto for mobile capping/centering */}
                <div class="flex justify-between items-center mb-4">
                  <h3 class="font-bold text-xl text-slate-100">Timeline View</h3>
                </div>
                <div class="flex items-center gap-2 border-b border-slate-700 pb-3 mb-3">
                  <button class="px-3 py-1 bg-slate-700 rounded-full text-sm font-medium flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 text-yellow-400"><path fill-rule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.394 3.654.293a.75.75 0 0 1 .428 1.317l-2.79 2.427 1.023 3.69a.75.75 0 0 1-1.12.81L8 11.973l-3.1 1.834a.75.75 0 0 1-1.12-.81l1.023-3.69-2.79-2.427a.75.75 0 0 1 .428-1.317l3.654-.293 1.41-3.394A.75.75 0 0 1 8 1.75Z" clip-rule="evenodd" /></svg>
                    Timeline
                  </button>
                  <button class="px-3 py-1 hover:bg-slate-700 rounded-full text-sm font-medium flex items-center gap-1.5 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M7 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM7.5 1.5a4.5 4.5 0 1 0 3.364 7.643 6.002 6.002 0 0 1-1.12 1.086C8.89 10.79 8 11.5 8 12.5a.5.5 0 01-1 0c0-1.5 1.5-2.5 2.1-3.09.28-.28.529-.592.744-.933A4.5 4.5 0 007.5 1.5Zm8.5 6a3 3 0 1 1-6 0 3 3 0 016 0Zm.5 4.5a4.5 4.5 0 10-8.035-2.865 6.002 6.002 0 001.12 1.086C9.11 10.79 10 11.5 10 12.5a.5.5 0 001 0c0-1.5-1.5-2.5-2.1-3.09a4.504 4.504 0 00-1.63-1.055A4.5 4.5 0 0016.5 10.5Z" /></svg>
                    Teams
                  </button>
                </div>
                <div class="grid grid-cols-[repeat(17,minmax(0,1fr))] gap-px text-center text-xs text-slate-400">
                  <div class="grid grid-cols-subgrid col-span-17">
                    {Array.from({ length: 17 }, (_, i) => 15 + i).map(day => <span>{day}</span>)}
                  </div>
                  <div class="col-span-17 h-2"></div>
                  <div class="col-start-4 col-span-7 row-start-2"><div class="w-full h-8 bg-red-500/80 border border-red-400/80 rounded-lg flex items-center px-2 text-sm text-white"><span class="font-bold">🚩 Beta Release</span></div></div>
                  <div class="col-start-8 col-span-8 row-start-3 mt-1"><div class="w-full h-8 bg-purple-500/80 border border-purple-400/80 rounded-lg flex items-center px-2 text-sm text-white"><span class="font-medium">🔗 Staging & Previews</span></div></div>
                  <div class="col-start-13 col-span-4 row-start-4 mt-1"><div class="w-full h-8 bg-amber-500/80 border border-amber-400/80 rounded-lg flex items-center px-2 text-sm text-white"><span class="font-medium">🐞 Final QA</span></div></div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: "Work Smarter Not Harder" */}
          <div
            ref={panel2Ref}
            class="absolute inset-0 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row-reverse gap-8 items-center justify-between opacity-0"
          >
            {/* Right Side Content - Text */}
            <div class="w-full md:w-1/2 flex flex-col justify-between items-start text-left md:text-right md:items-end">
              <div>
                <div class="flex md:justify-end items-center gap-3 mb-4">
                  <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                  </div>
                </div>
                <h2 class="text-4xl md:text-5xl font-bold tracking-tight text-slate-50">
                  Work Smarter<br />Not Harder
                </h2>
              </div>
              <button class="hidden md:flex self-start items-center justify-center w-12 h-12 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full transition-all duration-300 mt-8">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>

            {/* Left Side Content - New Board Panel Mockup */}
            <div class="w-full md:w-1/2 relative h-full flex items-center justify-center p-4 md:p-0">
              <div class="absolute inset-0 m-auto max-w-[500px] max-h-[350px] bg-white rounded-lg shadow-xl overflow-hidden text-black dark:bg-gray-900 dark:text-white dark:border dark:border-gray-700 scale-95 md:scale-100">
                {/* Board Header */}
                <div class="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 class="text-xl font-semibold">Board name</h3>
                  <button class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>
                    Automate
                  </button>
                </div>
                {/* Tabs */}
                <div class="px-3 border-b border-gray-200 dark:border-gray-700 flex text-sm">
                  <button class="py-2 px-3 border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M3.75 5.25a3 3 0 013-3h10.5a3 3 0 013 3V18a3 3 0 01-3 3H6.75a3 3 0 01-3-3V5.25zM12 9a.75.75 0 00-1.5 0v3.75H7.5a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25h2.25a.75.75 0 000-1.5H12V9z" clip-rule="evenodd" /></svg>
                    Main table
                  </button>
                  <button class="py-2 px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M3.75 5.25a3 3 0 013-3h10.5a3 3 0 013 3v13.5a3 3 0 01-3 3H6.75a3 3 0 01-3-3V5.25zM12 9a.75.75 0 00-1.5 0v3.75H7.5a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25h2.25a.75.75 0 000-1.5H12V9z" clip-rule="evenodd" /></svg>
                    Gantt
                  </button>
                  <button class="py-2 px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 11.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zM3 15.75a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zM3 20.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" /></svg>
                    Kanban
                  </button>
                  <button class="py-2 px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">+</button>
                </div>

                {/* Table Content */}
                <div class="p-3 space-y-3 md:space-y-4 text-[0.8rem] md:text-sm">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-semibold text-blue-600 dark:text-blue-400">Group 1</span>
                      <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">+</button>
                    </div>
                    <div class="grid grid-cols-[10px_repeat(4,1fr)] grid-rows-3 gap-0 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                      <div class="bg-blue-500 row-span-full h-full"></div>
                      {Array.from({ length: 12 }).map(() => (
                        <div class="h-8 border-r border-b border-gray-100 dark:border-gray-700 last:border-r-0 last:border-b-0"></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-semibold text-purple-600 dark:text-purple-400">Group 2</span>
                      <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">+</button>
                    </div>
                    <div class="grid grid-cols-[10px_repeat(4,1fr)] grid-rows-2 gap-0 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                      <div class="bg-purple-500 row-span-full h-full"></div>
                      {Array.from({ length: 8 }).map(() => (
                        <div class="h-8 border-r border-b border-gray-100 dark:border-gray-700 last:border-r-0 last:border-b-0"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: "Work Smarter Not Harder" */}
          <div
            ref={panel2Ref}
            class="absolute inset-0 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row-reverse gap-8 items-center justify-between opacity-0"
          >
            {/* Right Side Content - Text */}
            <div class="w-full md:w-1/2 flex flex-col justify-between items-start text-left md:text-right md:items-end">
              <div>
                <div class="flex md:justify-end items-center gap-3 mb-4">
                  <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                  </div>
                </div>
                <h2 class="text-4xl md:text-5xl font-bold tracking-tight text-slate-50">
                  Work Smarter<br />Not Harder
                </h2>
              </div>
              <button class="hidden md:flex self-start items-center justify-center w-12 h-12 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full transition-all duration-300 mt-8">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>

            {/* Left Side Content - New Board Panel Mockup */}
            <div class="w-full md:w-1/2 relative h-full flex items-center justify-center p-4 md:p-0">
              <div class="absolute inset-0 m-auto max-w-[500px] max-h-[350px] bg-white rounded-lg shadow-xl overflow-hidden text-black dark:bg-gray-900 dark:text-white dark:border dark:border-gray-700 scale-95 md:scale-100">
                {/* Board Header */}
                <div class="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 class="text-xl font-semibold">Board name</h3>
                  <button class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>
                    Automate
                  </button>
                </div>
                {/* Tabs */}
                <div class="px-3 border-b border-gray-200 dark:border-gray-700 flex text-sm">
                  <button class="py-2 px-3 border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M3.75 5.25a3 3 0 013-3h10.5a3 3 0 013 3V18a3 3 0 01-3 3H6.75a3 3 0 01-3-3V5.25zM12 9a.75.75 0 00-1.5 0v3.75H7.5a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25h2.25a.75.75 0 000-1.5H12V9z" clip-rule="evenodd" /></svg>
                    Main table
                  </button>
                  <button class="py-2 px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M3.75 5.25a3 3 0 013-3h10.5a3 3 0 013 3v13.5a3 3 0 01-3 3H6.75a3 3 0 01-3-3V5.25zM12 9a.75.75 0 00-1.5 0v3.75H7.5a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25h2.25a.75.75 0 000-1.5H12V9z" clip-rule="evenodd" /></svg>
                    Gantt
                  </button>
                  <button class="py-2 px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 11.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zM3 15.75a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zM3 20.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" /></svg>
                    Kanban
                  </button>
                  <button class="py-2 px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">+</button>
                </div>

                {/* Table Content */}
                <div class="p-3 space-y-3 md:space-y-4 text-[0.8rem] md:text-sm">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-semibold text-blue-600 dark:text-blue-400">Group 1</span>
                      <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">+</button>
                    </div>
                    <div class="grid grid-cols-[10px_repeat(4,1fr)] grid-rows-3 gap-0 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                      <div class="bg-blue-500 row-span-full h-full"></div>
                      {Array.from({ length: 12 }).map(() => (
                        <div class="h-8 border-r border-b border-gray-100 dark:border-gray-700 last:border-r-0 last:border-b-0"></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-semibold text-purple-600 dark:text-purple-400">Group 2</span>
                      <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">+</button>
                    </div>
                    <div class="grid grid-cols-[10px_repeat(4,1fr)] grid-rows-2 gap-0 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                      <div class="bg-purple-500 row-span-full h-full"></div>
                      {Array.from({ length: 8 }).map(() => (
                        <div class="h-8 border-r border-b border-gray-100 dark:border-gray-700 last:border-r-0 last:border-b-0"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: "Work Smarter Not Harder" */}
          <div
            ref={panel2Ref}
            class="absolute inset-0 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row-reverse gap-8 items-center justify-between opacity-0"
          >
            {/* Right Side Content - Text */}
            <div class="w-full md:w-1/2 flex flex-col justify-between items-start text-left md:text-right md:items-end">
              <div>
                <div class="flex md:justify-end items-center gap-3 mb-4">
                  <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                  </div>
                </div>
                <h2 class="text-4xl md:text-5xl font-bold tracking-tight text-slate-50">
                  Work Smarter<br />Not Harder
                </h2>
              </div>
              <button class="hidden md:flex self-start items-center justify-center w-12 h-12 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full transition-all duration-300 mt-8">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>

            {/* Left Side Content - New Board Panel Mockup */}
            <div class="w-full md:w-1/2 relative h-full flex items-center justify-center p-4 md:p-0">
              <div class="absolute inset-0 m-auto max-w-[500px] max-h-[350px] bg-white rounded-lg shadow-xl overflow-hidden text-black dark:bg-gray-900 dark:text-white dark:border dark:border-gray-700 scale-95 md:scale-100">
                {/* Board Header */}
                <div class="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 class="text-xl font-semibold">Board name</h3>
                  <button class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>
                    Automate
                  </button>
                </div>
                {/* Tabs */}
                <div class="px-3 border-b border-gray-200 dark:border-gray-700 flex text-sm">
                  <button class="py-2 px-3 border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M3.75 5.25a3 3 0 013-3h10.5a3 3 0 013 3V18a3 3 0 01-3 3H6.75a3 3 0 01-3-3V5.25zM12 9a.75.75 0 00-1.5 0v3.75H7.5a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25h2.25a.75.75 0 000-1.5H12V9z" clip-rule="evenodd" /></svg>
                    Main table
                  </button>
                  <button class="py-2 px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M3.75 5.25a3 3 0 013-3h10.5a3 3 0 013 3v13.5a3 3 0 01-3 3H6.75a3 3 0 01-3-3V5.25zM12 9a.75.75 0 00-1.5 0v3.75H7.5a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25h2.25a.75.75 0 000-1.5H12V9z" clip-rule="evenodd" /></svg>
                    Gantt
                  </button>
                  <button class="py-2 px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 11.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zM3 15.75a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zM3 20.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" /></svg>
                    Kanban
                  </button>
                  <button class="py-2 px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">+</button>
                </div>

                {/* Table Content */}
                <div class="p-3 space-y-3 md:space-y-4 text-[0.8rem] md:text-sm">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-semibold text-blue-600 dark:text-blue-400">Group 1</span>
                      <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">+</button>
                    </div>
                    <div class="grid grid-cols-[10px_repeat(4,1fr)] grid-rows-3 gap-0 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                      <div class="bg-blue-500 row-span-full h-full"></div>
                      {Array.from({ length: 12 }).map(() => (
                        <div class="h-8 border-r border-b border-gray-100 dark:border-gray-700 last:border-r-0 last:border-b-0"></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-semibold text-purple-600 dark:text-purple-400">Group 2</span>
                      <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">+</button>
                    </div>
                    <div class="grid grid-cols-[10px_repeat(4,1fr)] grid-rows-2 gap-0 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                      <div class="bg-purple-500 row-span-full h-full"></div>
                      {Array.from({ length: 8 }).map(() => (
                        <div class="h-8 border-r border-b border-gray-100 dark:border-gray-700 last:border-r-0 last:border-b-0"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 3: "Coordinate With your Team" */}
          <div
            ref={panel3Ref}
            class="absolute inset-0 bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between opacity-0"
          >
            {/* Left Side Content - Text */}
            <div class="w-full md:w-1/2 flex flex-col justify-between items-start text-left">
              <div>
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.5c.828 0 1.5-.672 1.5-1.5s-.672-1.5-1.5-1.5-1.5.672-1.5 1.5.672 1.5 1.5 1.5zm-8.25-1.5c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5zM12 2.25c-1.879 0-3.479 1.438-3.712 3.376A22.029 22.029 0 0112 7.5h.008c.573 0 1.096-.134 1.59-.364a6.529 6.529 0 00-.77-1.127A3.75 3.75 0 0012 2.25zm0 13.5c1.157 0 2.23.23 3.22-.693.99-.922 1.58-2.18 1.58-3.487v-2.25h-.008a9.75 9.75 0 00-11.962 0H5.25v2.25c0 1.307.59 2.565 1.58 3.487.99.923 2.063.693 3.22.693h2.25z" /></svg>
                  </div>
                </div>
                <h2 class="text-4xl md:text-5xl font-bold tracking-tight text-slate-50">
                  Coordinate<br />With your Team
                </h2>
              </div>
              <button class="hidden md:flex items-center justify-center w-12 h-12 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full transition-all duration-300 mt-8">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>

            {/* Right Side Content - New Chat Panel Mockup */}
            <div class="w-full md:w-1/2 relative h-full flex items-center justify-center p-4 md:p-0">
              <div class="absolute inset-0 m-auto max-w-[500px] max-h-[350px] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col text-black dark:bg-gray-900 dark:text-white dark:border dark:border-gray-700 scale-95 md:scale-100">
                {/* Chat Header */}
                <div class="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                  <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">JD</div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-lg">Team Chat</h3>
                    <p class="text-xs text-gray-500 dark:text-gray-400">4 members online</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-gray-500 dark:text-gray-400"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>
                </div>

                {/* Chat Messages */}
                <div class="flex-1 p-3 overflow-y-auto space-y-3 text-sm scrollbar-hide">
                  <div class="flex items-start gap-2">
                    <div class="w-7 h-7 bg-purple-500 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs">A</div>
                    <div class="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg max-w-[75%]">
                      <p class="font-semibold text-gray-800 dark:text-gray-100">Alice</p>
                      <p class="text-gray-700 dark:text-gray-200">Hey team, I've just updated the sprint board!</p>
                      <span class="text-xs text-gray-500 dark:text-gray-400">10:30 AM</span>
                    </div>
                  </div>
                  <div class="flex items-start gap-2 justify-end">
                    <div class="bg-blue-500 text-white p-2 rounded-lg max-w-[75%]">
                      <p class="font-semibold">You</p>
                      <p>Great! I'll take a look. Need anything from my side?</p>
                      <span class="text-xs text-blue-200">10:32 AM</span>
                    </div>
                  </div>
                  <div class="flex items-start gap-2">
                    <div class="w-7 h-7 bg-green-500 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs">JD</div>
                    <div class="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg max-w-[75%]">
                      <p class="font-semibold text-gray-800 dark:text-gray-100">John</p>
                      <p class="text-gray-700 dark:text-gray-200">Just reviewing the new designs. Looking good!</p>
                      <span class="text-xs text-gray-500 dark:text-gray-400">10:35 AM</span>
                    </div>
                  </div>
                </div>

                {/* Input Area */}
                <div class="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                  <input type="text" placeholder="Type your message..." class="flex-1 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors">Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;
import { Component, onMount } from 'solid-js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

/**
 * GSAP animation logic (unchanged).
 * @param container The main container element for the component.
 */
const animateOnScroll = (container: HTMLElement) => {
  if (!container) return;

  const leftPanel = container.querySelector('.anim-left-panel');
  const card1 = container.querySelector('.anim-card-1');
  const card2 = container.querySelector('.anim-card-2');
  const checklistItems = gsap.utils.toArray('.anim-checklist-item');
  const timelineBars = gsap.utils.toArray('.anim-timeline-bar');
  const timelineHeader = container.querySelector('.anim-timeline-header');
  const timelineDates = container.querySelector('.anim-timeline-dates');

  gsap.set([leftPanel, card1, card2], { autoAlpha: 0, y: 40 });
  gsap.set(checklistItems, { autoAlpha: 0, x: -20 });
  gsap.set(timelineHeader, { autoAlpha: 0, y: -20 });
  gsap.set(timelineDates, { autoAlpha: 0 });
  gsap.set(timelineBars, { scaleX: 0, transformOrigin: 'left center' });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: 'top 85%',
      toggleActions: 'play reverse play reverse',
    },
    defaults: { ease: 'power3.out', duration: 0.8 }
  });

  tl
    .to(leftPanel, { autoAlpha: 1, y: 0 }, 0)
    .to(card1, { autoAlpha: 1, y: 0 }, 0.2)
    .to(card2, { autoAlpha: 1, y: 0 }, 0.3)
    .to(checklistItems, { autoAlpha: 1, x: 0, stagger: 0.1, duration: 0.5 }, 0.5)
    .to(timelineHeader, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.6)
    .to(timelineDates, { autoAlpha: 1, duration: 0.6 }, 0.8)
    .to(timelineBars, { scaleX: 1, stagger: 0.15, duration: 0.7, ease: 'power2.inOut' }, 0.9);
};


/**
 * Main Project Tracker Component (Now with automatic theme detection)
 */
const ProjectTracker: Component = () => {
  let containerRef: HTMLDivElement | undefined;

  onMount(() => {
    if (containerRef) animateOnScroll(containerRef);
  });

  return (
    // This parent div provides a background for the page and scrollable space.
    <div class="bg-slate-100 dark:bg-slate-950 pt-8 transition-colors duration-300">
    <h2 class='text-center dark:text-white text-black text-4xl py-6 font-black'>From Plan to Progress</h2>
      <section
        ref={containerRef}
        class="font-sans max-w-7xl mx-auto bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white p-8 md:p-12 rounded-2xl relative flex flex-col md:flex-row gap-8 min-h-[420px] overflow-hidden transition-colors duration-300"
      >
        {/* Left Side Panel */}
        <div class="anim-left-panel w-full md:w-1/3 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              </div>
              <span class="text-lg font-semibold text-slate-700 dark:text-slate-200 transition-colors duration-300">Projects</span>
            </div>
            <h2 class="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 transition-colors duration-300">
              Keep every plan on track.
            </h2>
          </div>
          <button class="hidden md:flex items-center justify-center w-12 h-12 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full transition-all duration-300 mt-8">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
        </div>

        {/* Right Side Panel with Cards */}
        <div class="w-full md:w-2/3 relative h-80 md:h-auto min-w-[600px]">
          {/* Card 1: Checklist */}
          <div class="anim-card-1 absolute top-8 left-0 w-[300px] z-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-xl dark:shadow-2xl shadow-slate-500/10 dark:shadow-black/20 transition-colors duration-300">
            <h3 class="font-bold text-2xl text-slate-800 dark:text-slate-100 mb-4 transition-colors duration-300">Key Milestones</h3>
            <div class="flex items-center gap-2 text-slate-600 dark:text-slate-300 mb-4 transition-colors duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg>
               <span class="font-medium">Pre-launch</span>
            </div>
            <ul class="space-y-3 text-slate-600 dark:text-slate-300 transition-colors duration-300">
              <li class="anim-checklist-item flex items-center gap-3">
                <div class="w-5 h-5 flex-shrink-0 bg-blue-500 border border-blue-400 rounded-md flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                <span>Test backup systems</span>
              </li>
              <li class="anim-checklist-item flex items-center gap-3">
                <div class="w-5 h-5 flex-shrink-0 bg-blue-500 border border-blue-400 rounded-md flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                <span>Run final system diagnostics</span>
              </li>
              <li class="anim-checklist-item flex items-center gap-3">
                <div class="w-5 h-5 flex-shrink-0 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md transition-colors duration-300"></div>
                <span>Confirm launch module</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Timeline */}
          <div class="anim-card-2 absolute top-0 right-0 w-[500px] bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-xl dark:shadow-2xl shadow-slate-500/10 dark:shadow-black/20 transition-colors duration-300">
            <div class="anim-timeline-header flex justify-between items-center mb-4">
              <h3 class="font-bold text-2xl text-slate-800 dark:text-slate-100 transition-colors duration-300">Timeline View</h3>
            </div>
            <div class="anim-timeline-header flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 mb-3 transition-colors duration-300">
              <button class="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-sm font-medium flex items-center gap-1.5 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 text-yellow-500 dark:text-yellow-400"><path fill-rule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.394 3.654.293a.75.75 0 0 1 .428 1.317l-2.79 2.427 1.023 3.69a.75.75 0 0 1-1.12.81L8 11.973l-3.1 1.834a.75.75 0 0 1-1.12-.81l1.023-3.69-2.79-2.427a.75.75 0 0 1 .428-1.317l3.654-.293 1.41-3.394A.75.75 0 0 1 8 1.75Z" clip-rule="evenodd" /></svg>
                Timeline
              </button>
              <button class="px-3 py-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-sm font-medium flex items-center gap-1.5 text-slate-500 dark:text-slate-400 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M7 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM7.5 1.5a4.5 4.5 0 1 0 3.364 7.643 6.002 6.002 0 0 1-1.12 1.086C8.89 10.79 8 11.5 8 12.5a.5.5 0 0 1-1 0c0-1.5 1.5-2.5 2.1-3.09.28-.28.529-.592.744-.933A4.5 4.5 0 0 0 7.5 1.5Zm8.5 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm.5 4.5a4.5 4.5 0 1 0-8.035-2.865 6.002 6.002 0 0 0 1.12 1.086C9.11 10.79 10 11.5 10 12.5a.5.5 0 0 0 1 0c0-1.5-1.5-2.5-2.1-3.09a4.504 4.504 0 0 0-1.63-1.055A4.5 4.5 0 0 0 16.5 10.5Z" /></svg>
                Teams
              </button>
            </div>
            <div class="grid grid-cols-[repeat(17,minmax(0,1fr))] gap-px text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
              <div class="anim-timeline-dates grid grid-cols-subgrid col-span-17">
                {Array.from({ length: 17 }, (_, i) => 15 + i).map(day => <span>{day}</span>)}
              </div>
              <div class="col-span-17 h-2"></div>
              <div class="col-start-4 col-span-7 row-start-2"><div class="anim-timeline-bar w-full h-8 bg-red-500/80 border border-red-400/80 rounded-lg flex items-center px-2 text-sm text-white"><span class="font-bold">🚩 Beta Release</span></div></div>
              <div class="col-start-8 col-span-8 row-start-3 mt-1"><div class="anim-timeline-bar w-full h-8 bg-purple-500/80 border border-purple-400/80 rounded-lg flex items-center px-2 text-sm text-white"><span class="font-medium">🔗 Staging & Previews</span></div></div>
              <div class="col-start-13 col-span-4 row-start-4 mt-1"><div class="anim-timeline-bar w-full h-8 bg-amber-500/80 border border-amber-400/80 rounded-lg flex items-center px-2 text-sm text-white"><span class="font-medium">🐞 Final QA</span></div></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* This empty div is here just to create scrollable space for the demo */}
      <div class="h-screen"></div>
    </div>
  );
};

export default ProjectTracker;
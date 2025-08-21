// src/components/HowItWorks.tsx
import { Component, onMount, For, JSX } from "solid-js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Ensure ScrollTrigger is registered
gsap.registerPlugin(ScrollTrigger);

interface Step {
  number: number;
  title: string;
  description: string;
  visual: JSX.Element; // A JSX element for the step's visual mockup
}

const steps: Step[] = [
  {
    number: 1,
    title: "Define Your Project",
    description: "Start by structuring your tasks, assigning owners, and setting clear goals for your entire team.",
    visual: (
      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 text-black dark:text-white shadow-md border border-gray-200 dark:border-gray-700 w-full h-48 flex flex-col justify-between">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">P1</div>
          <span class="font-semibold text-gray-800 dark:text-gray-100">Project Alpha</span>
          <span class="ml-auto text-xs text-gray-500 dark:text-gray-400">Main Board</span>
        </div>
        <div class="grid grid-cols-[30px_1fr_80px_80px] text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
          <div>#</div>
          <div>Task Name</div>
          <div>Owner</div>
          <div>Status</div>
        </div>
        <div class="flex-1 space-y-2 overflow-hidden">
          <div class="grid grid-cols-[30px_1fr_80px_80px] items-center text-sm gap-2">
            <span class="text-gray-500 dark:text-gray-400">1</span>
            <span class="text-gray-800 dark:text-gray-200">Plan roadmap</span>
            <span class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">Unassigned</span>
            <span class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">Pending</span>
          </div>
          <div class="grid grid-cols-[30px_1fr_80px_80px] items-center text-sm gap-2">
            <span class="text-gray-500 dark:text-gray-400">2</span>
            <span class="text-gray-800 dark:text-gray-200">Design UI/UX</span>
            <span class="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">JD</span>
            <span class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">Pending</span>
          </div>
        </div>
        <button class="w-full text-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors py-1 mt-auto">+ Add New Item</button>
      </div>
    ),
  },
  {
    number: 2,
    title: "Track Progress Visually",
    description: "Monitor your team's advancements in real-time, identify bottlenecks, and keep everyone on the same page.",
    visual: (
      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 text-black dark:text-white shadow-md border border-gray-200 dark:border-gray-700 w-full h-48 flex flex-col justify-between">
         <div class="flex items-center gap-2 mb-2">
          <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">P1</div>
          <span class="font-semibold text-gray-800 dark:text-gray-100">Project Alpha</span>
          <span class="ml-auto text-xs text-gray-500 dark:text-gray-400">Main Board</span>
        </div>
        <div class="grid grid-cols-[30px_1fr_80px_80px] text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
          <div>#</div>
          <div>Task Name</div>
          <div>Owner</div>
          <div>Status</div>
        </div>
        <div class="flex-1 space-y-2 overflow-hidden">
          <div class="grid grid-cols-[30px_1fr_80px_80px] items-center text-sm gap-2">
            <span class="text-gray-500 dark:text-gray-400">1</span>
            <span class="text-gray-800 dark:text-gray-200">Plan roadmap</span>
            <span class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">JD</span>
            <span class="bg-green-500/80 text-white px-2 py-1 rounded-full text-xs">Done</span>
          </div>
          <div class="grid grid-cols-[30px_1fr_80px_80px] items-center text-sm gap-2">
            <span class="text-gray-500 dark:text-gray-400">2</span>
            <span class="text-gray-800 dark:text-gray-200">Design UI/UX</span>
            <span class="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">JD</span>
            <span class="bg-yellow-500/80 text-white px-2 py-1 rounded-full text-xs">Working on it</span>
          </div>
          <div class="grid grid-cols-[30px_1fr_80px_80px] items-center text-sm gap-2">
            <span class="text-gray-500 dark:text-gray-400">3</span>
            <span class="text-gray-800 dark:text-gray-200">Develop backend</span>
            <span class="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs">AL</span>
            <span class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">Pending</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    number: 3,
    title: "Automate & Scale",
    description: "Set up powerful automations, integrate with your favorite tools, and scale your operations with ease.",
    visual: (
      <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 text-black dark:text-white shadow-md border border-gray-200 dark:border-gray-700 w-full h-48 flex flex-col justify-between">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">P1</div>
          <span class="font-semibold text-gray-800 dark:text-gray-100">Project Alpha</span>
          <span class="ml-auto text-xs text-gray-500 dark:text-gray-400">Main Board</span>
        </div>
        <div class="grid grid-cols-[30px_1fr_80px_80px] text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
          <div>#</div>
          <div>Task Name</div>
          <div>Owner</div>
          <div>Status</div>
        </div>
        <div class="flex-1 space-y-2 overflow-hidden">
          <div class="grid grid-cols-[30px_1fr_80px_80px] items-center text-sm gap-2">
            <span class="text-gray-500 dark:text-gray-400">1</span>
            <span class="text-gray-800 dark:text-gray-200">Plan roadmap</span>
            <span class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">JD</span>
            <span class="bg-green-500/80 text-white px-2 py-1 rounded-full text-xs">Done</span>
          </div>
          <div class="grid grid-cols-[30px_1fr_80px_80px] items-center text-sm gap-2">
            <span class="text-gray-500 dark:text-gray-400">2</span>
            <span class="text-gray-800 dark:text-gray-200">Design UI/UX</span>
            <span class="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">JD</span>
            <span class="bg-yellow-500/80 text-white px-2 py-1 rounded-full text-xs">Working on it</span>
          </div>
          <div class="grid grid-cols-[30px_1fr_80px_80px] items-center text-sm gap-2">
            <span class="text-gray-500 dark:text-gray-400">3</span>
            <span class="text-gray-800 dark:text-gray-200">Develop backend</span>
            <span class="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs">AL</span>
            <span class="bg-green-500/80 text-white px-2 py-1 rounded-full text-xs">Done</span> {/* Changed to done for progression */}
          </div>
           <div class="grid grid-cols-[30px_1fr_80px_80px] items-center text-sm gap-2">
            <span class="text-gray-500 dark:text-gray-400">4</span>
            <span class="text-gray-800 dark:text-gray-200">Launch Prep</span>
            <span class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">TM</span>
            <span class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">Pending</span>
          </div>
        </div>
        <div class="flex justify-end text-xs text-gray-500 dark:text-gray-400 mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>
          Automated: 2 rules
        </div>
      </div>
    ),
  },
];

const HowItWorks: Component = () => {
  let sectionRef: HTMLDivElement | undefined;
  let titleRef: HTMLHeadingElement | undefined;
  // Create an array of refs for the step elements
  const stepRefs: (HTMLDivElement | undefined)[] = [];

  onMount(() => {
    if (!sectionRef || !titleRef || stepRefs.some(ref => !ref)) {
      console.warn("HowItWorks: Missing one or more refs for animation.");
      return;
    }

    // Set initial states for animation
    gsap.set(titleRef, { opacity: 0, y: 50 });
    gsap.set(stepRefs, { opacity: 0, y: 50 }); // Set initial state for all step containers

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef,
        start: "top 75%", // Start animation when top of section is 75% down the viewport
        toggleActions: "play none none none", // Play once on scroll down
        // markers: true, // Uncomment for debugging
      },
    });

    tl.to(titleRef, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
      .to(stepRefs, { // Animate all step containers with a stagger
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.25, // Stagger the animation of each step
      }, "<0.2"); // Start steps slightly after the title
  });

  return (
    <section ref={sectionRef} class="bg-slate-950 py-20 md:py-28 px-4">
      <div class="max-w-7xl mx-auto text-white">
        <h2 ref={titleRef} class="text-center text-4xl md:text-5xl font-extrabold mb-16 text-slate-50">
          How It <span class="text-purple-500">Works</span>
        </h2>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <For each={steps}>
            {(step, i) => (
              <div
                ref={el => (stepRefs[i()] = el)} // Assign ref to each step element
                class="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
              >
                <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-6 flex-shrink-0">
                  {step.number}
                </div>
                <h3 class="text-2xl font-bold mb-3 text-slate-50">{step.title}</h3>
                <p class="text-slate-300 mb-8">{step.description}</p>
                <div class="w-full flex justify-center mt-auto"> {/* visual always at bottom */}
                  {step.visual}
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
import { ParentComponent, onMount, onCleanup } from 'solid-js';
import Sidebar from './Sidebar';
import gsap from 'gsap'; // We'll use GSAP for smooth, performant animation

const DashboardLayout: ParentComponent = (props) => {
  // --- Refs for the animated glow elements ---
  let glowShape1Ref: HTMLDivElement | undefined;
  let glowShape2Ref: HTMLDivElement | undefined;
  let glowShape3Ref: HTMLDivElement | undefined;

  // --- Animation Logic ---
  onMount(() => {
    // A continuous, slow, and gentle animation for the background shapes
    const timeline = gsap.timeline({ repeat: -1, yoyo: true });

    timeline
      .to(glowShape1Ref, {
        y: -50,
        x: 30,
        rotation: 20,
        duration: 40, // Very slow duration for an ambient feel
        ease: 'sine.inOut',
      })
      .to(glowShape2Ref, {
        y: 40,
        x: -20,
        rotation: -30,
        duration: 35,
        ease: 'sine.inOut',
      }, "<") // "<" makes it start at the same time as the previous animation
      .to(glowShape3Ref, {
        y: -30,
        x: 40,
        rotation: 15,
        duration: 45,
        ease: 'sine.inOut',
      }, "<");
  });

  // Clean up the animation when the component is unmounted to prevent memory leaks
  onCleanup(() => {
    gsap.killTweensOf([glowShape1Ref, glowShape2Ref, glowShape3Ref]);
  });

  return (
    // --- THIS IS THE MAIN CONTAINER ---
    // `relative` is crucial for positioning the glow shapes.
    // `overflow-hidden` prevents the large shapes from creating scrollbars.
    <div class="relative min-h-screen w-full bg-white dark:bg-neutral-900 overflow-hidden">
      
      {/* --- THE EXCITING BACKGROUND --- */}
      {/* These divs are the "glow". They sit behind all other content. */}
      <div class="absolute inset-0 z-0">
        <div 
          ref={glowShape1Ref}
          class="absolute top-[-20%] left-[-15%] w-[40rem] h-[40rem] rounded-full 
                 bg-indigo-100 dark:bg-indigo-900/40 
                 filter blur-3xl opacity-60 dark:opacity-50"
        ></div>
        <div 
          ref={glowShape2Ref}
          class="absolute bottom-[-25%] right-[-15%] w-[50rem] h-[50rem] rounded-full 
                 bg-purple-100 dark:bg-purple-900/30 
                 filter blur-3xl opacity-60 dark:opacity-40"
        ></div>
         <div 
          ref={glowShape3Ref}
          class="hidden sm:block absolute top-[20%] right-[5%] w-[30rem] h-[30rem] rounded-2xl 
                 bg-pink-100 dark:bg-pink-900/20 
                 filter blur-3xl opacity-50 dark:opacity-30"
        ></div>
      </div>

      {/* 
        The Sidebar and Main content are now positioned `relative` with a `z-10`
        to ensure they render ON TOP of the background glow.
      */}
      <div class="relative z-10">
        <Sidebar />
        <main class="lg:ml-64 text-neutral-800 dark:text-neutral-200">
          {props.children}
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
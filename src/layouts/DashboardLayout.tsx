import { ParentComponent, onMount, onCleanup, createSignal, createContext } from 'solid-js';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import { UIProvider } from '../context/UIContext';
import gsap from 'gsap';






const DashboardLayout: ParentComponent = (props) => {
  let glowShape1Ref: HTMLDivElement | undefined;
  let glowShape2Ref: HTMLDivElement | undefined;
  let glowShape3Ref: HTMLDivElement | undefined;

  onMount(() => {
    const timeline = gsap.timeline({ repeat: -1, yoyo: true });
    timeline
      .to(glowShape1Ref, { y: -50, x: 30, rotation: 20, duration: 40, ease: 'sine.inOut' })
      .to(glowShape2Ref, { y: 40, x: -20, rotation: -30, duration: 35, ease: 'sine.inOut' }, "<")
      .to(glowShape3Ref, { y: -30, x: 40, rotation: 15, duration: 45, ease: 'sine.inOut' }, "<");
  });

  onCleanup(() => {
    gsap.killTweensOf([glowShape1Ref, glowShape2Ref, glowShape3Ref]);
  });

  return (
    <UIProvider>
      <div class="relative min-h-screen w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
        {/* --- The Exciting Background --- */}
        <div class="absolute inset-0 z-0">
          <div ref={glowShape1Ref} class="absolute top-[-20%] left-[-15%] w-[40rem] h-[40rem] rounded-full bg-indigo-100 dark:bg-indigo-900/40 filter blur-3xl opacity-60 dark:opacity-50" />
          <div ref={glowShape2Ref} class="absolute bottom-[-25%] right-[-15%] w-[50rem] h-[50rem] rounded-full bg-purple-100 dark:bg-purple-900/30 filter blur-3xl opacity-60 dark:opacity-40" />
          <div ref={glowShape3Ref} class="hidden sm:block absolute top-[20%] right-[5%] w-[30rem] h-[30rem] rounded-2xl bg-pink-100 dark:bg-pink-900/20 filter blur-3xl opacity-50 dark:opacity-30" />
        </div>

        {/* --- Main Content Area --- */}
        <div class="relative z-10">
          <Sidebar />
          <div class="lg:ml-64 flex flex-col h-screen">
            <Header />
            <main class="flex-grow overflow-y-auto">
              {props.children}
            </main>
          </div>
        </div>
      </div>
    </UIProvider>
  );
};

export default DashboardLayout;
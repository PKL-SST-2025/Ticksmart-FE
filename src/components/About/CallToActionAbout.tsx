// src/components/about/CallToActionAbout.tsx
import { Component, onMount } from "solid-js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CallToActionAbout: Component = () => {
  let sectionRef: HTMLDivElement | undefined;
  let titleRef: HTMLHeadingElement | undefined;
  let subtitleRef: HTMLParagraphElement | undefined;
  let buttonRef: HTMLAnchorElement | undefined;

  onMount(() => {
    if (!sectionRef || !titleRef || !subtitleRef || !buttonRef) {
      console.warn("CallToActionAbout: Missing refs for animation.");
      return;
    }

    gsap.set([titleRef, subtitleRef, buttonRef], { opacity: 0, y: 50 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef,
        start: "top 75%",
        toggleActions: "play none none none",
      },
    });

    tl.to(titleRef, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
      .to(subtitleRef, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "<0.2")
      .to(buttonRef, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "<0.2");
  });

  return (
    <section ref={sectionRef} class="bg-slate-950 py-20 md:py-28 px-4 text-center">
      <div class="max-w-3xl mx-auto">
        <h2 ref={titleRef} class="text-4xl md:text-5xl font-extrabold mb-6 text-slate-50">
          Ready to experience the difference?
        </h2>
        <p ref={subtitleRef} class="text-lg text-slate-300 mb-10 leading-relaxed">
          Discover how our platform can empower your team and streamline your projects. Get started today!
        </p>
        <a
          ref={buttonRef}
          href="#" // Link to your sign-up or product page
          class="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-300 transform hover:scale-105"
        >
          Try Our Platform
          <svg class="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </a>
      </div>
    </section>
  );
};

export default CallToActionAbout;
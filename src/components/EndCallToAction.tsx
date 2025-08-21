// src/components/CallToAction.tsx
import { Component, onMount } from "solid-js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Ensure ScrollTrigger is registered
gsap.registerPlugin(ScrollTrigger);

const EndCallToAction: Component = () => {
  let sectionRef: HTMLDivElement | undefined;
  let titleRef: HTMLHeadingElement | undefined;
  let subtitleRef: HTMLParagraphElement | undefined;
  let buttonRef: HTMLAnchorElement | undefined;

  onMount(() => {
    // Ensure all necessary refs are available before animating
    if (!sectionRef || !titleRef || !subtitleRef || !buttonRef) {
      console.warn("CallToAction: Missing one or more refs for animation.");
      return;
    }

    // Set initial states for animation: hidden and slightly below position
    gsap.set([titleRef, subtitleRef, buttonRef], { opacity: 0, y: 50 });

    // Create a timeline for this section's entrance
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef,
        start: "top 75%", // Animation starts when top of section is 75% down the viewport
        toggleActions: "play none none none", // Play once on scroll down
        // markers: true, // Uncomment for visual debugging
      },
    });

    // Animate elements in sequence
    tl.to(titleRef, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
      .to(subtitleRef, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "<0.2") // Subtitle starts 0.2s after title
      .to(buttonRef, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "<0.2"); // Button starts 0.2s after subtitle
  });

  return (
    <section ref={sectionRef} class="bg-slate-950 py-20 md:py-28 px-4 text-center">
      <div class="max-w-3xl mx-auto">
        <h2 ref={titleRef} class="text-4xl md:text-5xl font-extrabold mb-6 text-slate-50">
          Ready to transform your workflow?
        </h2>
        <p ref={subtitleRef} class="text-lg text-slate-300 mb-10 leading-relaxed">
          Join thousands of successful teams who are already building, collaborating, and shipping projects faster than ever.
        </p>
        <a
          ref={buttonRef}
          href="#" // Replace with your actual call-to-action link (e.g., /signup or /contact)
          class="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all duration-300 transform hover:scale-105"
        >
          Get Started For Free
          {/* Arrow SVG icon */}
          <svg class="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </a>
      </div>
    </section>
  );
};

export default EndCallToAction;
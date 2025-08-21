// src/components/about/TeamSection.tsx
import { Component, onMount } from "solid-js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TeamSection: Component = () => {
  let sectionRef: HTMLDivElement | undefined;
  let titleRef: HTMLHeadingElement | undefined;
  let textRef: HTMLParagraphElement | undefined;

  onMount(() => {
    if (!sectionRef || !titleRef || !textRef) {
      console.warn("TeamSection: Missing refs for animation.");
      return;
    }

    gsap.set([titleRef, textRef], { opacity: 0, y: 50 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef,
        start: "top 75%",
        toggleActions: "play none none none",
      },
    });

    tl.to(titleRef, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
      .to(textRef, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "<0.2");
  });

  return (
    <section ref={sectionRef} class="bg-slate-900 text-white py-20 md:py-28 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <h2 ref={titleRef} class="text-4xl md:text-5xl font-extrabold mb-6 text-slate-50">
          The People <span class="text-teal-400">Behind YourApp</span>
        </h2>
        <p ref={textRef} class="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Our diverse team of passionate engineers, designers, and strategists are dedicated to building tools that empower you. We're united by a shared vision to simplify complex workflows and bring clarity to collaboration.
        </p>
        {/* You could add a placeholder for a team photo here */}
        <div class="w-full max-w-lg h-64 bg-slate-800 rounded-lg mx-auto mt-12 flex items-center justify-center text-slate-500 text-sm">
          [ Placeholder for Team Photo / Illustration ]
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
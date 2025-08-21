// src/components/about/ValuesSection.tsx
import { Component, onMount, JSX } from "solid-js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaSolidLightbulb, FaSolidPeopleGroup, FaSolidRocket, FaSolidHandshake } from 'solid-icons/fa'; // Example icons

gsap.registerPlugin(ScrollTrigger);

const ValuesSection: Component = () => {
  let sectionRef: HTMLDivElement | undefined;
  let titleRef: HTMLHeadingElement | undefined;
  let card1Ref: HTMLDivElement | undefined;
  let card2Ref: HTMLDivElement | undefined;
  let card3Ref: HTMLDivElement | undefined;
  let card4Ref: HTMLDivElement | undefined;

  onMount(() => {
    const cardRefs = [card1Ref, card2Ref, card3Ref, card4Ref];

    if (!sectionRef || !titleRef || cardRefs.some(ref => !ref)) {
      console.warn("ValuesSection: Missing refs for animation.");
      return;
    }

    gsap.set(titleRef, { opacity: 0, y: 50 });
    gsap.set(cardRefs, { opacity: 0, scale: 0.8, y: 50 }); // Cards start smaller, invisible, and below

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef,
        start: "top 75%",
        toggleActions: "play none none none",
      },
    });

    tl.to(titleRef, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
      .to(cardRefs, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.7,
        ease: "back.out(1.7)", // Fun bouncy ease
        stagger: 0.15,
      }, "<0.2");

    // Add hover animations for interactivity
    cardRefs.forEach(cardRef => {
      if (cardRef) {
        gsap.to(cardRef, {
          scale: 1.05, // Slightly larger on hover
          '--tw-shadow-color': 'rgba(129, 140, 248, 0.5)', // Custom property for dynamic shadow color
          boxShadow: '0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color)', // Apply shadow
          y: -10, // Lift slightly
          duration: 0.3,
          ease: "power2.out",
          paused: true, // Start paused
        }).reverse(); // Make it reversible for toggle
        cardRef.addEventListener('mouseenter', () => gsap.to(cardRef, { overwrite: true, scale: 1.05, y: -10, boxShadow: '0 20px 25px -5px rgba(129, 140, 248, 0.5), 0 8px 10px -6px rgba(129, 140, 248, 0.5)', duration: 0.3 }));
        cardRef.addEventListener('mouseleave', () => gsap.to(cardRef, { overwrite: true, scale: 1, y: 0, boxShadow: '0 0px 0px 0px transparent', duration: 0.3 }));
      }
    });
  });

  return (
    <section ref={sectionRef} class="bg-slate-950 text-white py-20 md:py-28 px-4">
      <div class="max-w-6xl mx-auto">
        <h2 ref={titleRef} class="text-center text-4xl md:text-5xl font-extrabold mb-16 text-slate-50">
          Our Core <span class="text-purple-400">Values</span>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1: Innovation */}
          <div
            ref={card1Ref}
            class="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800"
            style="--tw-shadow-color: transparent;"
          >
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-yellow-400 bg-gray-700/50">
              <FaSolidLightbulb class="w-8 h-8" />
            </div>
            <h3 class="text-xl font-bold mb-2 text-slate-50">Innovation</h3>
            <p class="text-slate-300 text-sm">Constantly pushing boundaries to deliver cutting-edge solutions that solve real-world problems.</p>
          </div>

          {/* Card 2: Collaboration */}
          <div
            ref={card2Ref}
            class="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800"
            style="--tw-shadow-color: transparent;"
          >
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-blue-400 bg-gray-700/50">
              <FaSolidPeopleGroup class="w-8 h-8" />
            </div>
            <h3 class="text-xl font-bold mb-2 text-slate-50">Collaboration</h3>
            <p class="text-slate-300 text-sm">Fostering an environment where ideas flourish through open communication and teamwork.</p>
          </div>

          {/* Card 3: Excellence */}
          <div
            ref={card3Ref}
            class="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800"
            style="--tw-shadow-color: transparent;"
          >
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-red-400 bg-gray-700/50">
              <FaSolidRocket class="w-8 h-8" />
            </div>
            <h3 class="text-xl font-bold mb-2 text-slate-50">Excellence</h3>
            <p class="text-slate-300 text-sm">Committed to delivering high-quality, reliable, and user-centric products and services.</p>
          </div>

          {/* Card 4: Integrity */}
          <div
            ref={card4Ref}
            class="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800"
            style="--tw-shadow-color: transparent;"
          >
            <div class="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-green-400 bg-gray-700/50">
              <FaSolidHandshake class="w-8 h-8" />
            </div>
            <h3 class="text-xl font-bold mb-2 text-slate-50">Integrity</h3>
            <p class="text-slate-300 text-sm">Operating with transparency, honesty, and a strong ethical compass in all our interactions.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
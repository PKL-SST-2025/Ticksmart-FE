// src/components/WhyChooseUs.tsx
import { Component, JSX, onMount } from "solid-js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Make sure ScrollTrigger is registered if it's not already globally
gsap.registerPlugin(ScrollTrigger);

// Define a type for your feature card data
interface FeatureCardProps {
  icon: JSX.Element; // SVG icon as a Solid JSX Element
  title: string;
  description: string;
}

const features: FeatureCardProps[] = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-blue-400">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "Boost Productivity",
    description: "Automate repetitive tasks, streamline workflows, and reclaim hours of your day with smart tools.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-green-400">
        <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379m-9.75-1.51h9m-9 3H12m7.5-3l1.5 1.5h-.75A4.5 4.5 0 0015 12.75V11.25m4.5-1.5l1.5-1.5h-.75A4.5 4.5 0 0115 5.25v1.5m0 2.25l-.75.75H15" />
      </svg>
    ),
    title: "Seamless Collaboration",
    description: "Connect your team with shared boards, real-time updates, and integrated communication tools.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-purple-400">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
      </svg>
    ),
    title: "Data-Driven Decisions",
    description: "Gain valuable insights with customizable dashboards and reports to track progress and make informed choices.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-orange-400">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3L11.25 5.25M15 12.75l-1.25 1.25" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21L3 3m0 0l-1.5-1.5m19.897 19.897L21 21M5.25 12.75l-1.5-1.5m10.5-5.25H12m-1.5-4.5h4.5M3.75 8.25h16.5M10.5 16.5h3" />
      </svg>
    ),
    title: "Flexible & Scalable",
    description: "Adapt to your team's unique needs, whether you're a small startup or a large enterprise, with customizable features.",
  },
];

const WhyChooseUs: Component = () => {
  let sectionRef: HTMLDivElement | undefined;
  let titleRef: HTMLHeadingElement | undefined;
  let cardsContainerRef: HTMLDivElement | undefined;

  onMount(() => {
    if (!sectionRef || !titleRef || !cardsContainerRef) {
      console.warn("WhyChooseUs: Missing one or more refs for animation.");
      return;
    }

    // Set initial states for animation
    gsap.set(titleRef, { opacity: 0, y: 50 });
    gsap.set(cardsContainerRef.children, { opacity: 0, y: 50 }); // Select all immediate children (the cards)

    // Create a timeline for this section's entrance
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef,
        start: "top 75%", // Start animation when top of section is 75% down the viewport
        toggleActions: "play none none none", // Play once on scroll down
      },
    });

    tl.to(titleRef, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
      .to(cardsContainerRef.children, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.15, // Stagger the animation of each card
      }, "<0.2"); // Start cards slightly after the title
  });

  return (
    <section ref={sectionRef} class="bg-slate-950 py-20 md:py-28 px-4">
      <div class="max-w-7xl mx-auto text-white">
        <h2 ref={titleRef} class="text-center text-4xl md:text-5xl font-extrabold mb-16 text-slate-50">
          Why Choose <span class="text-blue-500">Our Platform</span>?
        </h2>

        <div ref={cardsContainerRef} class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div class="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
              <div class="mb-4 flex justify-center">{feature.icon}</div>
              <h3 class="text-xl font-bold mb-2 text-slate-50">{feature.title}</h3>
              <p class="text-slate-300 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
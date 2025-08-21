// src/components/Testimonials.tsx
import { Component, onMount, For } from "solid-js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IoStar } from "solid-icons/io";

// Ensure ScrollTrigger is registered
gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  quote: string;
  author: string;
  title: string;
  avatarInitials: string;
  avatarBgColor: string;
  stars: number;
}

const testimonialsData: Testimonial[] = [
    {
    quote: "Our productivity has soared since implementing this platform. The intuitive design and powerful features made onboarding a breeze for our entire team!",
    author: "Alice Johnson",
    title: "Head of Product, InnovateX",
    avatarInitials: "AJ",
    avatarBgColor: "bg-teal-500",
    stars: 5,
  },
  {
    quote: "The collaboration tools are a game-changer. We're now perfectly aligned on every project, and communication bottlenecks are a thing of the past.",
    author: "Robert Smith",
    title: "Project Manager, GlobalLink",
    avatarInitials: "RS",
    avatarBgColor: "bg-amber-500",
    stars: 5,
  },
  {
    quote: "The ability to customize dashboards and track progress visually has revolutionized our decision-making process. Truly an indispensable tool.",
    author: "Maria Garcia",
    title: "Operations Lead, SyncPulse",
    avatarInitials: "MG",
    avatarBgColor: "bg-rose-500",
    stars: 5,
  },
  {
    quote: "We needed a flexible solution that could grow with us, and this platform delivered. It's scalable, robust, and incredibly easy to adapt to our changing needs.",
    author: "David Lee",
    title: "Founder, Apex Innovations",
    avatarInitials: "DL",
    avatarBgColor: "bg-indigo-500",
    stars: 4,
  },
  {
    quote: "Support has been outstanding, and the continuous updates show a commitment to excellence. Highly recommend for any team looking to elevate their workflow.",
    author: "Sophie Dubois",
    title: "Marketing Director, Visionary Inc.",
    avatarInitials: "SD",
    avatarBgColor: "bg-cyan-500",
    stars: 5,
  },
  {
    quote: "From planning to execution, everything is smoother. My team actually enjoys using it, which is half the battle won!",
    author: "Chris Evans",
    title: "Team Lead, AgileWorks",
    avatarInitials: "CE",
    avatarBgColor: "bg-red-500",
    stars: 5,
  },
];

// Reusable SVG components for the stars
const FullStar = () => (
  <IoStar class="text-yellow-500" />

);

const EmptyStar = () => (
  <IoStar />
);


const Testimonials: Component = () => {
  let sectionRef: HTMLDivElement | undefined;
  let titleRef: HTMLHeadingElement | undefined;
  const cardRefs: (HTMLDivElement | undefined)[] = [];

  onMount(() => {
    if (!sectionRef || !titleRef || cardRefs.some(ref => !ref)) {
      console.warn("Testimonials: Missing one or more refs for animation.");
      return;
    }

    gsap.set(titleRef, { opacity: 0, y: 50 });
    gsap.set(cardRefs, { opacity: 0, y: 50 });

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
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.15,
      }, "<0.2");
  });

  const renderStars = (count: number) => {
    switch (count) {
      case 1:
        return <><FullStar /><EmptyStar /><EmptyStar /><EmptyStar /><EmptyStar /></>;
      case 2:
        return <><FullStar /><FullStar /><EmptyStar /><EmptyStar /><EmptyStar /></>;
      case 3:
        return <><FullStar /><FullStar /><FullStar /><EmptyStar /><EmptyStar /></>;
      case 4:
        return <><FullStar /><FullStar /><FullStar /><FullStar /><EmptyStar /></>;
      case 5:
        return <><FullStar /><FullStar /><FullStar /><FullStar /><FullStar /></>;
      default: // Handles 0 or invalid numbers
        return <><EmptyStar /><EmptyStar /><EmptyStar /><EmptyStar /><EmptyStar /></>;
    }
  };

  return (
    <section ref={sectionRef} class="bg-slate-950 py-20 md:py-28 px-4">
      <div class="max-w-7xl mx-auto text-white">
        <h2 ref={titleRef} class="text-center text-4xl md:text-5xl font-extrabold mb-16 text-slate-50">
          What Our <span class="text-green-500">Users Say</span>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <For each={testimonialsData}>
            {(testimonial, i) => (
              <div
                key={i()}
                ref={el => (cardRefs[i()] = el)}
                class="flex flex-col p-6 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1"
              >
                <div class="flex items-center mb-4">
                  <div class={`w-12 h-12 ${testimonial.avatarBgColor} rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0 mr-4`}>
                    {testimonial.avatarInitials}
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-slate-50">{testimonial.author}</h3>
                    <p class="text-slate-400 text-sm">{testimonial.title}</p>
                  </div>
                </div>
                <div class="flex items-center gap-x-1 mb-4">
                  {renderStars(testimonial.stars)}
                </div>
                <p class="text-slate-300 italic flex-1 mb-4">"{testimonial.quote}"</p>
              </div>
            )}
          </For>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
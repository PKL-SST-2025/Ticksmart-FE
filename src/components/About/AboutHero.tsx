// src/components/about/AboutHero.tsx
import { Component, onMount, For } from "solid-js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger"; // Not strictly needed for hero, but good to include if common
import { SplitText } from "gsap/all"; // NOTE: SplitText is a GSAP Club plugin.
                                    // If you don't have a Club license,
                                    // you'll need to manually split text or use a different animation.
                                    // I'll provide a fallback for non-Club users too.

// Register plugins
gsap.registerPlugin(ScrollTrigger);
// If you have SplitText, register it:
// gsap.registerPlugin(SplitText);


const AboutHero: Component = () => {
  let titleRef: HTMLHeadingElement | undefined;
  let subtitleRef: HTMLParagraphElement | undefined;

  // Manual word splitting fallback if SplitText is not available/desired
  const splitWords = (text: string) => {
    return text.split(' ').map(word => word === "" ? "" : `<span>${word} </span>`).join('');
  };

  onMount(() => {
    if (!titleRef || !subtitleRef) {
      console.warn("AboutHero: Missing refs for animation.");
      return;
    }

    // Prepare for word-by-word animation
    // If SplitText is available (GSAP Club):
    if (typeof SplitText !== 'undefined') {
        const splitTitle = new SplitText(titleRef, { type: "words" });
        gsap.set(splitTitle.words, { opacity: 0, y: 30 }); // Initial state for words
        gsap.set(subtitleRef, { opacity: 0, y: 30 }); // Initial state for subtitle

        const tl = gsap.timeline();
        tl.to(splitTitle.words, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.05,
            delay: 0.3,
        })
        .to(subtitleRef, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
        }, "<0.3"); // Start subtitle 0.3 seconds after words begin animating
    } else {
        // Fallback for non-GSAP Club users (or if SplitText isn't preferred)
        // Animates entire title and subtitle
        titleRef.innerHTML = splitWords(titleRef.innerText); // Apply word spans for the text
        const words = titleRef.querySelectorAll('span'); // Select the spans
        gsap.set(words, { opacity: 0, y: 30 });
        gsap.set(subtitleRef, { opacity: 0, y: 30 });

        const tl = gsap.timeline();
        tl.to(words, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.05,
            delay: 0.3,
        })
        .to(subtitleRef, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
        }, "<0.3");
    }
  });

  return (
    <section class="relative bg-slate-950 text-white flex items-center justify-center min-h-[75vh] py-20 overflow-hidden">
      {/* Background blobs / particles for unique touch */}
      <div class="absolute inset-0 z-0 opacity-20">
        <div class="absolute w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob top-1/4 left-1/4"></div>
        <div class="absolute w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 top-1/2 left-1/2"></div>
        <div class="absolute w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 bottom-1/4 right-1/4"></div>
      </div>

      <div class="relative z-10 max-w-4xl mx-auto text-center px-4">
        <h1 ref={titleRef} class="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
          Crafting the Future of Collaboration, One Team at a Time.
        </h1>
        <p ref={subtitleRef} class="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
          We believe in empowering teams to achieve more with a platform designed for clarity, efficiency, and seamless connection.
        </p>
      </div>

      {/* Tailwind CSS keyframes for blob animation (add this to your main CSS file or a global style tag) */}
      <style>
        {`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        `}
      </style>
    </section>
  );
};

export default AboutHero;
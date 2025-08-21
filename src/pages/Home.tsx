import { Component, onMount } from "solid-js";
import MainLayout from "../layouts/MainLayout";
import gsap from 'gsap'; // Import GSAP

import HeroIllustration from '../components/HeroIllustration';
import ProjectTracker from "../components/ProjectTracker";
import FeatureShowcase from "../components/FeatureShowcase";
import WhyChooseUs from "../components/WhyChooseUs";
import HowItWorks from "../components/HowItWorks";
import Testimonials from "../components/Testimonials";
import EndCallToAction from "../components/EndCallToAction";

// A simple Home component to demonstrate routing
const Home: Component = () => {
  return (
    <MainLayout>
      {/* Your existing Hero section */}
      <div class="flex flex-col  lg:flex-row items-center justify-center min-h-[75vh] py-16 px-4 mx-auto max-w-screen-2xl lg:py-24 gap-8 ">
        {/* The Hero component will take full width on small screens, 2/3 on large */}
        <Hero />
        {/* The HeroIllustration will take full width on small screens, 1/3 on large */}
        <div class="lg:w-1/3 h-98 flex justify-center items-center">
            <HeroIllustration  />
        </div>
      </div>


      {/* ADD THE NEW FEATURE SHOWCASE COMPONENT HERE */}
      <FeatureShowcase />
      <WhyChooseUs /> 
      <HowItWorks />
      <Testimonials />
      <EndCallToAction /> 
      {/* A small spacer at the end to ensure the ScrollTrigger can fully complete and reset */}
      <div class="h-40 bg-slate-950"></div>
    </MainLayout>
  );
};

const Hero: Component = () => {
  let heroTitleRef: HTMLHeadingElement | undefined;
  let heroParagraphRef: HTMLParagraphElement | undefined;
  let heroButtonRef: HTMLAnchorElement | undefined;

  onMount(() => {
    // Animate the hero section elements
    gsap.from([heroTitleRef, heroParagraphRef, heroButtonRef], {
      y: 50, // Start 50px below
      opacity: 0, // Start invisible
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.2, // Stagger the animation of each element
      delay: 0.3, // Delay the start of the animation slightly
    });
  });

  return (
    <section class="bg-white dark:bg-gray-900  flex items-center justify-between">
      <div class="max-w-3xl">
        <h1
          ref={heroTitleRef}
          class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white"
        >
          Design your<br />perfect workflow
        </h1>
        <p
          ref={heroParagraphRef}
          class="mb-8 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-200"
        >
          A flexible and powerful space where your team can plan, build, and ship projects faster.
        </p>
        <a
          ref={heroButtonRef}
          href="#"
          class="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
        >
          Getting Started
        </a>
      </div>

    </section>
  );
};

export default Home;

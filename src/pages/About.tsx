// src/pages/About.tsx
import { Component, onMount } from "solid-js";
import MainLayout from "../layouts/MainLayout"; // Assuming you have this layout
import AboutHero from "../components/About/AboutHero";
import ValuesSection from "../components/About/ValuesSection";
import CallToActionAbout from "../components/About/CallToActionAbout";

const About: Component = () => {
  // We don't need direct GSAP onMount here, as sections handle their own animations.
  // The MainLayout provides the global structure.
  return (
    <MainLayout>
      <AboutHero />
      <ValuesSection />
      <CallToActionAbout />
    </MainLayout>
  );
};

export default About;
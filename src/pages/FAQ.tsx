// src/pages/FAQ.tsx
import { Component } from "solid-js";
import MainLayout from "../layouts/MainLayout";
import FAQSection from "../components/Faq/FAQSection"; // Import the section component

const FAQ: Component = () => {
  return (
    <MainLayout>
      <FAQSection />
    </MainLayout>
  );
};

export default FAQ;
// src/components/faq/FAQSection.tsx
import { Component, onMount, For } from "solid-js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FAQAccordion from "./FAQAccordion"; // Import the individual accordion component

gsap.registerPlugin(ScrollTrigger);

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is Collabspark?",
    answer: "Collabspark is a comprehensive collaboration and project management platform designed to help teams plan, build, and ship projects faster. It offers tools for task tracking, communication, and visual progress monitoring.",
  },
  {
    question: "How does Collabspark help improve team productivity?",
    answer: "Collabspark streamlines workflows, reduces communication overhead, and provides real-time visibility into project status. Features like task automation and centralized information access allow your team to focus on core tasks, boosting overall efficiency.",
  },
  {
    question: "Is Collabspark free to use?",
    answer: "Collabspark offers a robust free tier for individuals and small teams, allowing you to experience our core features. For advanced capabilities, increased storage, and premium support, we offer flexible paid plans. Visit our pricing page for more details!",
  },
  {
    question: "What kind of teams can benefit from Collabspark?",
    answer: "Collabspark is designed for teams of all sizes and industries. Whether you're a small startup, a growing mid-sized business, or a large enterprise, our customizable features and scalable architecture can adapt to your unique workflow needs.",
  },
  {
    question: "What devices does Collabspark support?",
    answer: "Collabspark is accessible directly through any modern web browser. We also offer dedicated desktop applications for Mac and Windows, as well as mobile apps for iOS and Android, ensuring you can manage your projects from anywhere.",
  },
  {
    question: "How is my data secured with Collabspark?",
    answer: "We prioritize the security of your data with industry-standard encryption, regular security audits, and strict access controls. Your information is protected through robust technical and organizational measures.",
  },
  {
    question: "Can I customize my workflow and boards?",
    answer: "Absolutely! Collabspark provides extensive customization options. You can create custom boards, define unique statuses, add various column types, and set up automations to match your team's specific processes perfectly.",
  },
  {
    question: "Do you offer customer support?",
    answer: "Yes, we offer comprehensive customer support to ensure your success with Collabspark. Our support team is available via email and live chat during business hours for all users. Premium plan users receive dedicated priority support.",
  },
];

const FAQSection: Component = () => {
  let sectionRef: HTMLDivElement | undefined;
  let titleRef: HTMLHeadingElement | undefined;
  let introRef: HTMLParagraphElement | undefined;
  const accordionItemRefs: (HTMLDivElement | undefined)[] = []; // Refs for each accordion div

  onMount(() => {
    if (!sectionRef || !titleRef || !introRef || accordionItemRefs.some(ref => !ref)) {
      console.warn("FAQSection: Missing refs for animation.");
      return;
    }

    // Set initial states for animation
    gsap.set([titleRef, introRef], { opacity: 0, y: 50 });
    gsap.set(accordionItemRefs, { opacity: 0, y: 50 }); // Individual accordion items

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef,
        start: "top 75%", // Start animation when top of section is 75% down the viewport
        toggleActions: "play none none none", // Play once on scroll down
        // markers: true, // Uncomment for visual debugging
      },
    });

    tl.to(titleRef, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
      .to(introRef, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "<0.2")
      .to(accordionItemRefs, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.15, // Stagger the animation of each accordion item
      }, "<0.3");
  });

  return (
    <section ref={sectionRef} class="bg-slate-950 text-white py-20 md:py-28 px-4">
      <div class="max-w-4xl mx-auto">
        <h2 ref={titleRef} class="text-center text-4xl md:text-5xl font-extrabold mb-6 text-slate-50">
          Frequently Asked <span class="text-yellow-400">Questions</span>
        </h2>
        <p ref={introRef} class="text-lg text-slate-300 text-center mb-16 leading-relaxed">
          Find answers to the most common questions about our platform, features, pricing, and more.
        </p>

        <div class="space-y-4">
          <For each={faqData}>
            {(item, i) => (
              <div ref={el => (accordionItemRefs[i()] = el)}>
                <FAQAccordion question={item.question} answer={item.answer} />
              </div>
            )}
          </For>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
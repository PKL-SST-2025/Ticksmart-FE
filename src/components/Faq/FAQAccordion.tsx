// src/components/faq/FAQAccordion.tsx
import { Component, createSignal } from "solid-js";
import { FiPlus, FiMinus } from 'solid-icons/fi'; // Icons for accordion toggle

interface FAQAccordionProps {
  question: string;
  answer: string;
}

const FAQAccordion: Component<FAQAccordionProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  let contentRef: HTMLDivElement | undefined; // Ref for the collapsible content

  return (
    <div class="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-lg overflow-hidden">
      <button
        class="flex justify-between items-center w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
        onClick={() => setIsOpen(!isOpen())}
        aria-expanded={isOpen()}
        aria-controls={`faq-content-${props.question.replace(/\s/g, '-')}`} // Unique ID for accessibility
      >
        <span class="font-semibold text-lg text-slate-50">{props.question}</span>
        {isOpen() ? (
          <FiMinus class="w-6 h-6 text-blue-400 flex-shrink-0 ml-4" />
        ) : (
          <FiPlus class="w-6 h-6 text-gray-400 flex-shrink-0 ml-4" />
        )}
      </button>
      <div
        id={`faq-content-${props.question.replace(/\s/g, '-')}`} // Corresponding ID
        ref={contentRef}
        class="transition-[max-height] duration-500 ease-in-out overflow-hidden"
        style={{ 'max-height': isOpen() ? (contentRef?.scrollHeight || 0) + "px" : "0px" }}
      >
        <div class="px-6 py-6 text-gray-300 text-sm lg:font-md font-medium leading-relaxed">
          {props.answer}
        </div>
      </div>
    </div>
  );
};

export default FAQAccordion;
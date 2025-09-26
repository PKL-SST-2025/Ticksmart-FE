import type noUiSlider from "nouislider";
import type { IStaticMethods } from "preline/dist";

declare global {
  interface Window {
    // Optional third-party libraries
    _: typeof import("lodash");
    noUiSlider: typeof noUiSlider;

    // Preline UI
    HSStaticMethods: IStaticMethods;
  }
}

// Add this to the top of your .tsx file
declare global {
  interface Window {
    HSStepper: any; // Using 'any' is quick, or you can define the interface below
  }
}

// Optional: A more specific type definition
interface IHSStepper {
  new(element: HTMLElement, options?: any): IHSStepper;
  nextStep(): void;
  prevStep(): void;
  goToStep(step: number): void;
  destroy(): void;
}

export {};


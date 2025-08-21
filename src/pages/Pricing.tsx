// src/pages/Pricing.tsx
import { Component, For } from "solid-js";
import MainLayout from "../layouts/MainLayout";
import { FiCheck } from "solid-icons/fi"; // Checkmark icon

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;

  price: string;
  frequency: string;
  description: string;
  features: PlanFeature[];
  buttonText: string;
  buttonHref: string;
  isFeatured?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    frequency: "forever",
    description: "For individuals and small teams just getting started.",
    features: [
      { text: "Up to 3 projects", included: true },
      { text: "Basic collaboration tools", included: true },
      { text: "Community support", included: true },
      { text: "Advanced analytics", included: false },
    ],
    buttonText: "Start for free",
    buttonHref: "#",
  },
  {
    name: "Pro",
    price: "$10",
    frequency: "/ user / month",
    description: "For growing teams that need more power and support.",
    features: [
      { text: "Unlimited projects", included: true },
      { text: "Advanced collaboration tools", included: true },
      { text: "Priority support", included: true },
      { text: "Advanced analytics", included: true },
    ],
    buttonText: "Choose Pro",
    buttonHref: "#",
    isFeatured: true, // This will highlight the plan
  },
  {
    name: "Enterprise",
    price: "Custom",
    frequency: "",
    description: "For large organizations requiring advanced security and control.",
    features: [
      { text: "Everything in Pro, plus:", included: true },
      { text: "Enterprise-grade security (SSO)", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom onboarding & training", included: true },
    ],
    buttonText: "Contact Sales",
    buttonHref: "#",
  },
];


const Pricing: Component = () => {
  return (
    <MainLayout>
      <div class="bg-slate-950 text-white min-h-screen py-16 px-4">
        {/* Header */}
        <div class="max-w-4xl mx-auto text-center mb-16">
          <h1 class="text-5xl md:text-6xl font-extrabold text-slate-50 mb-6">
            Choose the plan that's right for you
          </h1>
          <p class="text-lg text-slate-300">
            Simple, transparent pricing. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <For each={pricingPlans}>
            {(plan) => (
              <div
                class="flex flex-col h-full p-8 rounded-2xl bg-slate-900/50 backdrop-blur-md border transition-all duration-300"
                classList={{
                  "border-blue-500 shadow-xl shadow-blue-500/10": plan.isFeatured,
                  "border-slate-800": !plan.isFeatured,
                }}
              >
                {plan.isFeatured && (
                  <div class="text-center mb-4">
                    <span class="inline-flex items-center rounded-full bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-400">
                      Most Popular
                    </span>
                  </div>
                )}
                <h2 class="text-2xl font-bold text-center text-slate-50">{plan.name}</h2>
                <p class="text-center text-slate-400 mt-2 mb-6">{plan.description}</p>

                <div class="text-center mb-8">
                  <span class="text-5xl font-extrabold text-slate-50">{plan.price}</span>
                  {plan.frequency && <span class="text-slate-400 ml-1">{plan.frequency}</span>}
                </div>

                <ul class="space-y-4 mb-8 flex-1">
                  <For each={plan.features}>
                    {(feature) => (
                      <li class="flex items-start">
                        <FiCheck
                          class="w-5 h-5 mt-1 flex-shrink-0"
                          classList={{
                            "text-green-400": feature.included,
                            "text-slate-600": !feature.included,
                          }}
                        />
                        <span
                          class="ml-3"
                          classList={{
                            "text-slate-300": feature.included,
                            "text-slate-500 line-through": !feature.included,
                          }}
                        >
                          {feature.text}
                        </span>
                      </li>
                    )}
                  </For>
                </ul>

                <a
                  href={plan.buttonHref}
                  class="w-full inline-flex items-center justify-center px-6 py-3 text-lg font-semibold text-center rounded-lg transition-colors duration-200"
                  classList={{
                    "text-white bg-blue-600 hover:bg-blue-700": plan.isFeatured,
                    "text-blue-400 bg-slate-800 hover:bg-slate-700": !plan.isFeatured,
                  }}
                >
                  {plan.buttonText}
                </a>
              </div>
            )}
          </For>
        </div>

      </div>
    </MainLayout>
  );
};

export default Pricing;
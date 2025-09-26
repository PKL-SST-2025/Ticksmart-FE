import { Component, createSignal, For } from "solid-js";
import DashboardLayout from "../../../layouts/DashboardLayout";
import StripeEmbeddedCard from "../../../components/StripeConnectComponent";

const intervalOptions = ["day", "month", "quarter", "year"] as const;
type IntervalType = typeof intervalOptions[number];

const OrganizerDashbaord: Component = () => {
  const [theme, setTheme] = createSignal<"light" | "dark">("light");
  const toggleTheme = () => setTheme(theme() === "light" ? "dark" : "light");

  const [reportInterval, setReportInterval] = createSignal<IntervalType>("day");

  return (
    <DashboardLayout>
      <div class="p-4 lg:p-8 w-full max-w-screen-2xl mx-auto">
        {/* --- Page Header --- */}
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">
            Financial Dashboard
          </h1>
          <p class="mt-1 text-neutral-500 dark:text-neutral-400">
            View your balances, payouts, and transactions, powered by Stripe.
          </p>
        </div>

        {/* --- Stripe Components Stacked --- */}
        <div class="space-y-8">
          <StripeEmbeddedCard title="Balances & Payouts" componentName="balances" />
          <StripeEmbeddedCard title="Recent Payments" componentName="payments" />
          <StripeEmbeddedCard title="Payouts" componentName="payouts" />
          <StripeEmbeddedCard title="Payment Details" componentName="payment_details" />

        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrganizerDashbaord;

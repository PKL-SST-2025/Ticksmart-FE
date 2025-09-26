import { createEffect, onCleanup, onMount, createSignal } from "solid-js";
import ApexCharts from "apexcharts";
import type { ApexOptions } from "apexcharts";

// Define the types for our data
// --- (Your DUMMY_DATA and types remain the same) ---
type TimeRange = "7d" | "30d" | "12m";
interface ChartData {
  label: string;
  series: { data: number[] }[];
  categories: string[];
}
const DUMMY_DATA: Record<TimeRange, ChartData> = {
  "7d": { label: "Last 7 Days", series: [{ name: "Profits", data: [31, 40, 28, 51, 42, 109, 100] }], categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  "30d": { label: "Last 30 Days", series: [{ name: "Profits", data: [76, 85, 101, 98, 87, 105, 91, 114, 94, 86, 115, 120, 110, 103, 99, 88, 79, 92, 108, 112, 118, 104, 95, 89, 102, 111, 122, 125, 119, 113] }], categories: Array.from({ length: 30 }, (_, i) => `${i + 1}`) },
  "12m": { label: "Last 12 Months", series: [{ name: "Profits", data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380, 1450, 1500] }], categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] },
};

interface TicketSalesChartProps {
  theme: "light" | "dark";
}

export function TicketProfitChart(props: TicketSalesChartProps) {
  let chartContainer: HTMLDivElement;
  let chart: ApexCharts | null = null;
  const [timeRange, setTimeRange] = createSignal<TimeRange>("7d");

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 250,
      // FIX #1: This makes the chart responsive on initial render.
      width: "100%",
      toolbar: { show: false },
      background: "transparent",
    },
    stroke: { curve: "smooth", width: 2 },
    colors: ["#34D399"],
    dataLabels: { enabled: false },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.8, opacityTo: 0.5, stops: [0, 90, 100] },
    },
    xaxis: { axisBorder: { show: false }, axisTicks: { show: false } },
    series: [],
  };

  onMount(() => {
    chart = new ApexCharts(chartContainer, options);
    chart.render();

    // Effect to update chart theme
    createEffect(() => {
      chart?.updateOptions({
        chart: { foreColor: props.theme === "dark" ? "#E5E7EB" : "#374151" },
        tooltip: { theme: props.theme },
        grid: {
          borderColor: props.theme === 'dark' ? 'rgba(55, 65, 81, 0.4)' : 'rgba(229, 231, 235, 0.6)',
          strokeDashArray: 4,
        },
      });
    });
    
    // Effect to update chart data
    createEffect(() => {
        const newData = DUMMY_DATA[timeRange()];
        chart?.updateOptions({
            series: newData.series,
            xaxis: { categories: newData.categories }
        });
    });

    // This observer handles resizing when the sidebar is toggled
    const resizeObserver = new ResizeObserver(() => {
      chart?.updateOptions({});
    });
    resizeObserver.observe(chartContainer);

    // ========================================================================
    // THE FIX: Wait for Preline's layout animation/setup to complete,
    // then tell the chart to resize itself to fit the final, correct container size.
    // ========================================================================
    const initialResizeTimeout = setTimeout(() => {
      chart?.render();
    }, 2000); 

    onCleanup(() => {
      clearTimeout(initialResizeTimeout); // Clean up the timeout
      chart?.destroy();
      resizeObserver.disconnect();
    });
  });

  // Helper for styling the selector buttons
  const buttonClass = (range: TimeRange) => {
    const base = "px-3 py-1 text-sm font-medium rounded-md transition-colors";
    if (range === timeRange()) {
      return `${base} bg-white text-gray-800 shadow-sm dark:bg-gray-700 dark:text-white`;
    }
    return `${base} text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700`;
  };

  return (
    <div class="p-4 bg-white overflow-hidden outline-1 dark:text-neutral-600 w-full rounded-lg  shadow dark:bg-neutral-900">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 class="text-lg font-semibold  text-gray-800 dark:text-white">Ticket Profits</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">{DUMMY_DATA[timeRange()].label}</p>
        </div>
        <div class="flex p-1 space-x-1 bg-gray-100 rounded-lg dark:bg-gray-800">
          <button class={buttonClass("7d")} onClick={() => setTimeRange("7d")}>7 Days</button>
          <button class={buttonClass("30d")} onClick={() => setTimeRange("30d")}>30 Days</button>
          <button class={buttonClass("12m")} onClick={() => setTimeRange("12m")}>12 Months</button>
        </div>
      </div>
      <div ref={chartContainer} />
    </div>
  );
}
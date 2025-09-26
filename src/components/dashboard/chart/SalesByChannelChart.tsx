import { Component, onMount, onCleanup, createEffect, createMemo } from "solid-js";
import ApexCharts from "apexcharts";
import type { ApexOptions } from "apexcharts";

// Define props for theme switching
interface SalesByChannelChartProps {
  theme: "light" | "dark";
}

export const SalesByChannelChart: Component<SalesByChannelChartProps> = (props) => {
  let chartContainer: HTMLDivElement;
  let chart: ApexCharts | null = null;

  // Use a createMemo to make the options object reactive to the theme prop.
  const chartOptions = createMemo<ApexOptions>(() => {
    // Determine text colors based on the current theme
    const textColor = props.theme === 'dark' ? '#E5E7EB' : '#374151'; // gray-200 or gray-700
    const secondaryTextColor = props.theme === 'dark' ? '#9CA3AF' : '#6B7280'; // gray-400 or gray-500

    return {
      chart: {
        type: 'donut',
        height: 300,
        // THE FIX: Explicitly set the background to transparent.
        background: 'transparent',
      },
      series: [440, 550, 130, 330], // Sample data representing ticket counts
      labels: ['Direct', 'Social Media', 'Affiliates', 'Email Marketing'],
      
      // Modern, professional color palette
      colors: ['#3b82f6', '#10b981', '#f97316', '#8b5cf6'],

      // Remove default data labels from slices for a cleaner look
      dataLabels: {
        enabled: false,
      },

      // Configure the central donut label
      plotOptions: {
        pie: {
          donut: {
            // THE FIX: No background on the donut itself
            background: 'transparent',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total Sales',
                color: secondaryTextColor, // Reactive color
                formatter: (w) => {
                  // Sum up all series values for a dynamic total
                  const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                  return total.toLocaleString();
                }
              }
            },
            value: {
                color: textColor, // Reactive color
                fontSize: '22px',
                fontWeight: 600,
            }
          }
        }
      },
      
      // Configure the legend at the bottom
      legend: {
        position: 'bottom',
        fontFamily: 'inherit',
        markers: {
          width: 8,
          height: 8,
          radius: 8,
        },
        itemMargin: {
          horizontal: 10,
        },
        labels: {
          colors: secondaryTextColor, // Reactive color
        },
      },
      
      // Customize the tooltip for a better hover experience
      tooltip: {
        theme: props.theme, // Built-in theme support
        y: {
          formatter: (val) => `${val.toLocaleString()} tickets`, // Add context to the value
        },
        style: {
          fontFamily: 'inherit',
        }
      },

      // Add a subtle effect on hover
      states: {
        hover: {
          filter: {
            type: 'lighten',
            value: 0.05
          }
        },
        active: {
            filter: {
                type: 'none',
            }
        }
      },
      
      // THE FIX: Explicitly remove any stroke/outline on the pie slices
      stroke: {
        show: false,
      },
    };
  });


  // onMount handles the initial chart creation
  onMount(() => {
    if (chartContainer) {
      chart = new ApexCharts(chartContainer, chartOptions());
      chart.render();
    }
  });

  // createEffect handles updates, like theme changes
  createEffect(() => {
    // The chart?.updateOptions() method smoothly transitions changes
    chart?.updateOptions(chartOptions());
  });

  // onCleanup destroys the chart instance to prevent memory leaks
  onCleanup(() => {
    chart?.destroy();
  });

  return (
    <div class="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700">
      <div class="p-4 md:p-5">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white">
          Sales by Channel
        </h3>
        <div ref={chartContainer} class="mt-4"></div>
      </div>
    </div>
  );
};
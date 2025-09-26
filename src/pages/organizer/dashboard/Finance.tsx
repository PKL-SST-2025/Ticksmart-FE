import type { Component } from 'solid-js';
import { createSignal, onMount, For, Show, onCleanup } from 'solid-js';
import DashboardLayout from '../../../layouts/DashboardLayout';
import {  SolidApexCharts } from 'solid-apexcharts';
import Table, { type Column } from '../../../components/table/Table'; // Your reusable table

// Importing high-quality icons
import { 
  AiOutlineDollar, 
  AiOutlineLineChart,
  AiOutlineBank,
  AiOutlineArrowUp,
  AiOutlineArrowDown
} from 'solid-icons/ai';

// --- Type Definitions ---
type Transaction = {
  id: string;
  type: 'sale' | 'payout' | 'refund';
  date: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
};

// --- Mock Data (to be replaced by API calls) ---
const mockTransactions: Transaction[] = [
  { id: 'TRN-001', type: 'sale', date: '2025-09-15', description: 'Order #TKS-001 (Bruno Mars)', amount: 1750000, status: 'completed' },
  { id: 'PAY-001', type: 'payout', date: '2025-09-14', description: 'Weekly Payout', amount: -5230000, status: 'completed' },
  { id: 'TRN-002', type: 'sale', date: '2025-09-12', description: 'Order #TKS-003 (Tulus)', amount: 930000, status: 'completed' },
  { id: 'TRN-003', type: 'refund', date: '2025-09-11', description: 'Refund for Order #TKS-004', amount: -450000, status: 'completed' },
  { id: 'TRN-004', type: 'sale', date: '2025-09-10', description: 'Order #TKS-002 (Raisa)', amount: 290000, status: 'completed' },
  { id: 'PAY-002', type: 'payout', date: '2025-09-21', description: 'Next Payout', amount: -2500000, status: 'pending' },
];

const salesData = {
  series: [{ name: 'Sales', data: [3100, 4000, 2800, 5100, 4200, 10900, 10000, 8000, 9200, 6300, 7100, 8400] }],
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};

// --- Helper Functions and Components ---
const formatPrice = (price: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

const StatCard: Component<{ title: string; value: string; icon: Component }> = (props) => (
  <div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-5 rounded-xl">
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-lg flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50">
        <props.icon class="size-6 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">{props.title}</p>
        <p class="text-2xl font-bold text-neutral-800 dark:text-neutral-200">{props.value}</p>
      </div>
    </div>
  </div>
);

const TransactionTypeBadge: Component<{ type: Transaction['type'] }> = (props) => {
  const isPositive = props.type === 'sale';
  return (
    <span class={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${
      isPositive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
      : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
    }`}>
      {isPositive ? <AiOutlineArrowUp/> : <AiOutlineArrowDown/>}
      {props.type.charAt(0).toUpperCase() + props.type.slice(1)}
    </span>
  );
};

// --- Main Page Component ---
const OrganizerFinancePage: Component = () => {
  // We need to store the chart options in a signal to handle theme changes
  const [chartOptions, setChartOptions] = createSignal({});

  // This effect updates the chart's theme when the document's theme changes
  onMount(() => {
    const updateTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setChartOptions({
        chart: { type: 'area', height: 350, toolbar: { show: false }, background: 'transparent' },
        xaxis: { categories: salesData.categories, labels: { style: { colors: isDarkMode ? '#A3A3A3' : '#737373' } } },
        yaxis: { labels: { style: { colors: isDarkMode ? '#A3A3A3' : '#737373' } } },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#4f46e5'], // Indigo
        fill: { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.05 } },
        grid: { borderColor: isDarkMode ? '#404040' : '#E5E7EB', strokeDashArray: 4 },
        tooltip: { theme: isDarkMode ? 'dark' : 'light' },
      });
    };
    
    // Use a MutationObserver to watch for changes to the <html> class attribute
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    updateTheme(); // Run once on mount

    onCleanup(() => observer.disconnect());
  });
  
  const transactionColumns: Column<Transaction>[] = [
    { header: 'Type', accessor: 'type', cell: (item) => <TransactionTypeBadge type={item.type} /> },
    { header: 'Description', accessor: 'description' },
    { header: 'Date', accessor: 'date', cell: (item) => new Date(item.date).toLocaleDateString() },
    { header: 'Amount', accessor: 'amount', cell: (item) => <span class={item.amount > 0 ? 'text-green-600' : 'text-red-600'}>{formatPrice(item.amount)}</span> },
    { header: 'Status', accessor: 'status' },
  ];

  return (
    <DashboardLayout>
      <div class="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Financial Overview</h1>
          <p class="mt-1 text-neutral-500 dark:text-neutral-400">Track your sales, revenue, and payouts.</p>
        </div>

        {/* --- Stats Grid --- */}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard title="Gross Sales" value={formatPrice(12850000)} icon={AiOutlineLineChart} />
          <StatCard title="Net Revenue" value={formatPrice(11565000)} icon={AiOutlineDollar} />
          <StatCard title="Next Payout" value={formatPrice(2500000)} icon={AiOutlineBank} />
        </div>

        {/* --- Sales Chart --- */}
        <div class="mb-8 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Sales Trend</h2>
          <Show when={Object.keys(chartOptions()).length > 0}>
            <SolidApexCharts width="100%" height="350px" type="area" options={chartOptions()} series={salesData.series} />
          </Show>
        </div>

        {/* --- Transactions Table --- */}
        <div>
           <h2 class="text-2xl font-bold mb-4 text-neutral-800 dark:text-neutral-200">Recent Transactions</h2>
           <Table data={mockTransactions} columns={transactionColumns} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrganizerFinancePage;
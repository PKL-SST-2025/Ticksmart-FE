import { Component, createSignal } from "solid-js";
import UserDashboardLayout from "../../../layouts/DashboardLayout";
import { RedeemableBalance } from "../../../components/dashboard/balance/RedeemableBalance";
import { UnRedeemableBalance } from "../../../components/dashboard/balance/UnRedeemableBalance";
import { RedBalance } from "../../../components/dashboard/balance/RedBalance";
import { TicketSalesChart } from "../../../components/dashboard/chart/TicketSalesChart";
import { TicketProfitChart } from "../../../components/dashboard/chart/TicketProfitChart";
import { StatCards } from "../../../components/dashboard/chart/StatCards";
import { TopEventsTable } from "../../../components/dashboard/chart/TopEventsTable";
import { SalesByChannelChart } from "../../../components/dashboard/chart/SalesByChannelChart";
import { ActivityFeed } from "../../../components/dashboard/chart/ActivityFeed";
import DashboardLayout from "../../../layouts/DashboardLayout";

const AdminDashboard: Component = () => {
    // This theme toggle logic is here if you need it.
    const [theme, setTheme] = createSignal<"light" | "dark">("light");
    const toggleTheme = () => {
        setTheme(theme() === "light" ? "dark" : "light");
    };

    return (
        <DashboardLayout>
            {/* 
              - Use responsive padding (p-4 on small, p-8 on large).
              - Use space-y-8 to create consistent vertical gaps between sections.
            */}
            <div class="p-4 lg:p-8 space-y-8">
                
                {/* 
                  SECTION 1: Balance Cards
                  - On small screens (mobile), it's a 1-column grid (grid-cols-1).
                  - On medium screens (tablet), it becomes a 2-column grid (sm:grid-cols-2).
                  - On large screens (desktop), it becomes a 3-column grid (lg:grid-cols-3).
                  - The 'gap-8' creates space between the cards.
                */}
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <RedeemableBalance />
                    <UnRedeemableBalance />
                    <RedBalance />
                </div>

                <StatCards />

                {/* 
                  SECTION 2: Charts
                  - On small/medium screens, it's a 1-column grid.
                  - On large screens, it becomes a 2-column grid (lg:grid-cols-2).
                  - This prevents the charts from being squished when the sidebar appears.
                */}
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <TicketSalesChart theme={theme()} />
                    <TicketProfitChart theme={theme()} />
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Table takes more space */}
                    <div class="lg:col-span-2">
                        <TopEventsTable />
                    </div>

                    {/* Side column for charts and feeds */}
                    <div class="space-y-6">
                        <SalesByChannelChart />
                        <ActivityFeed />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
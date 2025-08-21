// src/pages/Dashboard/Project.tsx
// (COMPLETE OVERHAUL)

import { Component, For, onMount, onCleanup, createSignal, createMemo, Show } from "solid-js";
import ProjectDashboardLayout from "../../../layouts/ProjectDashboardLayout";
import { TbCheck, TbList, TbHourglass, TbUserCheck, TbAlertTriangle, TbLoader } from 'solid-icons/tb';

// AMCharts Imports
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { sendRequest } from "../../../utils/SendRequest";
import { useAuth } from "../../../context/AuthContext";
import { useParams } from "@solidjs/router";

// --- API DATA STRUCTURES (What Rust sends) ---
type ApiTaskResponse = {
    id: number;
    title: string;
    description: string | null;
    status: 'ToDo' | 'InProgress' | 'InReview' | 'Done';
    project_id: number;
    lead_assignee_id: number | null;
    contributor_ids: number[];
    required_role_ids: number[];
    sub_tasks: { id: number; description: string; is_completed: boolean; task_id: number; }[]; // Use backend's subtask structure
};

type ApiMemberResponse = {
    id: number;
    user_id: number;
    full_name: string;
    email: string; // From backend's enriched member response
    role_id: number | null;
    is_banned: boolean;
    is_owner: boolean;
};

// --- FRONTEND DATA STRUCTURES ---
type Member = { id: number; name: string; userId: number; };
type Task = {
    id: number;
    title: string;
    status: 'ToDo' | 'InProgress' | 'InReview' | 'Done';
    assignedToMemberId: number | null;
};


// --- NEW: WebSocket Message Structure ---
type WebSocketMessage = {
    type: "task_created" | "task_updated" | "task_unarchived" | "task_deleted" | "role_updated" | "member_updated" | string;
    data: any; // The payload can be different for each message type
};




// --- Chart & Utility Functions (Adjusted to use new Task/Member types) ---
const statusColor = (status: Task['status']) => {
    switch (status) {
        case "Done": return "bg-teal-400/10 text-teal-300 ring-teal-400/20";
        case "InProgress": return "bg-amber-400/10 text-amber-300 ring-amber-400/20";
        // Assuming "Stuck" is handled by "In Progress" or another status you define in backend
        case "ToDo": return "bg-gray-400/10 text-gray-300 ring-gray-400/20";
        case "InReview": return "bg-blue-400/10 text-blue-300 ring-blue-400/20";
        default: return "bg-gray-400/10 text-gray-300 ring-gray-400/20";
    }
}


// --- Reusable Chart Components ---

// 1. Progress Donut Chart
const ProgressChart: Component<{ progress: number }> = (props) => {
    let chartRef: HTMLDivElement | undefined;
    onMount(() => {
        let root = am5.Root.new(chartRef!);
        root.setThemes([am5themes_Animated.new(root)]);
        
        let chart = root.container.children.push(am5percent.PieChart.new(root, {
            innerRadius: am5.percent(75),
            startAngle: -90,
            endAngle: 270,
        }));

        let series = chart.series.push(am5percent.PieSeries.new(root, {
            valueField: "value",
            categoryField: "category",
            alignLabels: false,
        }));
        series.slices.template.setAll({
            stroke: am5.color(0x000000),
            strokeWidth: 2,
            tooltipText: "{category}: {value}%"
        });
        series.get("colors")?.set("colors", [am5.color(0x2563eb), am5.color(0x374151)]);
        series.labels.template.set("forceHidden", true);
        series.ticks.template.set("forceHidden", true);
        
        series.data.setAll([
            { value: props.progress, category: "Done" },
            { value: 100 - props.progress, category: "Remaining" }
        ]);

        let label = chart.seriesContainer.children.push(am5.Label.new(root, {
            text: `${props.progress}%`,
            centerX: am5.percent(50),
            centerY: am5.percent(50),
            fontSize: "1.75rem",
            fontWeight: "bold",
            fill: am5.color(0xffffff)
        }));

        onCleanup(() => root.dispose());
    });
    return <div ref={chartRef} style={{ width: "100%", height: "250px" }} />;
};

// 2. Member Activity Bar Chart
const ActivityChart: Component<{ data: { member: string, tasks: number }[] }> = (props) => {
    let chartRef: HTMLDivElement | undefined;
    onMount(() => {
        let root = am5.Root.new(chartRef!);
        root.setThemes([am5themes_Animated.new(root)]);
        
        let chart = root.container.children.push(am5xy.XYChart.new(root, {
            panX: false, panY: false, wheelX: "none", wheelY: "none"
        }));

        let yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
            categoryField: "member",
            renderer: am5xy.AxisRendererY.new(root, {
                inversed: true,
                cellStartLocation: 0.1,
                cellEndLocation: 0.9,
                minorGridEnabled: false,
            })
        }));
        yAxis.get("renderer").labels.template.setAll({ fill: am5.color(0xd1d5db), fontSize: "0.875rem" });
        yAxis.data.setAll(props.data);
        
        let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
            renderer: am5xy.AxisRendererX.new(root, {}),
            min: 0,
        }));
        xAxis.get("renderer").labels.template.setAll({ fill: am5.color(0x9ca3af) });

        let series = chart.series.push(am5xy.ColumnSeries.new(root, {
            name: "Series",
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: "tasks",
            categoryYField: "member",
            sequencedInterpolation: true,
            tooltip: am5.Tooltip.new(root, {
                pointerOrientation: "left",
                labelText: "{valueX} tasks completed"
            })
        }));
        series.columns.template.setAll({
            height: am5.percent(70),
            strokeOpacity: 0,
            fill: am5.color(0x2563eb)
        });
        series.data.setAll(props.data);
        
        onCleanup(() => root.dispose());
    });
    return <div ref={chartRef} style={{ width: "100%", height: "250px" }} />;
}


// --- Main Page Component ---
const ProjectPage: Component = () => {
    const params = useParams();
    const { user: authUser } = useAuth(); // Get current authenticated user
    
    // API Data State
    const [tasks, setTasks] = createSignal<Task[]>([]);
    const [members, setMembers] = createSignal<Member[]>([]);
    const [isLoading, setIsLoading] = createSignal(true);
    const [error, setError] = createSignal<string | null>(null);


    let ws: WebSocket | null = null; // WebSocket instance

       const mapApiTaskToFrontend = (apiTask: ApiTaskResponse): Task => ({
        id: apiTask.id,
        title: apiTask.title,
        status: apiTask.status,
        assignedToMemberId: apiTask.lead_assignee_id,
    });

    
    // --- Data Fetching ---
    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [tasksData, membersData] = await Promise.all([
                sendRequest<ApiTaskResponse[]>(`/projects/${params.project_id}/tasks`),
                sendRequest<ApiMemberResponse[]>(`/projects/${params.project_id}/members`),
            ]);

            // Map API responses to frontend-friendly types
            const mappedTasks: Task[] = tasksData.map(apiTask => ({
                id: apiTask.id,
                title: apiTask.title,
                status: apiTask.status,
                assignedToMemberId: apiTask.lead_assignee_id, // Directly use lead_assignee_id here
            }));

            const mappedMembers: Member[] = membersData.map(apiMember => ({
                id: apiMember.id,
                name: apiMember.full_name,
                userId: apiMember.user_id,
            }));

            setTasks(mappedTasks);
            setMembers(mappedMembers);

        } catch (err: any) {
            console.error("Error fetching dashboard data:", err);
            setError(err.message || "Failed to load dashboard data.");
        } finally {
            setIsLoading(false);
        }
    };


    onMount(() => {
        fetchDashboardData();

        // Establish WebSocket Connection
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/projects/${params.project_id}/ws`;

        console.log(`Project Dashboard connecting to WebSocket at ${wsUrl}`);
        ws = new WebSocket(wsUrl);

        ws.onopen = () => console.log(`WebSocket connected for project ${params.project_id}`);
        ws.onclose = () => console.log(`WebSocket disconnected for project ${params.project_id}`);
        ws.onerror = (err) => console.error("WebSocket error:", err);
        ws.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                console.log("Dashboard WebSocket message received:", message);

                if (message.type.startsWith("task_")) {
                    const taskData: ApiTaskResponse = message.data;
                    const mappedTask = mapApiTaskToFrontend(taskData);
                    
                    if (message.type === "task_created" || message.type === "task_unarchived") {
                        setTasks(prev => [...prev, mappedTask]);
                    } else if (message.type === "task_updated") {
                        setTasks(prev => prev.map(t => t.id === mappedTask.id ? mappedTask : t));
                    } else if (message.type === "task_deleted" || message.type === "task_archived") {
                        setTasks(prev => prev.filter(t => t.id !== taskData.id));
                    }
                }
            } catch (e) {
                console.error("Failed to parse WebSocket message on dashboard:", e);
            }
        };
    });

    onCleanup(() => {
        ws?.close();
    });

    // --- Calculate Statistics ---
    const totalTasks = createMemo(() => tasks().length);
    const doneTasks = createMemo(() => tasks().filter(t => t.status === 'Done').length);
    const tasksLeft = createMemo(() => totalTasks() - doneTasks());
    const progress = createMemo(() => totalTasks() > 0 ? Math.round((doneTasks() / totalTasks()) * 100) : 0);

    const memberActivityData = createMemo(() => {
        const activity: Record<number, number> = {};
        tasks().forEach(task => {
            if (task.status === "Done" && task.assignedToMemberId) {
                activity[task.assignedToMemberId] = (activity[task.assignedToMemberId] || 0) + 1;
            }
        });
        const sorted = Object.entries(activity).map(([memberId, tasksDone]) => ({ member: members().find(m => m.id === parseInt(memberId))?.name || `ID ${memberId}`, tasks: tasksDone })).sort((a, b) => b.tasks - a.tasks);
        return sorted;
    });

    const mostActiveMember = createMemo(() => memberActivityData()[0]?.member || 'N/A');

    const statCards = createMemo(() => [
        { title: "Overall Progress", value: `${progress()}%`, icon: TbCheck, color: "text-blue-400" },
        { title: "Completed Tasks", value: doneTasks(), icon: TbList, color: "text-teal-400" },
        { title: "Tasks Left", value: tasksLeft(), icon: TbHourglass, color: "text-amber-400" },
        { title: "Top Contributor", value: mostActiveMember(), icon: TbUserCheck, color: "text-pink-400" },
    ]);

    return (
        // Pass dynamic username and projectId from authUser/params
        
        <ProjectDashboardLayout username={authUser()?.email || ''} projectId={params.project_id} activePage="Dashboard">
            <Show when={!isLoading()} fallback={
                <div class="flex items-center justify-center h-full p-10">
                    <TbLoader class="w-10 h-10 animate-spin text-blue-500" />
                </div>
            }>
                <Show when={!error()} fallback={
                    <div class="p-4 bg-red-500/10 text-red-300 rounded-lg text-center">
                        <TbAlertTriangle class="w-8 h-8 mx-auto mb-2" />
                        <p>{error()}</p>
                    </div>
                }>
                    <div class="space-y-8">
                        {/* --- STATS HEADER --- */}
                        <div class="grid grid-cols-1 md-grid-cols-2 lg:grid-cols-4 gap-6">
                            <For each={statCards()}>{(card) =>
                                <div class="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 flex items-start justify-between">
                                    <div>
                                        <p class="text-sm font-medium text-gray-400">{card.title}</p>
                                        <p class="text-3xl font-bold text-white mt-1">{card.value}</p>
                                    </div>
                                    <div class={`bg-gray-900 p-3 rounded-lg ${card.color}`}>
                                        <card.icon size={24} />
                                    </div>
                                </div>
                            }</For>
                        </div>
                        
                        {/* --- CHARTS SECTION --- */}
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div class="lg:col-span-1 bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                                <h2 class="text-lg font-semibold text-white mb-4">Task Completion</h2>
                                <ProgressChart progress={progress()} />
                            </div>
                            <div class="lg:col-span-2 bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                                <h2 class="text-lg font-semibold text-white mb-4">Member Activity (Tasks Done)</h2>
                                <ActivityChart data={memberActivityData()} />
                            </div>
                        </div>

                        {/* --- IMPROVED TASKS TABLE --- */}
                        <div>
                            <h2 class="text-2xl font-bold text-white mb-4">All Project Tasks</h2>
                            <div class="bg-gray-800/50 rounded-xl border border-gray-700/50">
                                <table class="w-full text-left">
                                    <thead class="border-b border-gray-700/50">
                                        <tr>
                                            <th class="p-4 text-sm font-semibold text-gray-400">Task</th>
                                            <th class="p-4 text-sm font-semibold text-gray-400">Assigned To</th>
                                            <th class="p-4 text-sm font-semibold text-gray-400">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <For each={tasks()}>{(task) => {
                                            const assignedMember = members().find(m => m.id === task.assignedToMemberId);
                                            return (
                                                <tr class="border-t border-gray-700/50">
                                                    <td class="p-4 font-medium text-white">{task.title}</td>
                                                    <td class="p-4 text-gray-300">{assignedMember?.name || 'Unassigned'}</td>
                                                    <td class="p-4">
                                                        <span class={`inline-block px-3 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${statusColor(task.status)}`}>
                                                            {task.status === 'ToDo' ? 'To Do' : task.status === 'InProgress' ? 'In Progress' : task.status === 'InReview' ? 'In Review' : task.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        }}</For>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Show>
            </Show>
        </ProjectDashboardLayout>
    );
}

export default ProjectPage;
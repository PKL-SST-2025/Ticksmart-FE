import { Component, For, Show, createSignal, createEffect, createMemo, onMount, onCleanup } from "solid-js";
import { A, useLocation } from "@solidjs/router";
import {
    TbLayoutKanban, TbUsers, TbShieldCheck, TbArchive, TbSettings, TbArrowLeft, TbUserPlus, TbX,
    TbDashboard
} from 'solid-icons/tb';
import { sendRequest } from "../../../utils/SendRequest";

type NavItem = {
    icon: Component;
    label: string;
    path: string;
};

const navItems: NavItem[] = [
    { icon: TbDashboard, label: "Dashboard", path: "" },
    { icon: TbLayoutKanban, label: "Tasks", path: "tasks" },
    { icon: TbUsers, label: "Members", path: "members" },
    { icon: TbShieldCheck, label: "Roles", path: "roles" },
    { icon: TbArchive, label: "Archives", path: "archives" },
    { icon: TbSettings, label: "Settings", path: "settings" },
];

// --- WebSocket Message Structure ---
type WebSocketMessage = {
    type: "project_updated" | "project_ownership_transferred" | string;
    data: ProjectDetails; // Expecting the full project details on update
};

interface ProjectSidebarProps {
    projectId: string;
    onInviteClick: () => void;
    isOpen: boolean;
    onClose: () => void;
}

interface ProjectDetails { // Define the shape of your project data
    id: number;
    project_name: string;
    business_name: string | null; // Corrected to be nullable
    description: string | null; // Corrected to be nullable
    owner_user_id: number;
    created_at: string; // Assuming timestamp is a string
}

const ProjectSidebar: Component<ProjectSidebarProps> = (props) => {
    const location = useLocation();
    const [projectDetails, setProjectDetails] = createSignal<ProjectDetails | null>(null);
    let ws: WebSocket | null = null;
    
    const projectBaseUrl = createMemo(() => `/dashboard/project/${props.projectId}`);

    const buildHref = (path: string) => {
        return path === "" ? projectBaseUrl() : `${projectBaseUrl()}/${path}`;
    };

    const isLinkActive = (path: string) => {
        const fullPath = buildHref(path);
        if (path === "") {
            return location.pathname === projectBaseUrl() || location.pathname === `${projectBaseUrl()}/`;
        } else {
            return location.pathname === fullPath || location.pathname.startsWith(`${fullPath}/`);
        }
    };

    const fetchProjectDetails = async () => {
        try {
            const data = await sendRequest<ProjectDetails>(`/projects/${props.projectId}`); 
            setProjectDetails(data);
        } catch (error) {
            console.error("Error fetching project details:", error);
            setProjectDetails(null);
        }
    };

    onMount(() => {
        fetchProjectDetails();

        // --- NEW: Establish WebSocket Connection onMount ---
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/projects/${props.projectId}/ws`;

        console.log(`Sidebar connecting to WebSocket at ${wsUrl}`);
        ws = new WebSocket(wsUrl);

        ws.onopen = () => { console.log(`Sidebar WebSocket connected for project ${props.projectId}`); };

        ws.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                console.log("Sidebar WebSocket message received:", message);

                if (message.type === "project_updated" || message.type === "project_ownership_transferred") {
                    const updatedProject: ProjectDetails = message.data;
                    // Update the projectDetails signal with the new data
                    setProjectDetails(updatedProject);
                }
            } catch (e) {
                console.error("Failed to parse WebSocket message in sidebar:", e);
            }
        };

        ws.onerror = (error) => { console.error("Sidebar WebSocket error:", error); };
        ws.onclose = () => { console.log(`Sidebar WebSocket disconnected for project ${props.projectId}`); };
    });

    // --- NEW: Cleanup WebSocket on component unmount ---
    onCleanup(() => {
        if (ws) {
            ws.close();
            console.log(`Sidebar WebSocket for project ${props.projectId} closed.`);
        }
    });

    return (
        <>
            <Show when={props.isOpen}>
                <div
                    onClick={props.onClose}
                    class="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden cursor-pointer"
                />
            </Show>

            <aside
                class="w-64 bg-gray-950 flex-shrink-0 flex flex-col border-r border-gray-800/50 p-4 fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0"
                classList={{
                    "translate-x-0": props.isOpen,
                    "-translate-x-full": !props.isOpen,
                }}
            >
                <div class="flex justify-between items-center mb-10">
                    <div>
                        <Show when={projectDetails()} fallback={<p class="text-gray-400">Loading project...</p>}>
                            {(details) => { // details is now the *value* inside the projectDetails signal
                                const {project_name, business_name} = details();
                                return (
                                <>
                                    <h2 class="text-xl font-bold text-white">{project_name}</h2>
                                    <p class="text-sm text-gray-400">{business_name || 'No business name'}</p> {/* Handle null business_name */}
                                </>
                                );
                            }}
                        </Show>
                    </div>
                    <button onClick={props.onClose} class="p-2 rounded-full lg:hidden hover:bg-gray-700 cursor-pointer">
                        <TbX />
                    </button>
                </div>
                <nav class="flex flex-col space-y-1">
                    <For each={navItems}>
                        {(item) => (
                            <A
                                href={buildHref(item.path)}
                                class="flex items-center p-3 rounded-lg font-medium transition-all duration-200 cursor-pointer"
                                classList={{
                                    "bg-blue-600 text-white shadow-lg": isLinkActive(item.path),
                                    "text-gray-400 hover:bg-gray-800 hover:text-white": !isLinkActive(item.path)
                                }}
                            >
                                <item.icon class="w-6 h-6 mr-3" />
                                <span>{item.label}</span>
                            </A>
                        )}
                    </For>
                </nav>

                <div class="mt-auto space-y-2">
                    <button
                        onClick={props.onInviteClick}
                        class="w-full flex items-center justify-center p-3 rounded-lg font-semibold bg-blue-600/10 text-blue-300 hover:bg-blue-600/20 transition-colors duration-200 cursor-pointer"
                    >
                        <TbUserPlus class="w-6 h-6 mr-2" />
                        <span>Invite members</span>
                    </button>
                    <A href="/dashboard" class="flex items-center p-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200 cursor-pointer">
                        <TbArrowLeft class="w-5 h-5 mr-3" />
                        <span>Back to All Projects</span>
                    </A>
                </div>
            </aside>
        </>
    );
}

export default ProjectSidebar;
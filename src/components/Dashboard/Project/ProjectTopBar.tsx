import { Component, createSignal, Show, onMount, onCleanup, createEffect, For, createMemo } from "solid-js";
import { A, useParams, useNavigate } from "@solidjs/router"; // Import useNavigate
import {
    TbPlus, TbLogout, TbSettings, TbSearch, TbLayoutKanban, TbUsers, TbShieldCheck, TbArchive, TbArrowRight,
    TbHourglass, TbCircleCheck,
    TbMenu, TbMenu2, TbLoader, TbAlertTriangle,
} from 'solid-icons/tb';
import { FiSearch } from 'solid-icons/fi';
import { gsap } from "gsap";
import { sendRequest } from "../../../utils/SendRequest"; // Import sendRequest
import { useAuth } from "../../../context/AuthContext"; // Import useAuth

// --- API DATA STRUCTURES ---
type ApiProjectResponse = {
    id: number;
    project_name: string;
    business_name: string | null;
    description: string | null;
    owner_user_id: number;
    created_at: string;
    // Add any other fields you expect from the project API
};

type ApiTaskResponse = {
    id: number;
    status: 'ToDo' | 'InProgress' | 'InReview' | 'Done';
    archived_on: string | null; // From the DB schema
    // Include other fields needed for filtering/display
};

type ApiUserResponse = {
    id: number;
    email: string;
    // Add other user fields like name, if you store them.
    // For now, using email as "name" if full_name is not available.
};

// --- NEW: WebSocket Message Structure ---
type WebSocketMessage = {
    type: "task_created" | "task_updated" | "task_unarchived" | "task_deleted" | "role_updated" | "member_updated" | string; // Add more as you implement them
    data: any; // The payload can be different for each message type
};

// --- REUSABLE COMPONENTS (NESTED FOR EASY COPY-PASTE) ---

// 1. Logout Confirmation Modal
const LogoutModal: Component<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; isLoggingOut: boolean; }> = (props) => {
    let modalRef: HTMLDivElement | undefined;
    createEffect(() => { if (props.isOpen) { gsap.fromTo(modalRef!, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" }); } });
    return (
        <Show when={props.isOpen}><div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"><div ref={modalRef} class="bg-gray-800 rounded-xl p-8 border border-gray-700/50 w-full max-w-md text-center"><h2 class="text-2xl font-bold text-white">Log Out?</h2><p class="text-gray-400 mt-2">Are you sure you want to log out of your account?</p><div class="mt-8 flex justify-center space-x-4"><button onClick={props.onClose} class="px-6 py-2 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600 cursor-pointer" disabled={props.isLoggingOut}>Cancel</button><button onClick={props.onConfirm} class="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 cursor-pointer" disabled={props.isLoggingOut}><Show when={props.isLoggingOut} fallback={<span>Log Out</span>}><TbLoader class="animate-spin mr-2"/>Logging Out...</Show></button></div></div></div></Show>
    );
};

// 2. Command Palette Search Modal
const SearchPalette: Component<{ isOpen: boolean; onClose: () => void; initialSearchText: string; projectId: string; }> = (props) => { // Added projectId
    let modalRef: HTMLDivElement | undefined;
    let inputRef: HTMLInputElement | undefined;
    const [searchText, setSearchText] = createSignal(props.initialSearchText);

    // Dynamic search commands based on current projectId
    const searchCommands = createMemo(() => [
        { name: "Go to Tasks", href: `/dashboard/project/${props.projectId}/tasks`, icon: TbLayoutKanban },
        { name: "Go to Members", href: `/dashboard/project/${props.projectId}/members`, icon: TbUsers },
        { name: "Go to Roles", href: `/dashboard/project/${props.projectId}/roles`, icon: TbShieldCheck },
        { name: "Go to Archives", href: `/dashboard/project/${props.projectId}/archives`, icon: TbArchive },
        { name: "Go to Settings", href: `/dashboard/project/${props.projectId}/settings`, icon: TbSettings },
    ]);

    const filteredCommands = createMemo(() => {
        const query = searchText().toLowerCase().trim();
        return searchCommands().filter(cmd => cmd.name.toLowerCase().includes(query));
    });

    createEffect(() => {
        if (props.isOpen) {
            setSearchText(props.initialSearchText);
            gsap.fromTo(modalRef!, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" });
            setTimeout(() => inputRef?.focus(), 100);
        }
    });

    const navigate = useNavigate(); // Use useNavigate for proper routing
    const handleCommandClick = (href: string) => {
        navigate(href);
        props.onClose();
    };

    return (
        <Show when={props.isOpen}>
            <div class="fixed inset-0 z-50 flex justify-center pt-24 bg-black/60 backdrop-blur-sm" onClick={props.onClose}>
                <div ref={modalRef} class="bg-gray-800 rounded-xl border border-gray-700/50 w-full max-w-2xl max-h-[50vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div class="p-4 border-b border-gray-700/50 relative">
                        <TbSearch class="absolute left-7 top-1/2 -translate-y-1/2 text-gray-500"/>
                        <input ref={inputRef} type="text" placeholder="Type a command or search..." value={searchText()} onInput={e => setSearchText(e.currentTarget.value)} class="w-full bg-transparent pl-10 pr-4 py-2 text-lg text-white focus:outline-none"/>
                    </div>
                    <div class="flex-1 overflow-y-auto p-2">
                        <For each={filteredCommands()} fallback={<p class="p-4 text-center text-gray-500">No results found.</p>}>
                            {(cmd) => (
                                <A href={cmd.href} onClick={() => handleCommandClick(cmd.href)} class="flex items-center justify-between p-4 rounded-lg hover:bg-blue-600 group cursor-pointer">
                                    <div class="flex items-center space-x-3">
                                        <cmd.icon class="w-5 h-5 text-gray-400 group-hover:text-white"/>
                                        <span class="text-white">{cmd.name}</span>
                                    </div>
                                    <TbArrowRight class="w-5 h-5 text-gray-500 group-hover:text-white"/>
                                </A>
                            )}
                        </For>
                    </div>
                </div>
            </div>
        </Show>
    );
};


// --- MAIN TOP BAR COMPONENT ---
const ProjectTopBar: Component<{
    onCreateNewTaskClick: () => void;
    onAccountSettingsClick: () => void;
    onMenuClick: () => void;
}> = (props) => {
    const params = useParams(); // Get projectId from URL
    const { user: authUser, refetchUser } = useAuth(); // Get user and refetch function
    const navigate = useNavigate(); // For logout navigation

    // API Data State
    const [project, setProject] = createSignal<ApiProjectResponse | null>(null);
    const [tasks, setTasks] = createSignal<ApiTaskResponse[]>([]);
    const [currentUser, setCurrentUser] = createSignal<ApiUserResponse | null>(null);

    // UI State
    const [isLoading, setIsLoading] = createSignal(true);
    const [error, setError] = createSignal<string | null>(null);
    const [isDropdownOpen, setDropdownOpen] = createSignal(false);
    const [isLogoutModalOpen, setLogoutModalOpen] = createSignal(false);
    const [isLoggingOut, setIsLoggingOut] = createSignal(false);
    const [isSearchOpen, setSearchOpen] = createSignal(false);
    const [searchInputValue, setSearchInputValue] = createSignal('');


    
    let dropdownRef: HTMLDivElement | undefined;

    let ws: WebSocket | null = null; // WebSocket instance


// --- Data Fetching ---
    onMount(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [projectData, tasksData, userData] = await Promise.all([
                sendRequest<ApiProjectResponse>(`/projects/${params.project_id}`),
                sendRequest<ApiTaskResponse[]>(`/projects/${params.project_id}/tasks`), // Fetches active tasks
                sendRequest<ApiUserResponse>('/auth/me'),
            ]);
            setProject(projectData);
            setTasks(tasksData);
            setCurrentUser(userData);
        } catch (err: any) {
            console.error("Error fetching top bar data:", err);
            setError(err.message || "Failed to load top bar data.");
        } finally {
            setIsLoading(false);
        }

        // --- NEW: Establish WebSocket Connection onMount ---
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/projects/${params.project_id}/ws`;

        console.log(`Connecting to WebSocket at ${wsUrl}`);
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log(`WebSocket connected for project ${params.project_id}`);
        };

        ws.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                console.log("WebSocket message received:", message);

                // --- Handle different message types ---
                if (message.type === "task_created") {
                    const newTask: ApiTaskResponse = message.data;
                    setTasks(prevTasks => [...prevTasks, newTask]);
                } else if (message.type === "task_updated" || message.type === "task_unarchived") {
                    const updatedTask: ApiTaskResponse = message.data;
                    setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
                } else if (message.type === "task_deleted") {
                    const { task_id } = message.data;
                    setTasks(prevTasks => prevTasks.filter(t => t.id !== task_id));
                }
                // Add more `else if` blocks for member_updated, role_updated, etc.
                
            } catch (e) {
                console.error("Failed to parse WebSocket message:", e);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
            console.log(`WebSocket disconnected for project ${params.project_id}`);
        };
    });

    // --- Cleanup WebSocket on component unmount ---
    onCleanup(() => {
        if (ws) {
            ws.close();
        }
    });
    // --- Stats Calculation ---
    const projectStats = createMemo(() => {
        if (!tasks()) return { ongoing: 0, successful: 0, archived: 0 };
        const activeTasks = tasks().filter(t => t.archived_on === null);
        const ongoing = activeTasks.filter(t => t.status !== 'Done').length;
        const successful = activeTasks.filter(t => t.status === 'Done').length;
        const archived = tasks().filter(t => t.archived_on !== null).length;
        return { ongoing, successful, archived };
    });

    const totalActiveTasks = createMemo(() => projectStats().ongoing + projectStats().successful);
    const completionPercentage = createMemo(() => totalActiveTasks() > 0 ? Math.round((projectStats().successful / totalActiveTasks()) * 100) : 0);
    // --- Logout Handler ---
    const handleConfirmLogout = async () => {
        setIsLoggingOut(true);
        try {
            await sendRequest<any>('/auth/logout', { method: 'POST' }); // Assuming a logout endpoint
            await refetchUser(); // Clear auth state in context
            navigate('/login'); // Redirect to login page
        } catch (err: any) {
            console.error("Logout failed:", err);
            alert(`Logout failed: ${err.message}`); // Provide feedback
        } finally {
            setIsLoggingOut(false);
            setLogoutModalOpen(false); // Close modal regardless
        }
    };

    // --- Dropdown click-away logic ---
    createEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isDropdownOpen() && dropdownRef && !dropdownRef.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        onCleanup(() => document.removeEventListener("mousedown", handleClickOutside));
    });

    const openSearchPalette = () => setSearchOpen(true);
    const handleSearchInput = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;
        setSearchInputValue(value);
        if (value.length > 0 && !isSearchOpen()) { openSearchPalette(); }
    };
    const handleSearchPaletteClose = () => { setSearchOpen(false); setSearchInputValue(''); };

    return (
        <>
            <Show when={!isLoading()} fallback={
                <div class="bg-gray-950/50 backdrop-blur-sm border-b border-gray-800 p-4 flex items-center justify-center h-24">
                    <TbLoader class="w-8 h-8 animate-spin text-gray-400" />
                </div>
            }>
                <Show when={!error()} fallback={
                     <div class="bg-gray-950/50 backdrop-blur-sm border-b border-gray-800 p-4 text-center text-red-400">
                        <TbAlertTriangle class="inline-block mr-2"/>Failed to load top bar data: {error()}
                    </div>
                }>
                    <div class="bg-gray-950/50 backdrop-blur-sm border-b border-gray-800 flex flex-col">
                        {/* --- Main Header Bar --- */}
                        <header class="p-4 flex justify-between items-center gap-4">
                            <div class="flex items-center gap-2 lg:gap-4">
                                <button onClick={props.onMenuClick} class="p-2 rounded-full text-gray-300 hover:bg-gray-700 lg:hidden cursor-pointer">
                                    <TbMenu2 size={24} />
                                </button>
                                <div class="relative text-left w-64 md:w-96 hidden sm:block">
                                    <FiSearch class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search or jump to..."
                                        value={searchInputValue()}
                                        onInput={handleSearchInput}
                                        onFocus={openSearchPalette}
                                        class="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div class="flex items-center space-x-2 md:space-x-4">
                                <button onClick={props.onCreateNewTaskClick} class="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200 cursor-pointer">
                                    <TbPlus class="w-5 h-5 md:mr-2" />
                                    <span class="hidden md:inline">New Task</span>
                                </button>
                                <div ref={dropdownRef} class="relative">
                                    <button onClick={() => setDropdownOpen(!isDropdownOpen())} class="w-10 h-10 bg-pink-500 cursor-pointer rounded-full flex items-center justify-center font-bold text-white ring-2 ring-offset-2 ring-offset-gray-900 ring-pink-500">
                                        {currentUser()?.email ? currentUser()!.email[0].toUpperCase() : 'U'}
                                    </button>
                                    <Show when={isDropdownOpen()}>
                                        <div class="absolute top-14 right-0 w-56 bg-gray-800 rounded-lg shadow-lg border border-gray-700/50 z-10 py-2">
                                            <div class="px-4 py-2 border-b border-gray-700/50">
                                                <p class="font-semibold text-white">{currentUser()?.email || 'User'}</p>
                                                <p class="text-sm text-gray-400">{project()?.project_name || 'Project'}</p>
                                            </div>
                                            <div class="mt-2 space-y-1">
                                                <button onClick={() => { props.onAccountSettingsClick(); setDropdownOpen(false); }} class="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-700 cursor-pointer"><TbSettings/><span>Account Settings</span></button>
                                                <button onClick={() => { setLogoutModalOpen(true); setDropdownOpen(false); }} class="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 cursor-pointer"><TbLogout/><span>Logout</span></button>
                                            </div>
                                        </div>
                                    </Show>
                                </div>
                            </div>
                        </header>

                        {/* --- Bottom Navigation Bar for Project Stats (NOW RESPONSIVE) --- */}
                        <div class="px-4 pb-4 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6">
                            {/* Linear Progress Bar */}
                            <div class="flex-grow flex items-center gap-3">
                                <span class="font-bold text-lg text-white">{completionPercentage()}%</span>
                                <div class="w-full bg-gray-700 rounded-full h-2">
                                    <div class="bg-blue-600 h-2 rounded-full" style={{ width: `${completionPercentage()}%` }}></div>
                                </div>
                            </div>
                            {/* Icon-Driven Stats */}
                            <div class="flex items-center justify-between md:justify-start gap-4 md:gap-6 text-sm flex-shrink-0">
                                <div class="flex items-center gap-2 text-amber-400" title={`${projectStats().ongoing} Ongoing Tasks`}>
                                    <TbHourglass size={20}/>
                                    <span class="font-semibold">{projectStats().ongoing}</span>
                                    <span class="hidden md:inline">Ongoing</span>
                                </div>
                                <div class="flex items-center gap-2 text-green-400" title={`${projectStats().successful} Done Tasks`}>
                                    <TbCircleCheck size={20}/>
                                    <span class="font-semibold">{projectStats().successful}</span>
                                    <span class="hidden md:inline">Done</span>
                                </div>
                                <div class="flex items-center gap-2 text-gray-400" title={`${projectStats().archived} Archived Tasks`}>
                                    <TbArchive size={20}/>
                                    <span class="font-semibold">{projectStats().archived}</span>
                                    <span class="hidden md:inline">Archived</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Show>
            </Show>
            
            <LogoutModal isOpen={isLogoutModalOpen()} onClose={() => setLogoutModalOpen(false)} onConfirm={handleConfirmLogout} isLoggingOut={isLoggingOut()} />
            <SearchPalette isOpen={isSearchOpen()} onClose={handleSearchPaletteClose} initialSearchText={searchInputValue()} projectId={params.project_id} />
        </>
    );
};

export default ProjectTopBar;
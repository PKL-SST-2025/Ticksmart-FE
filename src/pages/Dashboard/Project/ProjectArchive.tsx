    import { Component, For, Show, createSignal, createEffect, createMemo, onMount, onCleanup } from "solid-js";
    import { useParams } from "@solidjs/router";
    import {
        createSolidTable, // No longer strictly needed if not using @tanstack/solid-table features for filtering/sorting by library
        getCoreRowModel,
        flexRender,
        type ColumnDef,
    } from "@tanstack/solid-table";
    import { TbArchiveOff, TbEye, TbSearch, TbUser, TbUsers, TbShieldCheck, TbListCheck, TbX, TbLoader, TbAlertTriangle, TbCheck } from 'solid-icons/tb';
    import ProjectDashboardLayout from "../../../layouts/ProjectDashboardLayout";
    import { gsap } from "gsap";
    import { sendRequest } from "../../../utils/SendRequest"; // Import sendRequest
    import { useAuth } from "../../../context/AuthContext"; // To get authenticated user's info for layout

            // --- NEW: Reusable Notification Modal ---
const NotificationModal: Component<{
    isOpen: boolean;
    onClose: () => void;
    type: 'success' | 'error';
    message: string;
}> = (props) => {
    let modalRef: HTMLDivElement | undefined;
    
    createEffect(() => {
        if (props.isOpen) {
            gsap.fromTo(modalRef!, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
        }
    });

    const isError = () => props.type === 'error';

    return (
        <Show when={props.isOpen}>
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div ref={modalRef} class="bg-gray-800 rounded-xl p-8 border w-full max-w-md text-center"
                     classList={{
                         "border-red-500/30": isError(),
                         "border-green-500/30": !isError(),
                     }}>
                    <div class="mx-auto w-16 h-16 flex items-center justify-center rounded-full mb-4"
                         classList={{
                             "bg-red-500/10": isError(),
                             "bg-green-500/10": !isError(),
                         }}>
                        <Show when={isError()} fallback={<TbCheck class="w-8 h-8 text-green-500" />}>
                            <TbAlertTriangle class="w-8 h-8 text-red-500" />
                        </Show>
                    </div>
                    <h2 class="text-2xl font-bold text-white">
                        {isError() ? 'An Error Occurred' : 'Success'}
                    </h2>
                    <p class="text-gray-400 mt-2">{props.message}</p>
                    <div class="mt-8 flex justify-center">
                        <button onClick={props.onClose} class="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </Show>
    );
};

// --- NEW: Reusable Confirmation Modal ---
const ConfirmationModal: Component<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    isSubmitting: boolean;
}> = (props) => {
    let modalRef: HTMLDivElement | undefined;
    
    createEffect(() => {
        if (props.isOpen) {
            gsap.fromTo(modalRef!, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
        }
    });

    return (
        <Show when={props.isOpen}>
            <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div ref={modalRef} class="bg-gray-800 rounded-xl p-8 border border-amber-500/30 w-full max-w-md text-center">
                    <div class="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-amber-500/10 mb-4">
                        <TbAlertTriangle class="w-8 h-8 text-amber-500" />
                    </div>
                    <h2 class="text-2xl font-bold text-white">{props.title}</h2>
                    <p class="text-gray-400 mt-2">{props.message}</p>
                    <div class="mt-8 flex justify-center space-x-4">
                        <button onClick={props.onClose} disabled={props.isSubmitting} class="px-6 py-2 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600 disabled:opacity-50">
                            Cancel
                        </button>
                        <button onClick={props.onConfirm} disabled={props.isSubmitting} class="px-6 py-2 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-50">
                            <Show when={props.isSubmitting} fallback={<span>{props.confirmText || 'Confirm'}</span>}>
                                <TbLoader class="animate-spin"/>
                            </Show>
                        </button>
                    </div>
                </div>
            </div>
        </Show>
    );
};
    // --- API DATA STRUCTURES (What Rust sends) ---
    type ApiTaskResponse = {
        id: number;
        title: string;
        description: string | null;
        status: 'ToDo' | 'InProgress' | 'InReview' | 'Done'; // Matches Rust enum
        project_id: number;
        lead_assignee_id: number | null;
        contributor_ids: number[];
        required_role_ids: number[];
        sub_tasks: { id: number; description: string; is_completed: boolean; task_id: number; }[];
        archived_on: string | null; // From backend, will be NOT NULL for archived tasks
    };

    type ApiMemberResponse = {
        id: number;
        user_id: number;
        full_name: string;
        email: string;
        role_id: number | null;
        is_banned: boolean;
        is_owner: boolean;
    };

    type ApiJobRole = {
        id: number;
        role: string;
        description: string;
        project_id: number;
    };


    // --- NEW: WebSocket Message Structure ---
    type WebSocketMessage = {
        type: "task_archived" | "task_unarchived" | string;
        data: any;
    };

    // --- FRONTEND DATA STRUCTURES (Mapped from API for UI convenience) ---
    type Member = { id: number; name: string; avatarInitial: string; userId: number; }; // Simplified for this view
    type JobRole = { id: number; name: string; };
    type SubTask = { id: number; text: string; completed: boolean; }; // 'text' is the UI-facing name
    type Task = { // UI-friendly Task structure for archived items
        id: number;
        title: string;
        description?: string;
        leadAssigneeId: number | null; // Can be null now
        contributorIds: number[];
        subTasks: SubTask[];
        requiredRoleIds: number[];
        archivedAt: string; // The `archived_on` from API, guaranteed not null here
    };


    // --- REUSABLE MODAL FOR TASK DETAILS ---
    const ArchiveDetailModal: Component<{
        isOpen: boolean;
        task: Task | null;
        onClose: () => void;
        membersData: Member[]; // Pass dynamically
        jobRolesData: JobRole[]; // Pass dynamically
    }> = (props) => {
        let modalRef: HTMLDivElement | undefined;
        createEffect(() => { if (props.isOpen) { gsap.fromTo(modalRef!, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" }); } });

        const subTaskProgress = createMemo(() => {
            const subTasks = props.task?.subTasks ?? [];
            if (subTasks.length === 0) return 0;
            return (subTasks.filter(st => st.completed).length / subTasks.length) * 100;
        });

        const getMemberById = (id: number | null) => props.membersData.find(m => m.id === id);
        const getRoleById = (id: number) => props.jobRolesData.find(r => r.id === id);

        return (
            <Show when={props.isOpen && props.task}>
                <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={props.onClose}>
                    <div ref={modalRef} class="bg-gray-800 rounded-xl border border-gray-700/50 w-full max-w-3xl flex flex-col" onClick={e => e.stopPropagation()}>
                        <div class="p-6 border-b border-gray-700/50 flex justify-between items-start">
                            <div>
                                <h2 class="text-2xl font-bold text-white">{props.task?.title}</h2>
                                <p class="text-sm text-gray-400 mt-1">Archived on {new Date(props.task!.archivedAt).toLocaleDateString()}</p>
                            </div>
                            <button onClick={props.onClose} class="p-2 rounded-full hover:bg-gray-700 cursor-pointer"><TbX/></button>
                        </div>
                        <div class="flex-1 p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                            <div><p class="text-gray-300 whitespace-pre-wrap">{props.task?.description || "No description was provided."}</p></div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><h3 class="font-semibold text-white mb-3 flex items-center"><TbUser class="mr-2"/>Lead Assignee</h3><div class="flex items-center space-x-2"><div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">{getMemberById(props.task?.leadAssigneeId)?.avatarInitial}</div><span>{getMemberById(props.task?.leadAssigneeId)?.name || 'Unassigned'}</span></div></div>
                                <div><h3 class="font-semibold text-white mb-3 flex items-center"><TbUsers class="mr-2"/>Contributors</h3><div class="flex items-center flex-wrap gap-2"><For each={props.task?.contributorIds ?? []} fallback={<span class="text-gray-500 italic">No contributors.</span>}>{id => <div class="flex items-center space-x-2"><div class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white">{getMemberById(id)?.avatarInitial}</div><span>{getMemberById(id)?.name}</span></div>}</For></div></div>
                            </div>
                            <div><h3 class="font-semibold text-white mb-3 flex items-center"><TbShieldCheck class="mr-2"/>Required Roles</h3><div class="flex flex-wrap gap-2"><For each={props.task?.requiredRoleIds ?? []} fallback={<span class="text-gray-500 italic">No specific roles were required.</span>}>{id => <span class="bg-gray-700 text-gray-200 text-xs font-semibold px-2.5 py-1 rounded-full">{getRoleById(id)?.name}</span>}</For></div></div>
                            <div>
                                <div class="flex justify-between items-center mb-2"><h3 class="font-semibold text-white flex items-center"><TbListCheck class="mr-2"/>Sub-tasks</h3><span class="text-sm text-gray-400">{subTaskProgress().toFixed(0)}% Complete</span></div>
                                <div class="w-full bg-gray-700 rounded-full h-1.5 mb-3"><div class="bg-blue-600 h-1.5 rounded-full" style={{ width: `${subTaskProgress()}%` }}></div></div>
                                <ul class="space-y-2"><For each={props.task?.subTasks ?? []} fallback={<li class="text-gray-500 italic">No sub-tasks.</li>}>{(sub) => <li class="flex items-center space-x-3 p-2 rounded-lg bg-gray-900/50"><input type="checkbox" checked={sub.completed} disabled/><span classList={{"line-through text-gray-500": sub.completed}}>{sub.text}</span></li>}</For></ul>
                            </div>
                        </div>
                    </div>
                </div>
            </Show>
        );
    };


    // --- MAIN PAGE COMPONENT ---
    const ProjectArchivePage: Component = () => {
        const params = useParams();
        const projectId = params.project_id; // Get project ID from URL
        const { user: authUser } = useAuth(); // Get authenticated user's email for layout
        let ws: WebSocket | null = null; 

        // Data states
        const [archivedTasks, setArchivedTasks] = createSignal<Task[]>([]);
        const [members, setMembers] = createSignal<Member[]>([]);
        const [jobRoles, setJobRoles] = createSignal<JobRole[]>([]);

        // UI states
        const [isLoading, setIsLoading] = createSignal(true);
        const [error, setError] = createSignal<string | null>(null);
        const [isSubmitting, setIsSubmitting] = createSignal(false); // For unarchive action

        const [isDetailModalOpen, setDetailModalOpen] = createSignal(false);
        const [selectedTask, setSelectedTask] = createSignal<Task | null>(null);

        const [searchText, setSearchText] = createSignal('');
        const [assigneeFilter, setAssigneeFilter] = createSignal(0);

        
    // --- NEW: State for Notification Modal ---
    const [isNotificationModalOpen, setNotificationModalOpen] = createSignal(false);
    const [notificationMessage, setNotificationMessage] = createSignal('');
    const [notificationType, setNotificationType] = createSignal<'success' | 'error'>('error');


        // Helper to map API Task to Frontend Task
        const mapApiTaskToFrontend = (apiTask: ApiTaskResponse): Task => ({
            id: apiTask.id,
            title: apiTask.title,
            description: apiTask.description || undefined,
            leadAssigneeId: apiTask.lead_assignee_id,
            contributorIds: apiTask.contributor_ids || [],
            subTasks: (apiTask.sub_tasks || []).map(st => ({ id: st.id, text: st.description, completed: st.is_completed })),
            requiredRoleIds: apiTask.required_role_ids || [],
            archivedAt: apiTask.archived_on!,
        });

        // --- Data Fetching ---
        const fetchArchiveData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [tasksData, membersData, rolesData] = await Promise.all([
                    sendRequest<ApiTaskResponse[]>(`/projects/${projectId}/tasks/archived`), // Fetch archived tasks
                    sendRequest<ApiMemberResponse[]>(`/projects/${projectId}/members`),
                    sendRequest<ApiJobRole[]>(`/projects/${projectId}/roles`),
                ]);

                // Map API responses to frontend-friendly types
                const mappedTasks: Task[] = tasksData.map(apiTask => ({
                    id: apiTask.id,
                    title: apiTask.title,
                    description: apiTask.description || undefined,
                    leadAssigneeId: apiTask.lead_assignee_id,
                    contributorIds: apiTask.contributor_ids || [],
                    subTasks: (apiTask.sub_tasks || []).map(st => ({ id: st.id, text: st.description, completed: st.is_completed })),
                    requiredRoleIds: apiTask.required_role_ids || [],
                    archivedAt: apiTask.archived_on!, // Guaranteed to be not null for archived tasks
                }));

                const mappedMembers: Member[] = membersData.map(apiMember => ({
                    id: apiMember.id,
                    name: apiMember.full_name,
                    avatarInitial: apiMember.full_name.split(' ').map(n => n[0]).join('').toUpperCase(),
                    userId: apiMember.user_id,
                }));

                const mappedRoles: JobRole[] = rolesData.map(apiRole => ({
                    id: apiRole.id,
                    name: apiRole.role
                }));

                setArchivedTasks(mappedTasks);
                setMembers(mappedMembers);
                setJobRoles(mappedRoles);

            } catch (err: any) {
                console.error("Error fetching archive data:", err);
                setError(err.message || "Failed to load archived tasks.");
            } finally {
                setIsLoading(false);
            }
        };


        onMount(() => {
            fetchArchiveData();
            
            // --- NEW: Establish WebSocket Connection onMount ---
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/api/projects/${projectId}/ws`;

            console.log(`Connecting to WebSocket at ${wsUrl}`);
            ws = new WebSocket(wsUrl);

            ws.onopen = () => { console.log(`WebSocket connected for project ${projectId}`); };

            ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    console.log("WebSocket message received on Archives page:", message);

                    if (message.type === "task_archived") {
                        const newArchivedTaskData: ApiTaskResponse = message.data;
                        const mappedNewTask = mapApiTaskToFrontend(newArchivedTaskData);
                        // Add to list, ensuring it's not already there
                        setArchivedTasks(prev => {
                            if (prev.some(t => t.id === mappedNewTask.id)) return prev;
                            return [...prev, mappedNewTask];
                        });
                    } else if (message.type === "task_unarchived") {
                        const unarchivedTaskData: ApiTaskResponse = message.data;
                        // Remove from list
                        setArchivedTasks(prev => prev.filter(t => t.id !== unarchivedTaskData.id));
                    }
                    
                } catch (e) {
                    console.error("Failed to parse WebSocket message:", e);
                }
            };

            ws.onerror = (error) => { console.error("WebSocket error:", error); };
            ws.onclose = () => { console.log(`WebSocket disconnected for project ${projectId}`); };
        });

        // --- Cleanup WebSocket on component unmount ---
        onCleanup(() => {
            if (ws) {
                ws.close();
            }
        });

        // --- Helper functions for rendering ---
        const getMemberById = (id: number | null) => members().find(m => m.id === id);
        const getRoleById = (id: number) => jobRoles().find(r => r.id === id);

        // --- Filtered Tasks ---
        const filteredTasks = createMemo(() => {
            let items = archivedTasks();
            if (searchText().trim()) { items = items.filter(t => t.title.toLowerCase().includes(searchText().toLowerCase())); }
            if (assigneeFilter() !== 0) {
                items = items.filter(t => t.leadAssigneeId === assigneeFilter() || (t.contributorIds ?? []).includes(assigneeFilter()));
            }
            return items;
        });


        // --- Table Definition (using filtered data) ---
   const columns: ColumnDef<Task>[] = [
        { 
            accessorKey: 'title', 
            header: "Archived Task", 
            cell: ({ row }) => (
                <div>
                    <p class="font-semibold text-white">{row.original.title}</p>
                    <p class="text-sm text-gray-400 mt-1 max-w-xs truncate">{row.original.description || "No description."}</p>
                </div>
            ),
        },
        { 
            id: 'people', 
            header: "People", 
            cell: ({ row }) => (
                <div class="flex items-center -space-x-2">
                    <For each={(row.original.contributorIds ?? []).map(id => getMemberById(id)).filter(Boolean) as Member[]}>
                        {(c) => 
                            <div class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-gray-800" title={c.name}>
                                {c.avatarInitial}
                            </div>
                        }
                    </For>
                    <Show when={getMemberById(row.original.leadAssigneeId)}>
                        {lead => 
                            <div class="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white ring-2 ring-gray-800" title={`Lead: ${lead()?.name}`}>
                                {lead()?.avatarInitial}
                            </div>
                        }
                    </Show>
                </div>
            ),
        },
        { 
            id: 'requiredRoles', 
            header: "Required Roles", 
            cell: ({ row }) => (
                <div class="flex flex-wrap gap-2">
                    <For each={row.original.requiredRoleIds ?? []} fallback={<span class="text-gray-500 italic text-sm">Any</span>}>
                        {id => <span class="bg-gray-700 text-gray-200 text-xs font-semibold px-2 py-1 rounded-full">{getRoleById(id)?.name}</span>}
                    </For>
                </div>
            )
        },
        { 
            accessorKey: 'archivedAt', 
            header: "Archived On", 
            cell: (info) => <span class="text-gray-300 font-mono text-sm whitespace-nowrap">{new Date(info.getValue<string>()).toLocaleDateString()}</span> 
        },
        { 
            id: 'actions', 
            header: () => <div class="text-right">Actions</div>, 
            cell: ({ row }) => (
                <div class="flex justify-end items-center space-x-1">
                    <button onClick={(e) => { e.stopPropagation(); setDetailModalOpen(true); setSelectedTask(row.original); }} class="p-2 text-gray-400 hover:text-blue-400 rounded-md hover:bg-blue-500/10" title="View Details"><TbEye size={18} /></button>
                    <button onClick={(e) => handleUnarchive(e, row.original.id)} disabled={isSubmitting()} class="p-2 text-gray-400 hover:text-green-400 rounded-md hover:bg-green-500/10 disabled:opacity-50" title="Unarchive Task"><TbArchiveOff size={18} /></button>
                </div>
            )
        },
    ];

        const table = createSolidTable({ get data() { return filteredTasks() }, columns, getCoreRowModel: getCoreRowModel() });


            // --- NEW: State for Confirmation Modal ---
    const [isConfirmModalOpen, setConfirmModalOpen] = createSignal(false);
    const [confirmModalData, setConfirmModalData] = createSignal<{
        title: string;
        message: string;
        onConfirm: () => Promise<void>;
    } | null>(null);

    // --- Action Handlers (UPDATED) ---
    const handleUnarchive = (e: MouseEvent, taskId: number) => {
        e.stopPropagation();
        
        // FIX: Set data for the confirmation modal and open it
        setConfirmModalData({
            title: "Unarchive Task?",
            message: "Are you sure you want to unarchive this task? It will be moved back to the main project board.",
            onConfirm: async () => {
                setIsSubmitting(true);
                try {
                    await sendRequest(`/tasks/${taskId}/unarchive`, { method: 'POST' });
                    // No need to update local state; WebSocket will handle it.
                    // You could optionally show a success notification here too.
                    setNotificationMessage("Task has been successfully unarchived.");
                    setNotificationType('success');
                    setNotificationModalOpen(true);
                } catch (err: any) {
                    setNotificationMessage(err.message || 'Failed to unarchive task.');
                    setNotificationType('error');
                    setNotificationModalOpen(true);
                } finally {
                    setConfirmModalOpen(false); // Close the confirmation modal
                    setIsSubmitting(false);
                }
            }
        });
        setConfirmModalOpen(true);
    };

        
        return (
            <ProjectDashboardLayout activePage="Archives" username={authUser()?.email || ''} projectId={projectId}>
                <ArchiveDetailModal isOpen={isDetailModalOpen()} task={selectedTask()} onClose={() => setDetailModalOpen(false)} membersData={members()} jobRolesData={jobRoles()} />
                <ConfirmationModal
                    isOpen={isConfirmModalOpen()}
                    onClose={() => setConfirmModalOpen(false)}
                    onConfirm={() => confirmModalData()?.onConfirm()} 
                    title={confirmModalData()?.title || ''}
                    message={confirmModalData()?.message || ''}
                    confirmText="Unarchive"
                    isSubmitting={isSubmitting()}
                />
            
                <NotificationModal
                    isOpen={isNotificationModalOpen()}
                    onClose={() => setNotificationModalOpen(false)}
                    type={notificationType()}
                    message={notificationMessage()}
                />

                <div class="space-y-6">
                    <div><h1 class="text-3xl font-bold text-white">Archived Tasks</h1><p class="text-gray-400 mt-1">Browse completed tasks that have been archived from the main board.</p></div>

                    {/* Responsive Filter Bar */}
                    <div class="flex flex-col md:flex-row items-stretch md:items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700/50">
                        <div class="relative flex-grow">
                            <TbSearch class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input type="text" placeholder="Search archived tasks..." onInput={e => setSearchText(e.currentTarget.value)} class="w-full bg-gray-800 rounded-lg pl-10 pr-4 py-2 text-white border border-transparent focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <select onChange={e => setAssigneeFilter(parseInt(e.currentTarget.value))} class="bg-gray-800 rounded-lg px-4 py-2 text-white border border-transparent focus:ring-2 focus:ring-blue-500 cursor-pointer">
                            <option value="0">Filter by Member</option>
                            <For each={members()}>{member => <option value={member.id}>{member.name}</option>}</For>
                        </select>
                    </div>

                    {/* Show Loading/Error for data fetching */}
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
                            {/* Responsive Table Container */}
                            <div class="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                                <div class="overflow-x-auto">
                                    <table class="w-full text-left min-w-[800px] bg-gray-800">
                                        <thead class="border-b border-gray-700/50"><For each={table.getHeaderGroups()}>{headerGroup => (<tr><For each={headerGroup.headers}>{header => <th class="p-4 text-sm font-semibold text-gray-400 whitespace-nowrap">{flexRender(header.column.columnDef.header, header.getContext())}</th>}</For></tr>)}</For></thead>
                                        <tbody><For each={table.getRowModel().rows} fallback={<tr class="text-center"><td colspan={columns.length} class="p-8 text-gray-500 italic">No archived tasks match your filters.</td></tr>}>{(row) => (<tr class="border-t border-gray-700/50 hover:bg-gray-800 transition-colors cursor-pointer" onClick={() => { setDetailModalOpen(true); setSelectedTask(row.original); }}><For each={row.getVisibleCells()}>{cell => <td class="p-4 align-top">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>}</For></tr>)}</For></tbody>
                                    </table>
                                </div>
                            </div>
                        </Show>
                    </Show>
                </div>
            </ProjectDashboardLayout>
        );
    };

    export default ProjectArchivePage;
import { Component, For, Show, createSignal, createEffect, createMemo, onMount, onCleanup } from "solid-js";
import { useParams } from "@solidjs/router";
import ProjectDashboardLayout from "../../../layouts/ProjectDashboardLayout";
import { TbPlus, TbTrash, TbX, TbUserPlus, TbPencil, TbLayoutKanban, TbUser, TbUsers, TbShieldCheck, TbListCheck, TbSearch, TbLogout, TbLoader, TbAlertTriangle, TbArchive } from "solid-icons/tb";
import { gsap } from "gsap";
import { sendRequest } from "../../../utils/SendRequest";
import { useAuth } from "../../../context/AuthContext";

// --- API DATA STRUCTURES (What Rust sends) ---
type ApiTaskResponse = {
    id: number;
    title: string;
    description: string | null;
    status: 'ToDo' | 'InProgress' | 'InReview' | 'Done';
    project_id: number;
    lead_assignee_id: number | null; // From backend's TaskResponse
    contributor_ids: number[]; // From backend's TaskResponse
    required_role_ids: number[]; // From backend's TaskResponse
    sub_tasks: ApiSubTask[]; // From backend's TaskResponse
};


type WebSocketMessage = {
    type: "project_updated" | "project_ownership_transferred" | string;
    data: any; // The payload can be different for each message type (e.g., ProjectDetails)
};

type ApiSubTask = { id: number; description: string; is_completed: boolean; task_id: number };
type ApiMemberResponse = { id: number; user_id: number; full_name: string; role_id: number | null; };
type ApiJobRole = { id: number; role: string; };

// --- FRONTEND DATA STRUCTURES (What UI components use) ---
type Member = { id: number; name: string; avatarInitial: string; jobRoleId: number | null; userId: number; };
type JobRole = { id: number; name: string; };
type SubTask = { id: number; text: string; completed: boolean; }; // 'text' is the UI-facing name
type Task = {
    id: number;
    title: string;
    description?: string;
    status: 'ToDo' | 'InProgress' | 'InReview' | 'Done'; // Matches API
    leadAssigneeId: number | null;
    contributorIds: number[];
    subTasks: SubTask[];
    requiredRoleIds: number[];
};

const KANBAN_COLUMNS: Task['status'][] = ['ToDo', 'InProgress', 'InReview', 'Done'];

// --- MODAL COMPONENTS ---
const UnifiedTaskModal: Component<{
    isOpen: boolean;
    taskData?: Task | null;
    onClose: () => void;
    // --- UPDATED onSave signature to reflect full Task object ---
    onSave: (formData: Omit<Task, 'id'>, originalId?: number) => Promise<void>; // Make it async
    onDelete: (taskId: number) => Promise<void>; // Make it async
    members: Member[];
    jobRoles: JobRole[];
}> = (props) => {
    let modalRef: HTMLDivElement | undefined;
    const [title, setTitle] = createSignal('');
    const [description, setDescription] = createSignal('');
    const [status, setStatus] = createSignal<Task['status']>('ToDo');
    const [leadAssigneeId, setLeadAssigneeId] = createSignal<number | null>(null);
    const [contributorIds, setContributorIds] = createSignal<number[]>([]);
    const [subTasks, setSubTasks] = createSignal<SubTask[]>([]);
    const [newSubTaskText, setNewSubTaskText] = createSignal('');
    const [requiredRoleIds, setRequiredRoleIds] = createSignal<number[]>([]);

    createEffect(() => {
        if (props.isOpen) {
            const task = props.taskData;
            setTitle(task?.title ?? '');
            setDescription(task?.description ?? '');
            setStatus(task?.status ?? 'ToDo');
            // Ensure leadAssigneeId has a sensible default if members list is empty
            setLeadAssigneeId(task?.leadAssigneeId ?? (props.members.length > 0 ? props.members[0].id : null));
            setContributorIds(task?.contributorIds ?? []);
            setSubTasks(task?.subTasks ?? []);
            setRequiredRoleIds(task?.requiredRoleIds ?? []);
            gsap.fromTo(modalRef!, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
        }
    });

    const handleSave = async () => {
        if (!title()) return;
        const taskPayload: Omit<Task, 'id'> = {
            title: title(),
            description: description(),
            status: status(),
            leadAssigneeId: leadAssigneeId(),
            contributorIds: contributorIds(),
            subTasks: subTasks(),
            requiredRoleIds: requiredRoleIds()
        };
        await props.onSave(taskPayload, props.taskData?.id);
        props.onClose(); // Close only after successful save
    };

    const handleDelete = async () => {
        if (props.taskData) {
            await props.onDelete(props.taskData.id);
            props.onClose(); // Close only after successful delete
        }
    };

    const addSubTask = () => { if (newSubTaskText().trim() === '') return; setSubTasks(st => [...st, { id: Date.now(), text: newSubTaskText(), completed: false }]); setNewSubTaskText(''); };
    const toggleSubTask = (id: number) => { setSubTasks(sts => sts.map(st => st.id === id ? { ...st, completed: !st.completed } : st)); };
    const deleteSubTask = (id: number) => { setSubTasks(sts => sts.filter(st => st.id !== id)); };
    const subTaskProgress = () => { const subTasksArr = subTasks(); if (subTasksArr.length === 0) return 0; return (subTasksArr.filter(st => st.completed).length / subTasksArr.length) * 100; };
    const toggleContributor = (id: number) => { setContributorIds(ids => ids.includes(id) ? ids.filter(cid => cid !== id) : [...ids, id]); };
    const toggleRequiredRole = (id: number) => { setRequiredRoleIds(ids => ids.includes(id) ? ids.filter(rid => rid !== id) : [...ids, id]); };

    return (
        <Show when={props.isOpen}><div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={props.onClose}><div ref={modalRef} class="bg-gray-800 rounded-xl border border-gray-700/50 w-full max-w-4xl h-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}><div class="p-4 border-b border-gray-700/50 flex justify-between items-center flex-shrink-0"><input type="text" value={title()} onInput={e => setTitle(e.currentTarget.value)} placeholder="Enter Task Title..." class="text-xl md:text-2xl font-bold bg-transparent text-white w-full focus:outline-none"/><button onClick={props.onClose} class="p-2 rounded-full hover:bg-gray-700 cursor-pointer"><TbX/></button></div><div class="flex-1 flex flex-col lg:flex-row overflow-hidden"><div class="flex-1 p-6 space-y-6 overflow-y-auto"><div><label class="font-semibold text-gray-300">Description</label><textarea value={description()} onInput={e => setDescription(e.currentTarget.value)} placeholder="Add more details..." rows="4" class="w-full bg-gray-900/50 p-2 mt-2 rounded-lg"/></div><div><div class="flex justify-between items-center mb-2"><label class="font-semibold text-gray-300">Sub-tasks</label><span class="text-sm text-gray-400">{subTaskProgress().toFixed(0)}% Complete</span></div><div class="w-full bg-gray-700 rounded-full h-1.5 mb-3"><div class="bg-blue-600 h-1.5 rounded-full" style={{ width: `${subTaskProgress()}%` }}></div></div><div class="space-y-2 max-h-48 overflow-y-auto pr-2">
        <For each={subTasks()}>{sub => <div class="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50"><label class="flex items-center space-x-3 cursor-pointer"><input type="checkbox" checked={sub.completed} onChange={() => toggleSubTask(sub.id)}/><span classList={{"line-through text-gray-500": sub.completed}}>{sub.text}</span></label><button onClick={() => deleteSubTask(sub.id)} class="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><TbTrash size={16}/></button></div>}</For>
    </div><input type="text" value={newSubTaskText()} onInput={e => setNewSubTaskText(e.currentTarget.value)} onKeyDown={e => e.key === 'Enter' && addSubTask()} placeholder="+ Add a sub-task" class="w-full bg-transparent p-2 mt-2 text-white border-t border-gray-700 focus:outline-none"/></div></div><div class="w-full lg:w-80 lg:flex-shrink-0 border-t lg:border-t-0 lg:border-l border-gray-700/50 p-6 space-y-6 overflow-y-auto"><div class="flex items-center space-x-2"><TbLayoutKanban class="text-gray-400"/><label>Status</label><select value={status()} onChange={e => setStatus(e.currentTarget.value as Task['status'])} class="flex-1 bg-gray-700 p-1 rounded cursor-pointer"><For each={KANBAN_COLUMNS}>{s => <option value={s}>{s}</option>}</For></select></div><div class="flex items-center space-x-2"><TbUser class="text-gray-400"/><label>Lead</label><select value={leadAssigneeId() ?? 0} onChange={e => setLeadAssigneeId(parseInt(e.currentTarget.value))} class="flex-1 bg-gray-700 p-1 rounded cursor-pointer"><For each={props.members}>{m => <option value={m.id}>{m.name}</option>}</For></select></div><div><div class="flex items-center space-x-2 mb-2"><TbUsers class="text-gray-400"/><label>Contributors</label></div><div class="space-y-1"><For each={props.members.filter(m => m.id !== leadAssigneeId())}>{member => <label class="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-700/50 cursor-pointer"><input type="checkbox" checked={contributorIds().includes(member.id)} onChange={() => toggleContributor(member.id)}/><span>{member.name}</span></label>}</For></div></div><div><div class="flex items-center space-x-2 mb-2"><TbShieldCheck class="text-gray-400"/><label>Required Roles</label></div><div class="space-y-1"><For each={props.jobRoles}>{role => <label class="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-700/50 cursor-pointer"><input type="checkbox" checked={requiredRoleIds().includes(role.id)} onChange={() => toggleRequiredRole(role.id)}/><span>{role.name}</span></label>}</For></div></div></div></div><div class="p-4 border-t border-gray-700/50 flex justify-between items-center flex-shrink-0"><Show when={props.taskData}><button onClick={handleDelete} class="px-4 py-2 text-sm rounded-lg text-red-400 font-semibold hover:bg-red-500/10"><TbTrash class="inline-block mr-2" />Delete Task</button></Show><div /> <button onClick={handleSave} class="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer">Save & Close</button></div></div></div></Show>
    );
};


const TaskCard: Component<{
    task: Task;
    members: Member[];
    loggedInUser: Member;
    onLeave: (taskId: number) => void;
    onJoin: (taskId: number) => void;
    onEdit: (task: Task) => void;
    onArchive: (taskId: number) => void; // NEW
}> = (props) => {
    const getMemberById = (id: number | null) => props.members.find(m => m.id === id);
    const lead = () => getMemberById(props.task.leadAssigneeId);
    const contributors = () => props.task.contributorIds.map(id => getMemberById(id)).filter(Boolean) as Member[];
    const isUserJoined = () => props.task.leadAssigneeId === props.loggedInUser.id || props.task.contributorIds.includes(props.loggedInUser.id);
    const isUserContributor = () => isUserJoined() && props.task.leadAssigneeId !== props.loggedInUser.id;
    const canJoin = () => { const required = props.task.requiredRoleIds ?? []; return required.length === 0 || required.includes(props.loggedInUser.jobRoleId ?? -1); };

    return <div class="bg-gray-800 p-4 rounded-lg border border-gray-700/50 shadow-sm transition-all" classList={{ "ring-2 ring-green-500/50": isUserJoined() }}><p class="font-semibold text-white mb-3 pr-2">{props.task.title}</p><div class="flex justify-between items-center"><div class="flex items-center -space-x-2"><For each={contributors()}>{(c) => <div class="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-gray-800" title={c.name}>{c.avatarInitial}</div>}</For><Show when={lead()}><div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white ring-2 ring-gray-800" title={`Lead: ${lead()?.name}`}>{lead()?.avatarInitial}</div></Show><Show when={!isUserJoined()}><button onClick={() => props.onJoin(props.task.id)} disabled={!canJoin()} title={canJoin() ? "Join Task" : "You don't have the required role"} class="w-8 h-8 rounded-full bg-gray-700 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-400 transition-all disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600 enabled:hover:bg-green-500/10 enabled:hover:border-green-500 enabled:hover:text-green-400 cursor-pointer"><TbUserPlus size={18}/></button></Show><Show when={isUserContributor()}><button onClick={() => props.onLeave(props.task.id)} title="Leave Task" class="w-8 h-8 rounded-full bg-red-500/10 border-2 border-dashed border-red-500/50 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:border-red-500 cursor-pointer"><TbLogout size={18}/></button></Show></div>
                        <Show when={props.task.status === 'Done'}>
                        <button onClick={() => props.onArchive(props.task.id)} class="p-2 text-gray-400 rounded-md hover:bg-gray-700 hover:text-green-400 cursor-pointer" title="Archive Task">
                            <TbArchive size={18}/>
                        </button>
                    </Show>
    <button onClick={() => props.onEdit(props.task)} class="flex items-center space-x-2 p-2 text-gray-400 rounded-md hover:bg-gray-700 hover:text-white cursor-pointer" title="Edit Task"><TbPencil size={18}/></button></div></div>
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
            <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div ref={modalRef} class="bg-gray-800 rounded-xl p-8 border w-full max-w-md text-center"
                     classList={{ "border-red-500/30": isError(), "border-green-500/30": !isError() }}>
                    <div class="mx-auto w-16 h-16 flex items-center justify-center rounded-full mb-4"
                         classList={{ "bg-red-500/10": isError(), "bg-green-500/10": !isError() }}>
                        <Show when={isError()} fallback={<TbCheck class="w-8 h-8 text-green-500" />}>
                            <TbAlertTriangle class="w-8 h-8 text-red-500" />
                        </Show>
                    </div>
                    <h2 class="text-2xl font-bold text-white">{isError() ? 'An Error Occurred' : 'Success'}</h2>
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

// --- MAIN PAGE COMPONENT ---
const ProjectTasksPage: Component = () => {
    const params = useParams();
    const { user: authUser } = useAuth();
    let ws: WebSocket | null = null;

    const [tasks, setTasks] = createSignal<Task[]>([]);
    const [members, setMembers] = createSignal<Member[]>([]);
    const [jobRoles, setJobRoles] = createSignal<JobRole[]>([]);
    const [isLoading, setIsLoading] = createSignal(true);
    const [error, setError] = createSignal<string | null>(null);
    const [searchText, setSearchText] = createSignal('');
    const [roleFilter, setRoleFilter] = createSignal(0);
    const [assigneeFilter, setAssigneeFilter] = createSignal(0);
    const [isModalOpen, setModalOpen] = createSignal(false);
    const [selectedTask, setSelectedTask] = createSignal<Task | null>(null);

    const [isNotificationModalOpen, setNotificationModalOpen] = createSignal(false);
    const [notificationMessage, setNotificationMessage] = createSignal('');
    const [notificationType, setNotificationType] = createSignal<'success' | 'error'>('error');

    const [isConfirmModalOpen, setConfirmModalOpen] = createSignal(false);
    const [confirmModalData, setConfirmModalData] = createSignal<{
        title: string;
        message: string;
        onConfirm: () => Promise<void>;
    } | null>(null);
    const [isSubmitting, setIsSubmitting] = createSignal(false); // For modal actions


    const loggedInUserMemberInfo = createMemo(() => members().find(m => m.userId === authUser()?.id));

    // Helper to map API Task to Frontend Task
    const mapApiTaskToFrontend = (apiTask: ApiTaskResponse): Task => ({
        id: apiTask.id,
        title: apiTask.title,
        description: apiTask.description || undefined,
        status: apiTask.status,
        leadAssigneeId: apiTask.lead_assignee_id,
        contributorIds: apiTask.contributor_ids || [],
        subTasks: (apiTask.sub_tasks || []).map(st => ({ id: st.id, text: st.description, completed: st.is_completed })),
        requiredRoleIds: apiTask.required_role_ids || [],
    });

    // --- FIX #1: Extract the data fetching logic into its own function ---
    const fetchAllData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [tasksData, membersData, rolesData] = await Promise.all([
                sendRequest<ApiTaskResponse[]>(`/projects/${params.project_id}/tasks`), // Use ApiTaskResponse
                sendRequest<ApiMemberResponse[]>(`/projects/${params.project_id}/members`),
                sendRequest<ApiJobRole[]>(`/projects/${params.project_id}/roles`),
            ]);
            
            setTasks(tasksData.map(t => ({ id: t.id, title: t.title, description: t.description || undefined, status: t.status, leadAssigneeId: t.lead_assignee_id, contributorIds: t.contributor_ids || [], subTasks: (t.sub_tasks || []).map(st => ({ id: st.id, text: st.description, completed: st.is_completed })), requiredRoleIds: t.required_role_ids || [] })));
            setMembers(membersData.map(m => ({ id: m.id, name: m.full_name, avatarInitial: m.full_name.split(' ').map(n => n[0]).join('').toUpperCase(), jobRoleId: m.role_id, userId: m.user_id })));
            setJobRoles(rolesData.map(r => ({ id: r.id, name: r.role })));
        } catch (err: any) {
            setError(err.message || "Failed to load project data.");
        } finally {
            setIsLoading(false);
        }
    };


    onMount(() => {
        fetchAllData();

        // --- WebSocket Connection ---
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/projects/${params.project_id}/ws`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => { console.log(`WebSocket connected for project ${params.project_id}`); };

        ws.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                console.log("WebSocket message received:", message);

                if (message.type === "task_created") {
                    const newTaskData: ApiTaskResponse = message.data;
                    const mappedNewTask = mapApiTaskToFrontend(newTaskData);
                    setTasks(prevTasks => [...prevTasks, mappedNewTask]);
                } else if (message.type === "task_updated" || message.type === "task_unarchived") {
                    const updatedTaskData: ApiTaskResponse = message.data;
                    const mappedUpdatedTask = mapApiTaskToFrontend(updatedTaskData);
                    // If it was unarchived, add it back to the list
                    setTasks(prevTasks => {
                        if (prevTasks.some(t => t.id === mappedUpdatedTask.id)) {
                            return prevTasks.map(t => t.id === mappedUpdatedTask.id ? mappedUpdatedTask : t);
                        }
                        return [...prevTasks, mappedUpdatedTask];
                    });
                } else if (message.type === "task_deleted" || message.type === "task_archived") { // FIX: Also handle task_archived
                    const { task_id } = message.data;
                    setTasks(prevTasks => prevTasks.filter(t => t.id !== task_id));
                }
                
            } catch (e) {
                console.error("Failed to parse WebSocket message:", e);
            }
        };

        ws.onerror = (error) => { console.error("WebSocket error:", error); };
        ws.onclose = () => { console.log(`WebSocket disconnected for project ${params.project_id}`); };
    });

    onCleanup(() => {
        if (ws) {
            ws.close();
        }
    });




    const handleArchiveTask = (taskId: number) => {
        setConfirmModalData({
            title: "Archive Task?",
            message: "Are you sure you want to archive this task? It will be moved to the project archives.",
            onConfirm: async () => {
                // --- FIX: Close the modal FIRST ---
                setConfirmModalOpen(false);
                
                // You can still use isSubmitting for a global loading state if desired,
                // but the modal that uses it is now closed.
                setIsSubmitting(true);
                
                try {
                    // Expect a void response
                    await sendRequest<void>(`/tasks/${taskId}/archive`, { method: 'POST' });
                    
                    // The WebSocket will update the UI for other users.
                    // For the current user, an immediate refetch is best.
                    await fetchAllData();

                    // Show success notification
                    setNotificationMessage("Task has been successfully archived.");
                    setNotificationType('success');
                    setNotificationModalOpen(true);
                } catch (err: any) {
                    setNotificationMessage(err.message || 'Error archiving task.');
                    setNotificationType('error');
                    setNotificationModalOpen(true);
                } finally {
                    // This will now correctly turn off any global loading indicators.
                    setIsSubmitting(false);
                }
            }
        });
        setConfirmModalOpen(true);
    };


    const handleOpenUnifiedTaskModal = (taskToEdit: Task | null) => { setSelectedTask(taskToEdit); setModalOpen(true); };

    const handleSaveTask = async (formData: Omit<Task, 'id'>, originalId?: number) => {
        setModalOpen(false); // Close modal immediately to give feedback on loading
        const originalTask = tasks().find(t => t.id === originalId); // Original state for diffing
        
        try {
            // Container for all API calls to run in parallel
            const apiCalls: Promise<any>[] = [];

            if (originalId && originalTask) { // --- UPDATE EXISTING TASK LOGIC ---
                // 1. Update main task details (title, description, status)
                const mainTaskPayload = { 
                    title: formData.title, 
                    description: formData.description, 
                    status: formData.status, // Uses formData.status
                    lead_assignee_id: formData.leadAssigneeId
                };
                apiCalls.push(sendRequest<ApiTaskResponse>(`/tasks/${originalId}`, { method: 'PATCH', body: mainTaskPayload }));
                
                // 2. Synchronize Subtasks (create, update, delete)
                const originalSubtasks = originalTask.subTasks;
                const finalSubtasks = formData.subTasks;

                // New subtasks (temporary IDs > current time in ms)
                const newSubtasks = finalSubtasks.filter(st => st.id > Date.now() - 1000000000); // More robust temp ID check
                if (newSubtasks.length > 0) {
                    const bulkPayload = newSubtasks.map(st => ({ description: st.text, is_completed: st.completed }));
                    apiCalls.push(sendRequest(`/tasks/${originalId}/subtasks/bulk`, { method: 'POST', body: bulkPayload }));
                }

                // Deleted subtasks
                const deletedSubtaskIds = originalSubtasks.filter(ost => !finalSubtasks.some(fst => fst.id === ost.id)).map(st => st.id);
                apiCalls.push(...deletedSubtaskIds.map(id => sendRequest(`/subtasks/${id}`, { method: 'DELETE' })));

                // Updated subtasks (existing IDs, but text or completed status changed)
                const updatedSubtasks = finalSubtasks.filter(fst => {
                    const original = originalSubtasks.find(ost => ost.id === fst.id);
                    return original && (original.text !== fst.text || original.completed !== fst.completed);
                });
                apiCalls.push(...updatedSubtasks.map(st => sendRequest(`/subtasks/${st.id}`, { 
                    method: 'PATCH', 
                    body: { 
                        description: st.text, 
                        is_completed: st.completed 
                    } // Ensure 'text' maps to 'description' and 'completed' to 'is_completed'
                })));
                // 3. Synchronize Lead Assignee (Hypothetical: if `lead_assignee_id` is patchable directly on Task)
                // If lead_assignee_id is directly on Task table and you want to patch it
                if (formData.leadAssigneeId !== originalTask.leadAssigneeId) {
                    // NOTE: Your backend's `update_task` handler and `UpdateTaskPayload`
                    // MUST be updated to accept `lead_assignee_id`.
                    // Example: PATCH /tasks/:id { lead_assignee_id: N }
                    // If not, you might need a separate endpoint like:
                    // apiCalls.push(sendRequest(`/tasks/${originalId}/assign-lead`, { method: 'POST', body: { member_id: formData.leadAssigneeId } }));
                    // For now, assuming `update_task` is extended to handle it.
                    apiCalls.push(sendRequest(`/tasks/${originalId}`, { method: 'PATCH', body: { lead_assignee_id: formData.leadAssigneeId } }));
                }


                // 4. Synchronize Contributors (add/remove)
                const originalContributorIds = new Set(originalTask.contributorIds);
                const finalContributorIds = new Set(formData.contributorIds);

                const contributorsToAdd = [...finalContributorIds].filter(id => !originalContributorIds.has(id));
                const contributorsToRemove = [...originalContributorIds].filter(id => !finalContributorIds.has(id));

                apiCalls.push(...contributorsToAdd.map(id => sendRequest(`/tasks/${originalId}/contributors`, { method: 'POST', body: { member_id: id } })));
                // NOTE: Your backend needs a DELETE route for contributors: `DELETE /tasks/:taskId/contributors/:memberId`
                // OR `DELETE /tasks/:taskId/contributors` with `body: { member_id: id }`
                apiCalls.push(...contributorsToRemove.map(id => sendRequest(`/tasks/${originalId}/contributors`, { method: 'DELETE', body: { member_id: id } })));


                // 5. Synchronize Required Roles (add/remove)
                const originalRequiredRoleIds = new Set(originalTask.requiredRoleIds);
                const finalRequiredRoleIds = new Set(formData.requiredRoleIds);

                const rolesToAdd = [...finalRequiredRoleIds].filter(id => !originalRequiredRoleIds.has(id));
                const rolesToRemove = [...originalRequiredRoleIds].filter(id => !finalRequiredRoleIds.has(id));

                apiCalls.push(...rolesToAdd.map(id => sendRequest(`/tasks/${originalId}/required-roles`, { method: 'POST', body: { role_id: id } })));
                // NOTE: Your backend needs a DELETE route for required roles: `DELETE /tasks/:taskId/required-roles/:roleId`
                // OR `DELETE /tasks/:taskId/required-roles` with `body: { role_id: id }`
                apiCalls.push(...rolesToRemove.map(id => sendRequest(`/tasks/${originalId}/required-roles`, { method: 'DELETE', body: { role_id: id } })));


            } else { // --- CREATE NEW TASK LOGIC ---
                // 1. Create main task
                const payload = { 
                    title: formData.title, 
                    description: formData.description, 
                    status: formData.status 
                };
                const newTaskResponse = await sendRequest<ApiTaskResponse>(`/projects/${params.project_id}/tasks`, { method: 'POST', body: payload });
                const newTaskId = newTaskResponse.id;

                // 2. Bulk create subtasks for the new task
                if (formData.subTasks.length > 0) {
                    const bulkPayload = formData.subTasks.map(st => ({ description: st.text, is_completed: st.completed }));
                    apiCalls.push(sendRequest(`/tasks/${newTaskId}/subtasks/bulk`, { method: 'POST', body: bulkPayload }));
                }

                // 3. Add lead assignee, contributors, required roles for the new task (if any)
                if (formData.leadAssigneeId) {
                    apiCalls.push(sendRequest(`/tasks/${newTaskId}`, { method: 'PATCH', body: { lead_assignee_id: formData.leadAssigneeId } }));
                }

                // 4. Add contributors
                apiCalls.push(...formData.contributorIds.map(id => sendRequest(`/tasks/${newTaskId}/contributors`, { method: 'POST', body: { member_id: id } })));
                
                // 5. Add required roles
                apiCalls.push(...formData.requiredRoleIds.map(id => sendRequest(`/tasks/${newTaskId}/required-roles`, { method: 'POST', body: { role_id: id } })));
            }
            
            // Wait for all parallel API calls to complete
            await Promise.all(apiCalls);
            
            // --- Re-fetch all data from the server to ensure consistency and display latest state ---
            await fetchAllData(); 
            
        } catch (err:any) { 
            setNotificationMessage(err.message || 'Error saving task.');
            setNotificationType('error');
            setNotificationModalOpen(true);
        }
    };
    
    
    // Apply the same fix to handleDeleteTask
    const handleDeleteTask = (taskId: number) => {
        setConfirmModalData({
            title: "Delete Task?",
            message: "Are you sure you want to permanently delete this task? This action cannot be undone.",
            onConfirm: async () => {
                // --- FIX: Close modal FIRST, then start submitting ---
                setConfirmModalOpen(false); // Close the modal immediately
                setModalOpen(false); // Close the edit modal if it's open
                setIsSubmitting(true);
                
                try {
                    await sendRequest<void>(`/tasks/${taskId}`, { method: 'DELETE' });
                    // WebSocket will handle the update.
                } catch (err: any) {
                    setNotificationMessage(err.message || 'Error deleting task.');
                    setNotificationType('error');
                    setNotificationModalOpen(true);
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
        setConfirmModalOpen(true);
    };



    const handleJoinTask = async (taskId: number) => {
        const member = loggedInUserMemberInfo();
        if (!member) return;

        try {
            await sendRequest<void>(`/tasks/${taskId}/contributors`, { 
                method: 'POST', 
                body: { member_id: member.id } 
            });

            await fetchAllData(); 
        } catch (err: any) {
            setNotificationMessage(err.message || 'Error joining task.');
            setNotificationType('error');
            setNotificationModalOpen(true);
        }
    };

    const handleLeaveTask = async (taskId: number) => {
        const member = loggedInUserMemberInfo();
        if (!member) return;
        
        try {
            await sendRequest<void>(`/tasks/${taskId}/contributors`, { 
                method: 'DELETE', 
                body: { member_id: member.id } 
            });
            // FIX: Re-fetch data for immediate UI update for the current user
            await fetchAllData(); 
        } catch (err: any) {
            setNotificationMessage(err.message || 'Error leaving task.');
            setNotificationType('error');
            setNotificationModalOpen(true);
        }
    };

    const processedTasks = createMemo(() => {
        if (isLoading() || !loggedInUserMemberInfo()) return { 'ToDo': [], 'InProgress': [], 'InReview': [], 'Done': [] };
        const user = loggedInUserMemberInfo()!;
        let filtered = tasks();
        if (searchText().trim() !== '') { filtered = filtered.filter(t => t.title.toLowerCase().includes(searchText().toLowerCase())); }
        if (roleFilter() !== 0) { filtered = filtered.filter(t => t.requiredRoleIds.includes(roleFilter())); }
        if (assigneeFilter() !== 0) { filtered = filtered.filter(t => t.leadAssigneeId === assigneeFilter() || t.contributorIds.includes(assigneeFilter())); }
        const isUserOnTask = (task: Task) => task.leadAssigneeId === user.id || task.contributorIds.includes(user.id);
        const sorted = filtered.sort((a, b) => (isUserOnTask(b) ? 1 : 0) - (isUserOnTask(a) ? 1 : 0));
        const groupedByStatus: Record<Task['status'], Task[]> = { 'ToDo': [], 'InProgress': [], 'InReview': [], 'Done': [] };
        for (const task of sorted) { groupedByStatus[task.status].push(task); }
        return groupedByStatus;
    });

    const formatStatusForDisplay = (status: Task['status']) => {
        switch (status) {
            case 'ToDo': return 'To Do';
            case 'InProgress': return 'In Progress';
            case 'InReview': return 'In Review';
            default: return status;
        }
    };

    return (
        <ProjectDashboardLayout activePage="Tasks" username={authUser()?.email || ''} projectId={params.project_id}>
            <Show when={!isLoading()} fallback={<div class="flex items-center justify-center p-10"><TbLoader class="w-10 h-10 animate-spin text-blue-500" /></div>}>
                <Show when={!error()} fallback={<div class="p-4 bg-red-500/10 text-red-300 rounded-lg text-center">{error()}</div>}>
                    <UnifiedTaskModal isOpen={isModalOpen()} taskData={selectedTask()} onClose={() => setModalOpen(false)} onSave={handleSaveTask} onDelete={handleDeleteTask} members={members()} jobRoles={jobRoles()} />
                    <ConfirmationModal
                        isOpen={isConfirmModalOpen()}
                        onClose={() => setConfirmModalOpen(false)}
                        onConfirm={() => confirmModalData()?.onConfirm()}
                        title={confirmModalData()?.title || ''}
                        message={confirmModalData()?.message || ''}
                        isSubmitting={isSubmitting()}
                    />
                    <NotificationModal
                        isOpen={isNotificationModalOpen()}
                        onClose={() => setNotificationModalOpen(false)}
                        type={notificationType()}
                        message={notificationMessage()}
                    />
                    <div class="flex flex-col h-full">
                        <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6"><h1 class="text-3xl font-bold text-white">Project Tasks</h1><button onClick={() => handleOpenUnifiedTaskModal(null)} class="w-full md:w-auto flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer"><TbPlus class="w-5 h-5 mr-2" /><span>New Task</span></button></div>
                        <div class="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6 p-4 bg-gray-900/50 rounded-xl border border-gray-700/50"><div class="relative flex-grow"><TbSearch class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" placeholder="Search by task title..." onInput={e => setSearchText(e.currentTarget.value)} class="w-full bg-gray-800 rounded-lg pl-10 pr-4 py-2 text-white border border-transparent focus:ring-2 focus:ring-blue-500"/></div><select onChange={e => setRoleFilter(parseInt(e.currentTarget.value))} class="w-full md:w-auto bg-gray-800 rounded-lg px-4 py-2 text-white border border-transparent focus:ring-2 focus:ring-blue-500 cursor-pointer"><option value="0">All Roles</option><For each={jobRoles()}>{role => <option value={role.id}>{role.name}</option>}</For></select><select onChange={e => setAssigneeFilter(parseInt(e.currentTarget.value))} class="w-full md:w-auto bg-gray-800 rounded-lg px-4 py-2 text-white border border-transparent focus:ring-2 focus:ring-blue-500 cursor-pointer"><option value="0">All Members</option><For each={members()}>{member => <option value={member.id}>{member.name}</option>}</For></select></div>
                        <div class="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <For each={KANBAN_COLUMNS}>{(status) => {
                                const columnTasks = () => processedTasks()[status];
                                return (<div class="bg-gray-900/50 p-4 rounded-xl flex flex-col">
                                <h2 class="text-lg font-semibold text-white mb-4 px-2">
                                    {formatStatusForDisplay(status)} ({columnTasks().length})
                                </h2>
                                <div class="space-y-4"><For each={columnTasks()} fallback={<div class="text-center text-sm text-gray-500 italic p-4">No tasks in this column.</div>}>{(task) => <TaskCard task={task} members={members()} loggedInUser={loggedInUserMemberInfo()!} onJoin={handleJoinTask} onLeave={handleLeaveTask} onEdit={handleOpenUnifiedTaskModal} onArchive={handleArchiveTask} /> }</For></div></div>);
                            }}</For>
                        </div>
                    </div>
                </Show>
            </Show>
        </ProjectDashboardLayout>
    );
};

export default ProjectTasksPage;
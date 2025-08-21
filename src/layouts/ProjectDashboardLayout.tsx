// src/layouts/ProjectDashboardLayout.tsx (FINAL CORRECTED VERSION)

import { type Component, type JSX, createSignal, Show, createEffect, For, onMount } from "solid-js";
import ProjectSidebar from "../components/Dashboard/Project/ProjectSidebar";
import ProjectTopBar from "../components/Dashboard/Project/ProjectTopBar";
import { TbX, TbUser, TbAt, TbPencil, TbLink, TbCopy, TbCheck, TbUsers, TbLayoutKanban, TbShieldCheck, TbListCheck, TbAlertTriangle, TbLoader, TbTrash } from "solid-icons/tb"; // All icons for modals
import { gsap } from "gsap";
import { useNavigate, useParams } from "@solidjs/router";
import { sendRequest } from "../utils/SendRequest";

// --- API DATA STRUCTURES (What Rust sends) ---
type ApiUserResponse = {
    id: number;
    email: string;
        full_name?: string;
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
    role: string; // Backend calls it 'role'
    description: string;
    project_id: number;
};


type ApiPermissionTier = {
    id: number;
    permission: string; // e.g., "Admin", "Editor", "Viewer"
};


type ApiTaskResponse = {
    id: number;
    title: string;
    description: string | null;
    status: 'ToDo' | 'InProgress' | 'InReview' | 'Done';
    project_id: number;
    lead_assignee_id: number | null;
    contributor_ids: number[];
    required_role_ids: number[];
    sub_tasks: { id: number; description: string; is_completed: boolean; task_id: number }[];
};
type PermissionTier = ApiPermissionTier; // Use ApiPermissionTier directly for frontend


// --- FRONTEND DATA STRUCTURES (Mapped from API for UI convenience) ---

type Member = { id: number; name: string; avatarInitial: string; jobRoleId: number | null; userId: number; };
type JobRole = { id: number; name: string; };
type SubTask = { id: number; text: string; completed: boolean; }; // 'text' is the UI-facing name
type Task = { // Consolidated Task Type (Frontend View)
    id: number;
    title: string;
    description?: string;
    status: 'ToDo' | 'InProgress' | 'InReview' | 'Done';
    leadAssigneeId: number | null;
    contributorIds: number[];
    subTasks: SubTask[];
    requiredRoleIds: number[];
};

const KANBAN_COLUMNS: Task['status'][] = ['ToDo', 'InProgress', 'InReview', 'Done']; // Re-use from tasks



// --- MODAL COMPONENTS (DEFINED OUTSIDE OF ProjectDashboardLayout FUNCTION) ---

// --- MODAL COMPONENTS ---

// 1. Invite Modal (Updated to fetch and use real roles, and call API for link)
const InviteModal: Component<{ 
    isOpen: boolean; 
    onClose: () => void; 
    projectId: string; // Pass project ID
    availablePermissionTiers: PermissionTier[]; // Pass fetched tiers
}> = (props) => {
    let modalRef: HTMLDivElement | undefined;
    // Store selected role by its ID, default to 0 or first available
    const [selectedRoleId, setSelectedRoleId] = createSignal<number>(0); 
    const [inviteLink, setInviteLink] = createSignal('');
    const [copied, setCopied] = createSignal(false);
    const [isGeneratingLink, setIsGeneratingLink] = createSignal(false);
    const [linkError, setLinkError] = createSignal<string | null>(null);

    // Effect to update selectedRoleId when availablePermissionTiers loads
    createEffect(() => {
        if (props.isOpen && props.availablePermissionTiers.length > 0 && selectedRoleId() === 0) {
            // Set default to 'Member' if available, otherwise first tier
            const defaultMemberTier = props.availablePermissionTiers.find(t => t.permission === 'Member');
            setSelectedRoleId(defaultMemberTier?.id || props.availablePermissionTiers[0].id);
        }
    });

    // Effect to regenerate invite link when modal opens or selectedRole changes
    createEffect(async () => {
        if (props.isOpen && selectedRoleId() !== 0) {
            setIsGeneratingLink(true);
            setLinkError(null);
            setCopied(false); // Reset copied state when modal opens or role changes
            
            try {
                // --- NEW API CALL TO GENERATE INVITE LINK ---
                const response = await sendRequest<{ invite_url: string }>(
                    `/projects/${props.projectId}/invites`,
                    {
                        method: 'POST',
                        body: { role_id: selectedRoleId() }, // Send the selected role ID
                    }
                );
                setInviteLink(response.invite_url);
            } catch (err: any) {
                setLinkError(err.message || "Failed to generate invite link.");
                setInviteLink("Error generating link.");
            } finally {
                setIsGeneratingLink(false);
            }
            gsap.fromTo(modalRef!, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
        }
    });

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Show when={props.isOpen}>
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
                <div ref={modalRef} class="bg-gray-800 rounded-xl p-8 border border-gray-700/50 w-full max-w-lg">
                    <div class="flex justify-between items-start mb-6">
                        <div><h2 class="text-2xl font-bold text-white">Invite members</h2><p class="text-gray-400 mt-1">Share this link with anyone you want to add to the project.</p></div>
                        <button onClick={props.onClose} class="p-2 -mt-2 -mr-2 rounded-full hover:bg-gray-700 cursor-pointer"><TbX size={24} /></button>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <label for="permission-tier" class="block text-sm font-medium text-gray-300 mb-1">Set default permission tier</label>
                            <select 
                                id="permission-tier" 
                                value={selectedRoleId()} 
                                onChange={(e) => setSelectedRoleId(parseInt(e.currentTarget.value))} 
                                class="w-full bg-gray-900 border-gray-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                disabled={isGeneratingLink()} // Disable while generating link
                            >
                                <For each={props.availablePermissionTiers}>
                                    {(tier) => <option value={tier.id}>{tier.permission}</option>}
                                </For>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Invite Link</label>
                            <div class="flex items-center gap-2">
                                <div class="relative flex-grow">
                                    <TbLink class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={isGeneratingLink() ? "Generating..." : inviteLink()} 
                                        class="w-full bg-gray-900/50 rounded-lg pl-10 pr-4 py-2.5 text-gray-300 font-mono"
                                        classList={{ "text-red-400": !!linkError() }}
                                    />
                                </div>
                                <button 
                                    onClick={handleCopyLink} 
                                    class="px-4 py-2.5 rounded-lg font-semibold text-white transition-colors duration-200 cursor-pointer" 
                                    classList={{"bg-blue-600 hover:bg-blue-700": !copied(),"bg-green-600": copied()}}
                                    disabled={copied() || isGeneratingLink() || !!linkError()} // Disable if copied, generating, or error
                                >
                                    <Show when={!copied() && !isGeneratingLink()} fallback={
                                        <Show when={isGeneratingLink()} fallback={<><TbCheck class="mr-2"/>Copied!</>}>
                                            <TbLoader class="animate-spin mr-2"/>
                                        </Show>
                                    }>
                                        <><TbCopy class="mr-2"/>Copy link</>
                                    </Show>
                                </button>
                            </div>
                            <Show when={linkError()}><p class="text-red-400 text-sm mt-1">{linkError()}</p></Show>
                        </div>
                    </div>
                    <div class="mt-6 text-center">
                        <button onClick={props.onClose} class="px-6 py-2 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600 cursor-pointer">Done</button>
                    </div>
                </div>
            </div>
        </Show>
    );
};

// 2. Unified Task Modal - RESPONSIVE VERSION (Now accepts onSave and onDelete as async)
const UnifiedTaskModal: Component<{
    isOpen: boolean;
    taskData?: Task | null;
    onClose: () => void;
    onSave: (formData: Omit<Task, 'id'>, originalId?: number) => Promise<void>; // Make it async
    onDelete: (taskId: number) => Promise<void>; // Make it async
    membersData: Member[]; // Passed dynamically
    jobRolesData: JobRole[]; // Passed dynamically
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
            // Ensure sensible default for lead assignee if membersData is empty
            setLeadAssigneeId(task?.leadAssigneeId ?? (props.membersData.length > 0 ? props.membersData[0].id : null));
            setContributorIds(task?.contributorIds ?? []);
            setSubTasks(task?.subTasks ?? []);
            setRequiredRoleIds(task?.requiredRoleIds ?? []);
            gsap.fromTo(modalRef!, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
        }
    });

    const handleSave = async () => { // Make this async
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
        props.onClose();
    };

    const handleDelete = async () => { // Make this async
        if (props.taskData) {
            await props.onDelete(props.taskData.id);
            props.onClose();
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
    </div><input type="text" value={newSubTaskText()} onInput={e => setNewSubTaskText(e.currentTarget.value)} onKeyDown={e => e.key === 'Enter' && addSubTask()} placeholder="+ Add a sub-task" class="w-full bg-transparent p-2 mt-2 text-white border-t border-gray-700 focus:outline-none"/></div></div><div class="w-full lg:w-80 lg:flex-shrink-0 border-t lg:border-t-0 lg:border-l border-gray-700/50 p-6 space-y-6 overflow-y-auto"><div class="flex items-center space-x-2"><TbLayoutKanban class="text-gray-400"/><label>Status</label><select value={status()} onChange={e => setStatus(e.currentTarget.value as Task['status'])} class="flex-1 bg-gray-700 p-1 rounded cursor-pointer"><For each={KANBAN_COLUMNS}>{s => <option value={s}>{s}</option>}</For></select></div><div class="flex items-center space-x-2"><TbUser class="text-gray-400"/><label>Lead</label><select value={leadAssigneeId() ?? 0} onChange={e => setLeadAssigneeId(parseInt(e.currentTarget.value))} class="flex-1 bg-gray-700 p-1 rounded cursor-pointer"><For each={props.membersData}>{m => <option value={m.id}>{m.name}</option>}</For></select></div><div><div class="flex items-center space-x-2 mb-2"><TbUsers class="text-gray-400"/><label>Contributors</label></div><div class="space-y-1"><For each={props.membersData.filter(m => m.id !== leadAssigneeId())}>{member => <label class="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-700/50 cursor-pointer"><input type="checkbox" checked={contributorIds().includes(member.id)} onChange={() => toggleContributor(member.id)}/><span>{member.name}</span></label>}</For></div></div><div><div class="flex items-center space-x-2 mb-2"><TbShieldCheck class="text-gray-400"/><label>Required Roles</label></div><div class="space-y-1"><For each={props.jobRolesData}>{role => <label class="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-700/50 cursor-pointer"><input type="checkbox" checked={requiredRoleIds().includes(role.id)} onChange={() => toggleRequiredRole(role.id)}/><span>{role.name}</span></label>}</For></div></div></div></div><div class="p-4 border-t border-gray-700/50 flex justify-between items-center flex-shrink-0"><Show when={props.taskData}><button onClick={handleDelete} class="px-4 py-2 text-sm rounded-lg text-red-400 font-semibold hover:bg-red-500/10"><TbTrash class="inline-block mr-2" />Delete Task</button></Show><div /> <button onClick={handleSave} class="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer">Save & Close</button></div></div></div></Show>
    );
};


// 3. Account Settings Modal (Updated to take ApiUserResponse)
const AccountSettingsModal: Component<{
    isOpen: boolean;
    accountData: ApiUserResponse | null;
    onClose: () => void;
    onSave: (data: { full_name?: string; email?: string }) => Promise<void>;
    isSaving: boolean;
}> = (props) => {
    let modalRef: HTMLDivElement | undefined;
    const [fullName, setFullName] = createSignal(''); // Changed to fullName for clarity
    const [email, setEmail] = createSignal(''); // This is read-only from ApiUserResponse

    createEffect(() => {
        if (props.isOpen && props.accountData) {
            setFullName(props.accountData.full_name ?? ''); // Use full_name from API
            setEmail(props.accountData.email);
            gsap.fromTo(modalRef!, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
        }
    });

    const handleSave = async (e: Event) => {
        e.preventDefault();
        // Send only `full_name` as `email` is usually not editable via this modal
        await props.onSave({ full_name: fullName() });
    };

    return (
        <Show when={props.isOpen && props.accountData}>
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur" onClick={props.onClose}>
                <form ref={modalRef} onSubmit={handleSave} class="bg-gray-800 rounded-xl p-8 border border-gray-700/50 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                    <div class="flex justify-between items-start mb-6">
                        <div><h2 class="text-2xl font-bold text-white">Account Settings</h2><p class="text-gray-400 mt-1">Manage your personal profile within this project context.</p></div>
                        <button type="button" onClick={props.onClose} class="p-2 -mt-2 -mr-2 rounded-full hover:bg-gray-700 cursor-pointer"><TbX size={24} /></button>
                    </div>
                    <div class="space-y-4">
                        <div><label class="block text-sm font-medium text-gray-300 mb-1">Email</label><div class="relative"><TbAt class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/><input type="email" value={email()} disabled class="w-full bg-gray-700/50 border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-400 cursor-not-allowed"/></div></div>
                        <div><label for="name" class="block text-sm font-medium text-gray-300 mb-1">Full Name</label><div class="relative"><TbUser class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/><input id="name" type="text" value={fullName()} onInput={e => setFullName(e.currentTarget.value)} required class="w-full bg-gray-900 border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500"/></div></div>
                    </div>
                    <div class="mt-8 flex justify-end">
                        <button type="submit" class="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 cursor-pointer" disabled={props.isSaving}>
                            <Show when={props.isSaving} fallback={<span>Save Changes</span>}><TbLoader class="animate-spin mr-2"/>Saving...</Show>
                        </button>
                    </div>
                </form>
            </div>
        </Show>
    );
};




// --- MAIN LAYOUT COMPONENT ---
interface ProjectDashboardLayoutProps {
    children: JSX.Element;
    activePage: "Tasks" | "Members" | "Roles" | "Archives" | "Settings" | "Account Settings" | "Dashboard";
    username: string; // From authUser?.email
    projectId: string; // From useParams
}

const ProjectDashboardLayout: Component<ProjectDashboardLayoutProps> = (props) => {
    const params = useParams();
    const navigate = useNavigate();

    // --- Global Modal States ---
    const [isInviteModalOpen, setInviteModalOpen] = createSignal(false);
    const [isTaskModalOpen, setTaskModalOpen] = createSignal(false);
    const [selectedTaskForModal, setSelectedTaskForModal] = createSignal<Task|null>(null);
    const [isAccountSettingsModalOpen, setAccountSettingsModalOpen] = createSignal(false);
    const [isSavingAccountSettings, setIsSavingAccountSettings] = createSignal(false);

    // Data to be passed to modals/top bar
    const [members, setMembers] = createSignal<Member[]>([]);
    const [jobRoles, setJobRoles] = createSignal<JobRole[]>([]);
    const [currentUserApiData, setCurrentUserApiData] = createSignal<ApiUserResponse | null>(null);
    // --- NEW: Permission tiers for InviteModal ---
    const [permissionTiers, setPermissionTiers] = createSignal<PermissionTier[]>([]);

    // Loading/Error for layout's data fetching
    const [isLoadingLayoutData, setIsLoadingLayoutData] = createSignal(true);
    const [layoutError, setLayoutError] = createSignal<string | null>(null);


    // --- Data Fetching for Layout ---
    const fetchLayoutData = async () => {
        setIsLoadingLayoutData(true);
        setLayoutError(null);
        try {
            const [membersData, rolesData, userData, tiersData] = await Promise.all([
                sendRequest<ApiMemberResponse[]>(`/projects/${params.project_id}/members`),
                sendRequest<ApiJobRole[]>(`/projects/${params.project_id}/roles`),
                sendRequest<ApiUserResponse>('/auth/me'),
                sendRequest<ApiPermissionTier[]>('/permission-tiers'), // --- NEW: Fetch permission tiers ---
            ]);
            
            setMembers(membersData.map(m => ({ id: m.id, name: m.full_name, avatarInitial: m.full_name.split(' ').map(n => n[0]).join('').toUpperCase(), jobRoleId: m.role_id, userId: m.user_id })));
            setJobRoles(rolesData.map(r => ({ id: r.id, name: r.role })));
            setCurrentUserApiData(userData);
            setPermissionTiers(tiersData); // Set permission tiers
        } catch (err: any) {
            console.error("Error fetching layout data:", err);
            setLayoutError(err.message || "Failed to load layout data.");
        } finally {
            setIsLoadingLayoutData(false);
        }
    };

    onMount(() => {
        fetchLayoutData();
    });


    // --- Global Event Handlers for Modals ---
    const handleSaveTaskInLayout = async (formData: Omit<Task, 'id'>, originalId?: number) => {
        // This is simplified. In a real app, you'd likely dispatch to a global store
        // or re-fetch tasks for the whole ProjectTasksPage.
        console.log("Task saved/updated (from layout):", formData, "Original ID:", originalId);
        // Simulate API call success/failure here for now if not connecting to real endpoint
        // You'll need to call your actual task API endpoints from here.
        // For example:
        try {
            if (originalId) {
                // PATCH task details
                const patchPayload = { title: formData.title, description: formData.description, status: formData.status, lead_assignee_id: formData.leadAssigneeId };
                await sendRequest<ApiTaskResponse>(`/tasks/${originalId}`, { method: 'PATCH', body: patchPayload });
                // Handle subtasks, contributors, roles (complex logic, might need to be split)
            } else {
                // POST new task
                const postPayload = { title: formData.title, description: formData.description, status: formData.status, project_id: parseInt(params.project_id) }; // Project ID needed for creation
                await sendRequest<ApiTaskResponse>(`/projects/${params.project_id}/tasks`, { method: 'POST', body: postPayload });
            }
            alert("Task saved successfully!");
        } catch (err: any) {
            alert(`Failed to save task: ${err.message}`);
        }
        setTaskModalOpen(false);
    };

    const handleDeleteTaskInLayout = async (taskId: number) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await sendRequest(`/tasks/${taskId}`, { method: 'DELETE' });
            alert("Task deleted successfully!");
        } catch (err: any) {
            alert(`Failed to delete task: ${err.message}`);
        }
        setTaskModalOpen(false);
    };


    const handleSaveAccountSettings = async (data: { full_name?: string; email?: string }) => {
        if (!currentUserApiData()) return;
        setIsSavingAccountSettings(true);
        try {
            // Assuming your backend has PATCH /users/:id endpoint for updating user profiles
            const updatedUser = await sendRequest<ApiUserResponse>(`/users/${currentUserApiData()!.id}`, {
                method: 'PATCH',
                body: data
            });
            setCurrentUserApiData(updatedUser); // Update local state
            alert("Account settings saved!");
            // Potentially refetch user in AuthContext too if it holds more details
            // useAuth().refetchUser();
        } catch (err: any) {
            alert(`Failed to save account settings: ${err.message}`);
        } finally {
            setIsSavingAccountSettings(false);
            setAccountSettingsModalOpen(false);
        }
    };

    const handleCreateNewTaskAndNavigate = () => {
        setSelectedTaskForModal(null); // Ensure modal opens for new task
        setTaskModalOpen(true); // Open the modal
        // Navigate to the tasks page. If already on tasks page, it just opens modal.
        // If on another project page, it navigates AND opens.
        if (props.activePage !== "Tasks") {
            navigate(`/dashboard/project/${params.project_id}/tasks`);
        }
    };

    // State to control the responsive sidebar's visibility
    const [isSidebarOpen, setSidebarOpen] = createSignal(false);
        

    return (
        <div class="bg-gray-900 text-gray-200 flex h-screen font-sans">
            <ProjectSidebar
                activePage={props.activePage}
                projectId={params.project_id}
                onInviteClick={() => setInviteModalOpen(true)}
                isOpen={isSidebarOpen()}
                onClose={() => setSidebarOpen(false)}
            />

            <main class="flex-1 flex flex-col overflow-hidden">
                <ProjectTopBar
                    onMenuClick={() => setSidebarOpen(true)}
                    onCreateNewTaskClick={handleCreateNewTaskAndNavigate} // Use the new handler
                    onAccountSettingsClick={() => setAccountSettingsModalOpen(true)}
                />
                <div class="flex-1 p-6 lg:p-8 overflow-y-auto">
                    {/* Show loading/error for layout data */}
                    <Show when={!isLoadingLayoutData()} fallback={
                        <div class="flex items-center justify-center h-full p-10">
                            <TbLoader class="w-10 h-10 animate-spin text-blue-500" />
                        </div>
                    }>
                        <Show when={!layoutError()} fallback={
                            <div class="p-4 bg-red-500/10 text-red-300 rounded-lg text-center">
                                <TbAlertTriangle class="inline-block mr-2"/>Failed to load layout data: {layoutError()}
                            </div>
                        }>
                            {props.children}
                        </Show>
                    </Show>
                </div>
            </main>

            {/* Global Modals (rendered at layout level, now with dynamic data) */}
            <InviteModal 
                isOpen={isInviteModalOpen()} 
                onClose={() => setInviteModalOpen(false)} 
                projectId={params.project_id} 
                availablePermissionTiers={permissionTiers()} // --- NEW: Pass available tiers ---
            />
            <UnifiedTaskModal
                isOpen={isTaskModalOpen()}
                taskData={selectedTaskForModal()}
                onClose={() => setTaskModalOpen(false)}
                // --- Pass actual API handlers ---
                onSave={handleSaveTaskInLayout}
                onDelete={handleDeleteTaskInLayout}
                membersData={members()} // Pass dynamic data
                jobRolesData={jobRoles()} // Pass dynamic data
            />
            <AccountSettingsModal 
                isOpen={isAccountSettingsModalOpen()} 
                accountData={currentUserApiData()} // Pass dynamic current user data
                onClose={() => setAccountSettingsModalOpen(false)} 
                onSave={handleSaveAccountSettings} 
                isSaving={isSavingAccountSettings()}
            />
        </div>
    );
};

export default ProjectDashboardLayout;
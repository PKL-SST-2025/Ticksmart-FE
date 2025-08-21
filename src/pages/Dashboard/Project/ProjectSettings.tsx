import { Component, createSignal, Show, createEffect, createMemo, For, onCleanup, onMount } from "solid-js";
import { TbAlertTriangle, TbArrowRight, TbTrash, TbLoader, TbUserCheck, TbShieldLock } from "solid-icons/tb";
import ProjectDashboardLayout from "../../../layouts/ProjectDashboardLayout";
import { gsap } from "gsap";
import { useParams, useNavigate } from "@solidjs/router";
import { sendRequest } from "../../../utils/SendRequest";

// --- DATA STRUCTURES (Matching API responses for better type safety) ---
type ApiProjectResponse = {
    id: number;
    project_name: string;
    business_name: string | null; // Must match DB nullable
    description: string | null; // Must match DB nullable
    owner_user_id: number;
    created_at: string;
};

type ApiMemberResponse = {
    id: number;
    user_id: number;
    full_name: string;
    email: string; // Assuming email is available
    role_id: number | null;
    is_banned: boolean;
    is_owner: boolean;
};

type ApiUserResponse = {
    id: number;
    email: string;
    username: string; // Assuming username is now part of user model
    // Add other fields if you fetch them, like full_name
};


// --- NEW: WebSocket Message Structure ---
type WebSocketMessage = {
    type: "project_updated" | "project_ownership_transferred" | "member_created" | "member_updated" | "member_deleted" | string;
    data: any; // The payload can be different for each message type
};


// Frontend-friendly types for convenience
type Project = ApiProjectResponse;
type Member = ApiMemberResponse; // Use ApiMemberResponse directly
type CurrentUser = ApiUserResponse;


// --- REUSABLE MODAL COMPONENTS ---

// 1. Transfer Ownership Modal (NEW)
const TransferOwnershipModal: Component<{
    isOpen: boolean;
    members: Member[]; // Expects a pre-filtered list of candidates
    onClose: () => void;
    onConfirm: (newOwnerId: number) => void;
    isSubmitting: boolean;
}> = (props) => {
    let modalRef: HTMLDivElement | undefined;
    const [selectedUserId, setSelectedUserId] = createSignal<number | null>(null);

    const isConfirmDisabled = createMemo(() => props.isSubmitting || !selectedUserId());

    createEffect(() => {
        if (props.isOpen) {
            setSelectedUserId(null); // Reset on open
            gsap.fromTo(modalRef!, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
        }
    });

    const handleConfirm = () => {
        if (selectedUserId()) {
            props.onConfirm(selectedUserId()!);
        }
    };

    return (
        <Show when={props.isOpen}>
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
                <div ref={modalRef} class="bg-gray-800 rounded-xl p-8 border border-amber-500/30 w-full max-w-lg">
                    <div class="text-center">
                        <div class="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-amber-500/10 mb-4"><TbShieldLock class="w-8 h-8 text-amber-500" /></div>
                        <h2 class="text-2xl font-bold text-white">Transfer Project Ownership</h2>
                    </div>
                    <p class="text-gray-400 mt-4 text-center">
                        This will make the selected member the new owner. You will lose ownership permissions. This action cannot be undone.
                    </p>
                    <div class="mt-6">
                        <label for="memberSelect" class="block text-sm font-medium text-gray-300 mb-1">
                            Transfer ownership to:
                        </label>
                        <select
                            id="memberSelect"
                            onChange={(e) => setSelectedUserId(parseInt(e.currentTarget.value))}
                            class="w-full bg-gray-900 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">Select a new owner...</option>
                            <For each={props.members}>
                                {(member) => <option value={member.user_id}>{member.full_name}</option>}
                            </For>
                        </select>
                    </div>
                    <div class="mt-6 flex flex-col gap-4">
                        <button
                            onClick={handleConfirm}
                            disabled={isConfirmDisabled()}
                            class="w-full flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold transition-colors bg-amber-600 hover:bg-amber-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                            <Show when={props.isSubmitting} fallback={<span>Confirm & Transfer</span>}>
                                <TbLoader class="animate-spin w-5 h-5" />
                            </Show>
                        </button>
                        <button onClick={props.onClose} class="w-full text-center text-gray-400 hover:text-white">Cancel</button>
                    </div>
                </div>
            </div>
        </Show>
    );
};

// 2. Delete Project Modal (Updated with isSubmitting)
const DeleteProjectModal: Component<{
    isOpen: boolean;
    projectName: string;
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
}> = (props) => {
    let modalRef: HTMLDivElement | undefined;
    const [confirmText, setConfirmText] = createSignal('');
    const isConfirmDisabled = createMemo(() => props.isSubmitting || confirmText() !== props.projectName);

    createEffect(() => {
        if (props.isOpen) {
            setConfirmText('');
            gsap.fromTo(modalRef!, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
        }
    });

    return (
        <Show when={props.isOpen}><div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"><div ref={modalRef} class="bg-gray-800 rounded-xl p-8 border border-red-500/30 w-full max-w-lg"><div class="text-center"><div class="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-500/10 mb-4"><TbAlertTriangle class="w-8 h-8 text-red-500" /></div><h2 class="text-2xl font-bold text-white">Delete Project</h2></div><p class="text-gray-400 mt-4 text-center">This action is irreversible. It will permanently delete the <span class="font-bold text-white">{props.projectName}</span> project, including all tasks, members, and roles.</p><div class="mt-6"><label class="block text-sm font-medium text-gray-300 mb-1">To confirm, please type "<span class="font-semibold text-white">{props.projectName}</span>"</label><input type="text" onInput={(e) => setConfirmText(e.currentTarget.value)} class="w-full bg-gray-900 border-gray-600 rounded-lg p-2 text-white text-center focus:ring-2 focus:ring-red-500" /></div><div class="mt-6"><button onClick={props.onConfirm} disabled={isConfirmDisabled()} class="w-full flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold transition-colors bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed">
        <Show when={props.isSubmitting} fallback={<span>I understand, delete this project</span>}><TbLoader class="animate-spin w-5 h-5" /></Show>
    </button></div></div></div></Show>
    );
};

// --- MAIN PAGE COMPONENT ---
const ProjectSettingsPage: Component = () => {
    const { project_id } = useParams<{ project_id: string }>();
    const navigate = useNavigate();
        let ws: WebSocket | null = null;

    // --- State Signals ---
    const [project, setProject] = createSignal<Project | null>(null);
    const [members, setMembers] = createSignal<Member[]>([]);
    const [currentUser, setCurrentUser] = createSignal<CurrentUser | null>(null); // Uses ApiUserResponse type
    const [isLoading, setIsLoading] = createSignal(true);
    const [error, setError] = createSignal<string | null>(null); // For initial page load error
    
    // Form state (initialize from data, not undefined/empty string)
    const [projectName, setProjectName] = createSignal("");
    const [projectBusinessName, setProjectBusinessName] = createSignal<string | null>(null); // Correctly nullable
    const [projectDescription, setProjectDescription] = createSignal<string | null>(null); // Correctly nullable
    
    
    // Action states
    const [saveStatus, setSaveStatus] = createSignal(''); // e.g., "Saved successfully!"
    const [saveStatusType, setSaveStatusType] = createSignal<'success' | 'error' | null>(null); // NEW: 'success' or 'error'
    const [isSubmitting, setIsSubmitting] = createSignal(false);
    const [actionError, setActionError] = createSignal<string | null>(null);
    // Modal states
    const [isDeleteModalOpen, setDeleteModalOpen] = createSignal(false);
    const [isTransferModalOpen, setTransferModalOpen] = createSignal(false);


    // --- Data Fetching for Initial Page Load ---
    const fetchAllData = async () => {
        if (!project_id) {
            setError("Project ID is missing from URL.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        setActionError(null);
        try {
            const [projectData, membersData, currentUserData] = await Promise.all([
                sendRequest<ApiProjectResponse>(`/projects/${project_id}`),
                sendRequest<ApiMemberResponse[]>(`/projects/${project_id}/members`),
                sendRequest<ApiUserResponse>('/auth/me')
            ]);
            setProject(projectData);
            setMembers(membersData);
            setCurrentUser(currentUserData);
        } catch (err: any) {
            console.error("Error fetching page data:", err);
            setError(err.message || "Failed to load project data.");
        } finally {
            setIsLoading(false);
        }
    };

    // Update form fields whenever the project data changes (from fetch or WebSocket)
    createEffect(() => {
        const p = project();
        if (p) {
            setProjectName(p.project_name);
            setProjectBusinessName(p.business_name);
            setProjectDescription(p.description);
        }
    });

    onMount(() => {
        fetchAllData();

        // --- NEW: Establish WebSocket Connection onMount ---
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/projects/${project_id}/ws`;

        console.log(`Connecting to WebSocket at ${wsUrl}`);
        ws = new WebSocket(wsUrl);

        ws.onopen = () => { console.log(`WebSocket connected for project ${project_id}`); };

        ws.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                console.log("WebSocket message received on Settings page:", message);

                if (message.type === "project_updated") {
                    const updatedProject: ApiProjectResponse = message.data;
                    setProject(updatedProject); // This will reactively update form fields
                } else if (message.type === "project_ownership_transferred") {
                    // Re-fetch everything to get the new owner details correctly
                    fetchAllData();
                } else if (message.type.startsWith("member_")) {
                    // Members list changed, refetch to update transfer candidates
                    sendRequest<ApiMemberResponse[]>(`/projects/${project_id}/members`).then(setMembers);
                }
                
            } catch (e) {
                console.error("Failed to parse WebSocket message:", e);
            }
        };
        ws.onerror = (error) => { console.error("WebSocket error:", error); };
        ws.onclose = () => { console.log(`WebSocket disconnected for project ${project_id}`); };
    });

    // --- Cleanup WebSocket on component unmount ---
    onCleanup(() => {
        if (ws) {
            ws.close();
        }
    });


    // --- Computed Memos for easier logic ---
    const isOwner = createMemo(() => !!currentUser() && !!project() && currentUser()!.id === project()!.owner_user_id);
    const transferCandidates = createMemo(() => members().filter(m => m.user_id !== project()?.owner_user_id));

    // --- Action Handlers ---
    const handleGeneralSave = async (e: Event) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSaveStatus('');
        setSaveStatusType(null);
        setActionError(null);
        try {
            const payload = { project_name: projectName(), business_name: projectBusinessName(), description: projectDescription() };
            await sendRequest(`/projects/${project_id}`, { method: "PATCH", body: payload });
            setSaveStatus('Saved successfully!');
            setSaveStatusType('success');
            // No need to refetch; WebSocket will provide the update
            setTimeout(() => { setSaveStatus(''); setSaveStatusType(null); }, 2000);
        } catch (error: any) {
            console.error("Error updating project:", error);
            setSaveStatus('Save failed!');
            setSaveStatusType('error');
            setActionError(error.message || "Failed to save changes.");
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleConfirmTransfer = async (newOwnerId: number) => {
        setIsSubmitting(true);
        setActionError(null);
        try {
            await sendRequest<ApiProjectResponse>(`/projects/${project_id}/transfer-ownership`, {
                method: "POST",
                body: { new_owner_user_id: newOwnerId }
            });
            setTransferModalOpen(false);
            alert("Project ownership transferred successfully! You will be redirected to the dashboard.");
            navigate("/dashboard");
        } catch (err: any) {
            console.error("Error transferring ownership:", err);
            setActionError(err.message || "Failed to transfer ownership.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        setIsSubmitting(true);
        setActionError(null);
        try {
            await sendRequest<void>(`/projects/${project_id}`, { method: "DELETE" });
            setDeleteModalOpen(false);
            alert("Project deleted successfully! You will be redirected to the dashboard.");
            navigate("/dashboard");
        } catch (err: any) {
            console.error("Error deleting project:", err);
            setActionError(err.message || "Failed to delete project.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ProjectDashboardLayout activePage="Settings" username={currentUser()?.email || ''} projectId={project_id}>
            {/* Show main page loading/error first */}
            <Show when={!isLoading()} fallback={
                <div class="flex items-center justify-center p-10"><TbLoader class="w-8 h-8 animate-spin text-gray-400" /></div>
            }>
                <Show when={!error()} fallback={
                    <div class="p-4 bg-red-500/10 text-red-300 rounded-lg text-center">
                        <TbAlertTriangle class="w-8 h-8 mx-auto mb-2" />
                        <p>{error()}</p>
                    </div>
                }>
                    {/* Render modals only when project data is loaded for default values */}
                    <Show when={project()}>
                        <TransferOwnershipModal
                            isOpen={isTransferModalOpen()}
                            members={transferCandidates()}
                            onClose={() => setTransferModalOpen(false)}
                            onConfirm={handleConfirmTransfer}
                            isSubmitting={isSubmitting()}
                        />
                        <DeleteProjectModal
                            isOpen={isDeleteModalOpen()}
                            projectName={project()!.project_name}
                            onClose={() => setDeleteModalOpen(false)}
                            onConfirm={handleConfirmDelete}
                            isSubmitting={isSubmitting()}
                        />
                    </Show>

                    <div class="max-w-4xl mx-auto space-y-8">
                        <div>
                            <h1 class="text-3xl font-bold text-white">Project Settings</h1>
                            <p class="text-gray-400 mt-1">Manage your project's details, access, and other configurations.</p>
                        </div>

                        <form onSubmit={handleGeneralSave} class="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                            <h2 class="text-xl font-semibold text-white mb-1">General</h2>
                            <p class="text-gray-400 mb-6">Update your project's name and description.</p>

                                    {/* --- NEW: Action Error Display --- */}
                                    <Show when={actionError()}>
                                        <div class="p-3 bg-red-500/10 text-red-300 mb-4 text-sm rounded-lg text-center">
                                            <TbAlertTriangle class="inline mr-2"/>{actionError()}
                                        </div>
                                    </Show>
                            <div class="space-y-6">
                                <div><label for="projectName" class="block text-sm font-medium text-gray-300">Project Name</label><input id="projectName" type="text" value={projectName()} onInput={e => setProjectName(e.currentTarget.value)} class="mt-1 w-full bg-gray-900 border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500" /></div>
                                <div><label for="projectBusinessName" class="block text-sm font-medium text-gray-300">Business Name <span class="text-gray-500">(Optional)</span></label><input id="projectBusinessName" type="text" value={projectBusinessName() ?? ""} onInput={e => setProjectBusinessName(e.currentTarget.value)} class="mt-1 w-full bg-gray-900 border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500" /></div>
                                <div><label for="projectDesc" class="block text-sm font-medium text-gray-300">Description</label><textarea id="projectDesc" rows="4" value={projectDescription() ?? ""} onInput={e => setProjectDescription(e.currentTarget.value)} class="mt-1 w-full bg-gray-900 border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500"></textarea></div>
                            </div>
                           
                           <div class="mt-6 flex justify-end items-center">
                        <Show when={saveStatus()}>
                            {/* --- FIX: Dynamic class based on saveStatusType --- */}
                            <span classList={{
                                "text-green-400": saveStatusType() === 'success',
                                "text-red-400": saveStatusType() === 'error',
                            }} class="mr-4 transition-opacity">
                                {saveStatus()}
                            </span>
                        </Show>
                        <button type="submit" disabled={isSubmitting()} class="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-600"><Show when={isSubmitting()} fallback={<span>Save Changes</span>}><TbLoader class="animate-spin" /></Show></button>
                    </div>
                        </form>

                        <Show when={isOwner()}>
                            <div class="bg-gray-800/50 p-6 rounded-xl border border-red-500/30">
                                <h2 class="text-xl font-semibold text-red-400 mb-1">Danger Zone</h2>
                                <p class="text-gray-400 mb-6">These actions are critical and may be irreversible.</p>
                                <div class="space-y-4">
                                    <div class="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg">
                                        <div><h3 class="font-semibold text-white">Transfer Ownership</h3><p class="text-sm text-gray-400">Transfer this project to another member.</p></div>
                                        <button onClick={() => setTransferModalOpen(true)} disabled={isSubmitting()} class="px-4 py-2 rounded-lg border border-amber-500 text-amber-300 font-semibold hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:border-gray-600 disabled:text-gray-500">Transfer</button>
                                    </div>
                                    <div class="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg">
                                        <div><h3 class="font-semibold text-white">Delete Project</h3><p class="text-sm text-gray-400">Once deleted, all data will be lost forever.</p></div>
                                        <button onClick={() => setDeleteModalOpen(true)} disabled={isSubmitting()} class="px-4 py-2 rounded-lg border border-red-500 text-red-400 font-semibold hover:bg-red-500/10 disabled:cursor-not-allowed disabled:border-gray-600 disabled:text-gray-500">Delete Project</button>
                                    </div>
                                </div>
                            </div>
                        </Show>
                    </div>
                </Show>
            </Show>
        </ProjectDashboardLayout>
    );
};


export default ProjectSettingsPage;
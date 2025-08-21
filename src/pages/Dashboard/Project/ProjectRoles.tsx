import { Component, For, Show, createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { TbPlus, TbPencil, TbTrash, TbX, TbAlertTriangle, TbShieldCheck, TbLoader } from 'solid-icons/tb';
import ProjectDashboardLayout from "../../../layouts/ProjectDashboardLayout";
import { gsap } from "gsap";
import { useParams } from "@solidjs/router";
import { sendRequest } from "../../../utils/SendRequest"; // Assuming this path is correct

// --- DATA STRUCTURES (Frontend representation) ---
type JobRole = {
    id: number;
    name: string;
    description: string;
    isProtected?: boolean; // Frontend-only flag to protect 'Admin'
};

// API response type (matches backend Role struct)
type ApiJobRole = {
    id: number;
    role: string;
    description: string | null; // Description can be null from DB
    project_id: number;
};


// --- WebSocket Message Structure ---
type WebSocketMessage = {
    type: "role_created" | "role_updated" | "role_deleted" | string;
    data: any; // Can be ApiJobRole or { role_id: number }
};


// --- MODAL COMPONENTS (Unchanged) ---

// 1. Create/Edit Role Modal
const RoleModal: Component<{ isOpen: boolean; mode: 'create' | 'edit'; initialData?: JobRole | null; onClose: () => void; onSave: (data: Omit<JobRole, 'id' | 'isProtected'>) => void; }> = (props) => {
    let modalRef: HTMLDivElement | undefined;
    const [name, setName] = createSignal('');
    const [description, setDescription] = createSignal('');
    createEffect(() => {
        if (props.isOpen) {
            setName(props.mode === 'edit' ? props.initialData?.name ?? '' : '');
            setDescription(props.mode === 'edit' ? props.initialData?.description ?? '' : '');
            gsap.fromTo(modalRef!, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
        }
    });
    const handleSave = (e: Event) => {
        e.preventDefault();
        props.onSave({ name: name(), description: description() });
    };
    return (
        <Show when={props.isOpen}><div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"><form ref={modalRef} onSubmit={handleSave} class="bg-gray-800 rounded-xl p-8 border border-gray-700/50 w-full max-w-lg"><div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-bold text-white">{props.mode === 'create' ? 'Create Job Role' : 'Edit Job Role'}</h2><button type="button" onClick={props.onClose} class="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"><TbX size={24} /></button></div><div class="space-y-4"><div><label for="name" class="block text-sm font-medium text-gray-300 mb-1">Role Name</label><input id="name" type="text" required value={name()} onInput={(e) => setName(e.currentTarget.value)} class="w-full bg-gray-900 border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500" /></div><div><label for="description" class="block text-sm font-medium text-gray-300 mb-1">Description</label><textarea id="description" rows="3" value={description()} onInput={(e) => setDescription(e.currentTarget.value)} class="w-full bg-gray-900 border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500"></textarea></div></div><div class="mt-8 flex justify-end"><button type="submit" class="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Save Role</button></div></form></div></Show>
    );
};

// 2. Delete Role Modal with Migration (Updated to display count, confirm & delete)
const DeleteRoleModal: Component<{
    isOpen: boolean;
    role: JobRole | null;
    affectedMemberCount: number; // Correctly passed
    migrationOptions: JobRole[]; // Correctly passed
    onClose: () => void;
    onConfirm: (migrationRoleId: number) => void;
    isSubmitting: boolean; // NEW: For button loading state
}> = (props) => {
    let modalRef: HTMLDivElement | undefined;
    const [migrationTargetId, setMigrationTargetId] = createSignal(0);

    createEffect(() => {
        if (props.isOpen) {
            setMigrationTargetId(0);
            gsap.fromTo(modalRef!, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
        }
    });

    return (
        <Show when={props.isOpen && props.role}>
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
                <div ref={modalRef} class="bg-gray-800 rounded-xl p-8 border border-gray-700/50 w-full max-w-lg">
                    <div class="text-center">
                        <div class="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-500/10 mb-4"><TbAlertTriangle class="w-8 h-8 text-red-500" /></div>
                        <h2 class="text-2xl font-bold text-white">Delete Role: {props.role?.name}?</h2>
                    </div>
                    
                    <p class="text-gray-400 mt-4 text-center">
                        This action cannot be undone.
                        <Show when={props.affectedMemberCount > 0}>
                            <span class="block mt-2 font-bold text-amber-300">
                                There are {props.affectedMemberCount} member(s) currently assigned to this role.
                            </span>
                        </Show>
                    </p>

                    <Show when={props.affectedMemberCount > 0}>
                        <div class="mt-6">
                            <label for="migration" class="block text-sm font-medium text-gray-300 mb-2">What should happen to these members?</label>
                            <select id="migration" onChange={(e) => setMigrationTargetId(parseInt(e.currentTarget.value))} class="w-full bg-gray-900 border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500">
                                <option value="0">Leave them as "Unassigned"</option>
                                <For each={props.migrationOptions}>
                                    {(role) => <option value={role.id}>Migrate them to "{role.name}"</option>}
                                </For>
                            </select>
                        </div>
                    </Show>

                    <div class="mt-8 flex justify-end space-x-4">
                        <button onClick={props.onClose} disabled={props.isSubmitting} class="px-6 py-2 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600 disabled:opacity-50">Cancel</button>
                        <button onClick={() => props.onConfirm(migrationTargetId())} disabled={props.isSubmitting} class="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50">
                            <Show when={props.isSubmitting} fallback={<span>Confirm & Delete</span>}>
                                <TbLoader class="animate-spin w-5 h-5 mr-2"/>
                            </Show>
                        </button>
                    </div>
                </div>
            </div>
        </Show>
    );
};


// --- MAIN PAGE COMPONENT ---
const ProjectRolesPage: Component = () => {
    const params = useParams();
    const projectId = params.project_id;
    let ws: WebSocket | null = null; // WebSocket instance

    // --- STATE MANAGEMENT ---
    const [jobRoles, setJobRoles] = createSignal<JobRole[]>([]);
    const [loading, setLoading] = createSignal<boolean>(true);
    const [error, setError] = createSignal<string | null>(null);
    const [isSubmitting, setIsSubmitting] = createSignal(false); // For modal actions
    
    const [isCreateEditModalOpen, setCreateEditModalOpen] = createSignal(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = createSignal(false);
    
    const [modalMode, setModalMode] = createSignal<'create' | 'edit'>('create');
    const [selectedRole, setSelectedRole] = createSignal<JobRole | null>(null);
    const [affectedMembersCount, setAffectedMembersCount] = createSignal(0); // For delete modal


    // Helper to map API to frontend type
    const mapApiRoleToFrontend = (apiRole: ApiJobRole): JobRole => ({
        id: apiRole.id,
        name: apiRole.role,
        description: apiRole.description || '',
        isProtected: apiRole.role.toLowerCase() === 'admin'
    });

    // --- Data Fetching ---
    const fetchRoles = async () => {
        try {
            setError(null);
            setLoading(true);
            const rolesFromApi = await sendRequest<ApiJobRole[]>(`/projects/${projectId}/roles`);
            setJobRoles(rolesFromApi.map(mapApiRoleToFrontend));
        } catch (err: any) {
            setError(err.message || "Failed to fetch job roles.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    onMount(() => {
        fetchRoles();

        // --- NEW: Establish WebSocket Connection onMount ---
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/projects/${projectId}/ws`;

        console.log(`Connecting to WebSocket at ${wsUrl}`);
        ws = new WebSocket(wsUrl);

        ws.onopen = () => { console.log(`WebSocket connected for project ${projectId}`); };

        ws.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                console.log("WebSocket message received on Roles page:", message);

                if (message.type === "role_created") {
                    const newRole = mapApiRoleToFrontend(message.data);
                    setJobRoles(prev => [...prev, newRole]);
                } else if (message.type === "role_updated") {
                    const updatedRole = mapApiRoleToFrontend(message.data);
                    setJobRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
                } else if (message.type === "role_deleted") {
                    const { role_id } = message.data;
                    setJobRoles(prev => prev.filter(r => r.id !== role_id));
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

    // --- EVENT HANDLERS ---
    const handleOpenCreateModal = () => { setSelectedRole(null); setModalMode('create'); setCreateEditModalOpen(true); };
    const handleOpenEditModal = (role: JobRole) => { setSelectedRole(role); setModalMode('edit'); setCreateEditModalOpen(true); };
    
    const handleOpenDeleteModal = async (role: JobRole) => {
        setSelectedRole(role);
        // Fetch affected member count only if the role is not protected and has an ID
        if (!role.isProtected && role.id) {
            try {
                setLoading(true); // Show loader for fetching count
                const count = await sendRequest<number>(`/projects/${projectId}/roles/${role.id}/member-count`);
                setAffectedMembersCount(count);
            } catch (err) {
                console.error("Failed to fetch affected member count:", err);
                setAffectedMembersCount(0); // Default to 0 on error
            } finally {
                setLoading(false); // Hide loader
            }
        } else {
            setAffectedMembersCount(0); // Protected roles or roles without ID won't have affected members via API
        }
        setDeleteModalOpen(true);
    };

    
    const handleSaveRole = async (data: Omit<JobRole, 'id' | 'isProtected'>) => {
        const isCreating = modalMode() === 'create';
        const currentRole = selectedRole();
        const payload = { role: data.name, description: data.description };
        setIsSubmitting(true);
        try {
            if (isCreating) {
                await sendRequest<ApiJobRole>(`/projects/${projectId}/roles`, { method: 'POST', body: payload });
            } else if (currentRole) {
                await sendRequest<ApiJobRole>(`/projects/${projectId}/roles/${currentRole.id}`, { method: 'PATCH', body: payload });
            }
            setCreateEditModalOpen(false);
            // No need to call fetchRoles(); WebSocket will handle the update.
        } catch (err: any) {
            alert(`Error saving role: ${err.message}`);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async (migrationRoleId: number) => {
        const roleToDelete = selectedRole();
        if (!roleToDelete) return;
        setIsSubmitting(true);
        try {
            await sendRequest<void>(`/projects/${projectId}/roles/${roleToDelete.id}`, { method: 'DELETE', body: { migrate_to_role_id: migrationRoleId > 0 ? migrationRoleId : null } });
            setDeleteModalOpen(false);
        } catch (err: any) {
            alert(`Error deleting role: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    
    const migrationOptions = () => jobRoles().filter(r => !r.isProtected && r.id !== selectedRole()?.id);

    return (
        <ProjectDashboardLayout activePage="Roles" username={params.username} projectId={projectId}>
            {/* Pass isSubmitting to modals for button disabling */}
            <RoleModal isOpen={isCreateEditModalOpen()} mode={modalMode()} initialData={selectedRole()} onClose={() => setCreateEditModalOpen(false)} onSave={handleSaveRole} />
            <DeleteRoleModal isOpen={isDeleteModalOpen()} role={selectedRole()} affectedMemberCount={affectedMembersCount()} migrationOptions={migrationOptions()} onClose={() => setDeleteModalOpen(false)} onConfirm={handleConfirmDelete} isSubmitting={isSubmitting()} />

            <div class="space-y-6">
                <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 class="text-3xl font-bold text-white">Job Roles</h1>
                        <p class="text-gray-400 mt-1">Define the job functions for members in this project.</p>
                    </div>
                    <button onClick={handleOpenCreateModal} disabled={isSubmitting()} class="flex items-center justify-center md:justify-start bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer disabled:opacity-50">
                        <TbPlus class="w-5 h-5 mr-2" />
                        <span>Create Role</span>
                    </button>
                </div>

                <div class="bg-gray-800/50 rounded-xl border border-gray-700/50 min-h-[200px]">
                    <Show when={loading()}>
                        <div class="flex justify-center items-center h-full p-10">
                            <TbLoader class="w-8 h-8 text-gray-400 animate-spin" />
                        </div>
                    </Show>
                    <Show when={!loading() && error()}>
                        <div class="flex flex-col justify-center items-center h-full p-10 text-center">
                            <TbAlertTriangle class="w-10 h-10 text-red-500 mb-2" />
                            <p class="text-red-400 font-semibold">Failed to load roles</p>
                            <p class="text-gray-400 text-sm">{error()}</p>
                        </div>
                    </Show>
                    <Show when={!loading() && !error()}>
                        {/* --- DESKTOP TABLE VIEW --- */}
                        <table class="w-full text-left hidden md:table">
                            <thead class="border-b border-gray-700/50">
                                <tr>
                                    <th class="p-4 text-sm font-semibold text-gray-400">Role Name</th>
                                    <th class="p-4 text-sm font-semibold text-gray-400">Description</th>
                                    <th class="p-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <For each={jobRoles()}>{(role) => (
                                    <tr class="border-t border-gray-700/50">
                                        <td class="p-4 font-medium text-white">
                                            <div class="flex items-center space-x-3">
                                                <span>{role.name}</span>
                                                <Show when={role.isProtected}><span class="text-xs font-semibold text-amber-300 bg-amber-500/10 px-2 py-1 rounded-full flex items-center"><TbShieldCheck class="w-4 h-4 mr-1"/> PROTECTED</span></Show>
                                            </div>
                                        </td>
                                        <td class="p-4 text-gray-300">{role.description}</td>
                                        <td class="p-4">
                                            <div class="flex justify-end items-center space-x-2">
                                                <Show when={!role.isProtected} fallback={<span class="text-gray-500 italic">No actions</span>}>
                                                    <button onClick={() => handleOpenEditModal(role)} disabled={isSubmitting()} class="p-2 text-gray-400 hover:text-blue-400 rounded-md hover:bg-gray-700 cursor-pointer disabled:opacity-50"><TbPencil /></button>
                                                    <button onClick={() => handleOpenDeleteModal(role)} disabled={isSubmitting()} class="p-2 text-gray-400 hover:text-red-400 rounded-md hover:bg-gray-700 cursor-pointer disabled:opacity-50"><TbTrash /></button>
                                                </Show>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </For>
                            </tbody>
                        </table>
                        {/* --- MOBILE CARD VIEW --- */}
                        <div class="md:hidden space-y-px">
                            <For each={jobRoles()}>
                                {(role) => (
                                    <div class="bg-gray-800 p-4 border-b border-gray-700/50 last:border-b-0">
                                        <div class="flex justify-between items-start gap-4">
                                            <div class="flex items-center space-x-3 mb-2">
                                                <span class="font-bold text-lg text-white">{role.name}</span>
                                                <Show when={role.isProtected}><span class="text-xs font-semibold text-amber-300 bg-amber-500/10 px-2 py-1 rounded-full flex items-center"><TbShieldCheck class="w-4 h-4 mr-1"/> PROTECTED</span></Show>
                                            </div>
                                            <div class="flex items-center space-x-1 flex-shrink-0">
                                                <Show when={!role.isProtected}>
                                                    <button onClick={() => handleOpenEditModal(role)} disabled={isSubmitting()} class="p-2 text-gray-400 hover:text-blue-400 rounded-md hover:bg-gray-700 cursor-pointer disabled:opacity-50"><TbPencil /></button>
                                                    <button onClick={() => handleOpenDeleteModal(role)} disabled={isSubmitting()} class="p-2 text-gray-400 hover:text-red-400 rounded-md hover:bg-gray-700 cursor-pointer disabled:opacity-50"><TbTrash /></button>
                                                </Show>
                                            </div>
                                        </div>
                                        <p class="text-gray-400 text-sm">{role.description}</p>
                                    </div>
                                )}
                            </For>
                        </div>
                    </Show>
                </div>
            </div>
        </ProjectDashboardLayout>
    );
};

export default ProjectRolesPage;
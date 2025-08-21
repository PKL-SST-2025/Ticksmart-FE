import { Component, For, Show, createSignal, createEffect, onMount, createMemo, onCleanup } from "solid-js";
import { TbPencil, TbUserOff, TbUserCheck, TbShield, TbX, TbAlertTriangle, TbLoader } from 'solid-icons/tb';
import ProjectDashboardLayout from "../../../layouts/ProjectDashboardLayout";
import { gsap } from "gsap";
import { useParams } from "@solidjs/router";
import { sendRequest } from "../../../utils/SendRequest";
import { useAuth } from "../../../context/AuthContext"; // Import useAuth to get current user ID

// --- API DATA STRUCTURES ---
type ApiJobRole = {
    id: number;
    role: string;
    description: string | null;
    project_id: number;
};

type ApiMemberResponse = {
    id: number;
    user_id: number;
    project_id: number;
    role_id: number | null;
    permission_tier_id: number; // NEW
    full_name: string;
    is_banned: boolean;
    is_owner: boolean;
    email: string;
    permission_tier_name: string; // NEW (for display)
};

type ApiUserResponse = {
    id: number;
    email: string;
    username: string;
};

type ApiPermissionTier = {
    id: number;
    permission: string; // e.g., "Admin", "Editor", "Viewer"
};

// --- FRONTEND DATA STRUCTURES ---
type JobRole = { id: number; name: string; };
type Member = { // Frontend representation
    id: number;
    name: string;
    email: string;
    jobRoleId: number | null; // From backend role_id
    permissionTierId: number; // NEW: From backend permission_tier_id
    permissionTierName: string; // NEW: From backend permission_tier_name
    status: "Active" | "Banned";
    isOwner: boolean;
    userId: number;
};


// --- NEW: WebSocket Message Structure ---
type WebSocketMessage = {
    type: "member_created" | "member_updated" | "member_banned" | "member_unbanned" | string;
    data: ApiMemberResponse; // Assuming the payload is the full, enriched MemberResponse
};


// --- MODAL COMPONENTS (Updated `onSave` signature) ---

const EditMemberModal: Component<{ 
    isOpen: boolean; 
    member: Member | null; 
    roles: JobRole[]; 
    onClose: () => void; 
    // Updated to send full_name and role_id for the API
    onSave: (data: { full_name: string, role_id: number | null }) => void; 
}> = (props) => {
    let modalRef: HTMLDivElement | undefined;
    const [name, setName] = createSignal('');
    const [jobRoleId, setJobRoleId] = createSignal<number>(0);

    createEffect(() => {
        if (props.isOpen && props.member) {
            setName(props.member.name);
            setJobRoleId(props.member.jobRoleId ?? 0); // Handle null case
            gsap.fromTo(modalRef!, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" });
        }
    });

    const handleSave = (e: Event) => {
        e.preventDefault();
        props.onSave({ full_name: name(), role_id: jobRoleId() === 0 ? null : jobRoleId() });
    };

    return (
        <Show when={props.isOpen && props.member}><div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"><form ref={modalRef} onSubmit={handleSave} class="bg-gray-800 rounded-xl p-8 border border-gray-700/50 w-full max-w-lg"><div class="flex justify-between items-center mb-6"><h2 class="text-2xl font-bold text-white">Edit Member</h2><button type="button" onClick={props.onClose} class="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"><TbX size={24} /></button></div><div class="space-y-4"><div><label class="block text-sm font-medium text-gray-300 mb-1">Email</label><input type="email" value={props.member?.email} disabled class="w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-gray-400 cursor-not-allowed" /></div><div><label for="name" class="block text-sm font-medium text-gray-300 mb-1">Full Name</label><input id="name" type="text" value={name()} onInput={(e) => setName(e.currentTarget.value)} required class="w-full bg-gray-900 border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500" /></div><div><label for="jobRole" class="block text-sm font-medium text-gray-300 mb-1">Job Role</label><select id="jobRole" value={jobRoleId()} onChange={(e) => setJobRoleId(parseInt(e.currentTarget.value))} class="w-full bg-gray-900 border-gray-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-blue-500"><option value={0}>Unassigned</option><For each={props.roles}>{(role) => <option value={role.id}>{role.name}</option>}</For></select></div></div><div class="mt-8 flex justify-end"><button type="submit" class="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Save Changes</button></div></form></div></Show>
    );
};


const BanMemberModal: Component<{ isOpen: boolean; member: Member | null; onClose: () => void; onConfirm: () => void; }> = (props) => {
    return (
        <Show when={props.isOpen && props.member}>
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
                <div class="bg-gray-800 rounded-xl p-8 border border-gray-700/50 w-full max-w-md text-center">
                    <div class="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-500/10 mb-4"><TbAlertTriangle class="w-8 h-8 text-red-500" /></div>
                    <h2 class="text-2xl font-bold text-white">Ban Member?</h2>
                    <p class="text-gray-400 mt-2">Are you sure you want to ban <span class="font-bold text-white">{props.member?.name}</span>? Their access will be revoked.</p>
                    <div class="mt-8 flex justify-center space-x-4">
                        <button onClick={props.onClose} class="px-6 py-2 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-600">Cancel</button>
                        <button onClick={props.onConfirm} class="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700">Confirm Ban</button>
                    </div>
                </div>
            </div>
        </Show>
    );
};


// --- MAIN PAGE COMPONENT ---
const ProjectMemberPage: Component = () => {
    const params = useParams();
    const projectId = params.project_id;
    const { user: authUser } = useAuth();

    // --- STATE MANAGEMENT ---
    const [members, setMembers] = createSignal<Member[]>([]);
    const [jobRoles, setJobRoles] = createSignal<JobRole[]>([]); // User-defined roles for this project
    const [permissionTiers, setPermissionTiers] = createSignal<ApiPermissionTier[]>([]); // System-wide tiers
    const [isLoading, setIsLoading] = createSignal(true);
    const [error, setError] = createSignal<string | null>(null);
    const [isSubmitting, setIsSubmitting] = createSignal(false);
    
    const [isEditModalOpen, setEditModalOpen] = createSignal(false);
    const [isBanModalOpen, setBanModalOpen] = createSignal(false);
    const [selectedMember, setSelectedMember] = createSignal<Member | null>(null);

    const currentMemberInfo = createMemo(() => members().find(m => m.userId === authUser()?.id));
    const isCurrentUserProjectOwner = createMemo(() => currentMemberInfo()?.isOwner);

        let ws: WebSocket | null = null; 

    // --- Data Fetching ---
    const fetchMembersAndRoles = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const [membersData, rolesData, tiersData] = await Promise.all([
                sendRequest<ApiMemberResponse[]>(`/projects/${projectId}/members`),
                sendRequest<ApiJobRole[]>(`/projects/${projectId}/roles`),
                sendRequest<ApiPermissionTier[]>('/permission-tiers'), // Fetch system-wide tiers
            ]);

            const formattedMembers = membersData.map(apiMember => ({
                id: apiMember.id,
                name: apiMember.full_name,
                email: apiMember.email || 'email-not-provided',
                jobRoleId: apiMember.role_id,
                permissionTierId: apiMember.permission_tier_id, // NEW
                permissionTierName: apiMember.permission_tier_name, // NEW
                status: apiMember.is_banned ? 'Banned' : 'Active',
                isOwner: apiMember.is_owner,
                userId: apiMember.user_id,
            } as Member));

            const formattedRoles = rolesData.map(apiRole => ({
                id: apiRole.id,
                name: apiRole.role
            }));
            
            setMembers(formattedMembers);
            setJobRoles(formattedRoles);
            setPermissionTiers(tiersData);

        } catch (err: any) {
            setError(err.message || "Failed to load project members.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    onMount(() => {
        fetchMembersAndRoles();

        // --- NEW: Establish WebSocket Connection onMount ---
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/projects/${projectId}/ws`;

        console.log(`Connecting to WebSocket at ${wsUrl}`);
        ws = new WebSocket(wsUrl);

        ws.onopen = () => { console.log(`WebSocket connected for project ${projectId}`); };

        ws.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                console.log("WebSocket message received on Members page:", message);

                if (message.type.startsWith("member_")) {
                    const updatedMemberData: ApiMemberResponse = message.data;
                    const updatedMember = mapApiMemberToFrontend(updatedMemberData);
                    
                    if (message.type === "member_created") {
                        setMembers(prev => [...prev, updatedMember]);
                    } else if (message.type === "member_updated" || message.type === "member_banned" || message.type === "member_unbanned") {
                        setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
                    }
                    // Handle member_deleted if you implement it
                    // else if (message.type === "member_deleted") {
                    //     setMembers(prev => prev.filter(m => m.id !== message.data.member_id));
                    // }
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
    
    // Helper function to map API response to frontend Member type
    const mapApiMemberToFrontend = (apiMember: ApiMemberResponse): Member => ({
        id: apiMember.id,
        name: apiMember.full_name,
        email: apiMember.email || 'email-not-provided',
        jobRoleId: apiMember.role_id,
        permissionTierId: apiMember.permission_tier_id,
        permissionTierName: apiMember.permission_tier_name,
        status: apiMember.is_banned ? 'Banned' : 'Active',
        isOwner: apiMember.is_owner,
        userId: apiMember.user_id,
    });

    // --- Action Handlers ---
    const getRoleName = (roleId: number | null) => jobRoles().find(r => r.id === roleId)?.name || "Unassigned";
    const handleOpenEditModal = (member: Member) => { setSelectedMember(member); setEditModalOpen(true); };
    const handleOpenBanModal = (member: Member) => { setSelectedMember(member); setBanModalOpen(true); };
    
    
    const handleSaveEdit = async (data: { full_name: string, role_id: number | null }) => {
        const memberToUpdate = selectedMember();
        if (!memberToUpdate) return;
        setIsSubmitting(true);
        try {
            await sendRequest<ApiMemberResponse>(`/projects/${projectId}/members/${memberToUpdate.id}`, { method: 'PATCH', body: data });
            setEditModalOpen(false);
            // No need for local state update, WebSocket will provide it.
        } catch(err) {
            alert(`Error updating member: ${err}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle updating a member's PERMISSION TIER directly from the dropdown
    const handleUpdateMemberPermissionTier = async (memberId: number, newPermissionTierId: number) => {
        const memberToUpdate = members().find(m => m.id === memberId);
        if (!memberToUpdate || memberToUpdate.permissionTierId === newPermissionTierId) return;

        setIsSubmitting(true);
        try {
            await sendRequest<ApiMemberResponse>(`/projects/${projectId}/members/${memberId}`, {
                method: 'PATCH',
                body: { permission_tier_id: newPermissionTierId }
            });
            // No need for local state update, WebSocket will provide it.
        } catch (err: any) {
            alert(`Error updating member's permission tier: ${err.message}`);
            // Revert dropdown on error if needed by refetching data
            fetchMembersAndRoles();
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleConfirmBan = async () => {
        const memberToBan = selectedMember();
        if (!memberToBan) return;
        setIsSubmitting(true);
        try {
            await sendRequest(`/projects/${projectId}/members/${memberToBan.id}/ban`, { method: 'POST' });
            setBanModalOpen(false);
            // No need for local state update, WebSocket will provide it.
        } catch(err) {
            alert(`Error banning member: ${err}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUnban = async (memberId: number) => {
        setIsSubmitting(true);
        try {
            await sendRequest(`/projects/${projectId}/members/${memberId}/unban`, { method: 'POST' });
            // No need for local state update, WebSocket will provide it.
        } catch(err) {
            alert(`Error unbanning member: ${err}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter roles for dropdown in EditMemberModal (user-defined job roles)
    const assignableJobRoles = createMemo(() => jobRoles()); // All user-defined roles are assignable as job roles

    return (
        <ProjectDashboardLayout activePage="Members" username={params.username} projectId={projectId}>
            <Show when={!isLoading()} fallback={<div class="flex justify-center p-10"><TbLoader class="w-8 h-8 animate-spin" /></div>}>
            <Show when={!error()} fallback={<div class="p-4 bg-red-500/10 text-red-300 rounded-lg">{error()}</div>}>
                <div class="space-y-6">
                    <h1 class="text-3xl font-bold text-white">Project Members</h1>
                    <div class="bg-gray-800/50 rounded-xl border border-gray-700/50">
                        {/* --- DESKTOP TABLE VIEW --- */}
                        <table class="w-full text-left hidden md:table">
                            <thead class="border-b border-gray-700/50"><tr><th class="p-4 text-sm font-semibold text-gray-400">Name</th><th class="p-4 text-sm font-semibold text-gray-400">Job Role</th><th class="p-4 text-sm font-semibold text-gray-400">Permission Tier</th><th class="p-4 text-sm font-semibold text-gray-400 text-right">Actions</th></tr></thead>
                            <tbody>
                                <For each={members()}>{(member) => (
                                    <tr class="border-t border-gray-700/50">
                                        <td class="p-4"><div classList={{ 'opacity-50': member.status === 'Banned' }}><p class="font-medium text-white">{member.name}</p><p class="text-sm text-gray-400">{member.email}</p></div></td>
                                        <td class="p-4"><span classList={{ 'opacity-50': member.status === 'Banned' }} class="bg-gray-700 text-gray-200 text-xs font-semibold px-2.5 py-1 rounded-full">{getRoleName(member.jobRoleId)}</span></td>
                                        <td class="p-4">
                                            {/* --- Editable Permission Tier Dropdown --- */}
                                            <Show when={member.isOwner} fallback={
                                                <select 
                                                    value={member.permissionTierId} // Use permissionTierId
                                                    onChange={(e) => handleUpdateMemberPermissionTier(member.id, parseInt(e.currentTarget.value))}
                                                    disabled={isSubmitting() || member.status === 'Banned' || !isCurrentUserProjectOwner()}
                                                    class="bg-gray-800 border-gray-600 rounded-lg p-1.5 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                >
                                                    <For each={permissionTiers()}>
                                                        {(tier) => <option value={tier.id}>{tier.permission}</option>}
                                                    </For>
                                                </select>
                                            }>
                                                <div class="flex items-center space-x-2"><TbShield class="text-amber-400" /><span class="font-semibold text-amber-300">Admin (Owner)</span></div>
                                            </Show>
                                        </td>
                                        <td class="p-4">
                                            <div class="flex justify-end items-center space-x-2">
                                                <Show when={!member.isOwner} fallback={<div class="flex justify-end"><span class="text-gray-500 italic">Owner</span></div>}>
                                                    <Show when={member.status === 'Active'}>
                                                        <button onClick={() => handleOpenEditModal(member)} disabled={isSubmitting() || !isCurrentUserProjectOwner()} class="p-2 text-gray-400 hover:text-blue-400 rounded-md hover:bg-gray-700 cursor-pointer disabled:opacity-50"><TbPencil /></button>
                                                        <button onClick={() => handleOpenBanModal(member)} disabled={isSubmitting() || !isCurrentUserProjectOwner()} class="p-2 text-gray-400 hover:text-red-400 rounded-md hover:bg-gray-700 cursor-pointer disabled:opacity-50"><TbUserOff /></button>
                                                    </Show>
                                                    <Show when={member.status === 'Banned'}>
                                                        <button onClick={() => handleUnban(member.id)} disabled={isSubmitting() || !isCurrentUserProjectOwner()} class="flex items-center space-x-2 px-3 py-1.5 text-green-300 rounded-md hover:bg-green-500/10 text-sm cursor-pointer disabled:opacity-50"><TbUserCheck /> <span>Unban</span></button>
                                                    </Show>
                                                </Show>
                                            </div>
                                        </td>
                                    </tr>
                                )}</For>
                            </tbody>
                        </table>
                        {/* --- MOBILE CARD VIEW --- */}
                        <div class="md:hidden space-y-4 p-4">
                            <For each={members()}>{(member) => (
                                <div class="bg-gray-800 p-4 rounded-lg border border-gray-700/50 space-y-4" classList={{ 'opacity-60': member.status === 'Banned' }}>
                                    <div><div class="flex justify-between items-start"><div><p class="font-bold text-white text-lg">{member.name}</p><p class="text-sm text-gray-400">{member.email}</p></div><span class="bg-gray-700 text-gray-200 text-xs font-semibold px-2.5 py-1 rounded-full">{getRoleName(member.jobRoleId)}</span></div></div>
                                    <div class="border-t border-gray-700 pt-4 flex justify-between items-center">
                                        <div>
                                            <Show when={member.isOwner} fallback={
                                                // --- Editable Permission Tier Dropdown ---
                                                <select 
                                                    value={member.permissionTierId}
                                                    onChange={(e) => handleUpdateMemberPermissionTier(member.id, parseInt(e.currentTarget.value))}
                                                    disabled={isSubmitting() || member.status === 'Banned' || !isCurrentUserProjectOwner()}
                                                    class="bg-gray-900 border-gray-600 rounded-lg p-1.5 text-sm text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                >
                                                    <For each={permissionTiers()}>
                                                        {(tier) => <option value={tier.id}>{tier.permission}</option>}
                                                    </For>
                                                </select>
                                            }>
                                                <div class="flex items-center space-x-2 text-sm"><TbShield class="text-amber-400" /><span class="font-semibold text-amber-300">Admin (Owner)</span></div>
                                            </Show>
                                        </div>
                                        <div class="flex items-center space-x-2"><Show when={!member.isOwner} fallback={<div class="flex justify-end"><span class="text-gray-500 italic text-sm">Owner</span></div>}><Show when={member.status === 'Active'}><button onClick={() => handleOpenEditModal(member)} disabled={isSubmitting() || !isCurrentUserProjectOwner()} class="p-2 text-gray-400 hover:text-blue-400 rounded-md hover:bg-gray-700 cursor-pointer disabled:opacity-50"><TbPencil /></button><button onClick={() => handleOpenBanModal(member)} disabled={isSubmitting() || !isCurrentUserProjectOwner()} class="p-2 text-gray-400 hover:text-red-400 rounded-md hover:bg-gray-700 cursor-pointer disabled:opacity-50"><TbUserOff /></button></Show><Show when={member.status === 'Banned'}><button onClick={() => handleUnban(member.id)} disabled={isSubmitting() || !isCurrentUserProjectOwner()} class="flex items-center space-x-2 px-3 py-1.5 text-green-300 rounded-md hover:bg-green-500/10 text-sm cursor-pointer disabled:opacity-50"><TbUserCheck /> <span>Unban</span></button></Show></Show></div>
                                    </div>
                                </div>
                            )}</For>
                        </div>
                    </div>
                </div>
            </Show>
            </Show>
            <EditMemberModal isOpen={isEditModalOpen()} member={selectedMember()} roles={jobRoles()} onClose={() => setEditModalOpen(false)} onSave={handleSaveEdit} />
            <BanMemberModal isOpen={isBanModalOpen()} member={selectedMember()} onClose={() => setBanModalOpen(false)} onConfirm={handleConfirmBan} />
        </ProjectDashboardLayout>
    );
};

export default ProjectMemberPage;
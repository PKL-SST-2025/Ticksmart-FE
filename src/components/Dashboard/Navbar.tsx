import { For, onMount, createSignal, Show, Switch, Match, createEffect } from 'solid-js';
import { A, useLocation } from '@solidjs/router';
import {
    IoPersonCircleOutline,
    IoPeopleOutline,
    IoClose,
    IoHelpCircleOutline,
    IoSearch,
    IoHomeOutline,
    IoMailOutline,
    IoDocumentTextOutline,
    IoSyncCircleOutline,
    IoStarOutline,
    IoShareOutline,
} from 'solid-icons/io';
import { gsap } from 'gsap';
import { RiDesignPencilFill, RiUserFacesUserAddFill } from 'solid-icons/ri';
import { FiChevronDown, FiMenu } from 'solid-icons/fi';
import { sendRequest } from '../../utils/SendRequest';
import { useAuth } from '../../context/AuthContext';
import { TbAlertTriangle, TbLoader, TbLogout } from 'solid-icons/tb';


// --- API Data Structures (Matching backend `ProjectResponseListItem` and `RecentlyVisitedProject`) ---
interface ApiProjectResponseListItem {
    id: number;
    project_name: string;
    business_name: string | null;
    description: string | null;
    owner_user_id: number;
    created_at: string;
    is_owner: boolean;
}

interface ApiRecentlyVisitedProject {
    project_id: number;
    project_name: string;
    business_name: string | null;
    description: string | null;
    last_visited_at: string;
}

// --- Frontend Data Structures (Simplified for UI display) ---
interface ProjectDisplayItem {
    id: number;
    project_name: string;
}

// Helper component for project list items
const ProjectListItem = (props: { project: ProjectDisplayItem, isActive: boolean }) => {
    const Icon = IoDocumentTextOutline;
    return (
        <A href={`/dashboard/project/${props.project.id}`} class="flex items-center text-md p-2 mx-2 space-x-3 rounded-md"
           classList={{
               "bg-blue-600 text-white shadow-lg": props.isActive,
               "text-gray-400 hover:bg-gray-800 hover:text-white": !props.isActive
           }}>
            <Icon class="w-5 h-5" />
            <span class="font-semibold">{props.project.project_name}</span>
        </A>
    );
};


// Data Section
export const mainNavLinks = [
    { name: 'Home', icon: IoHomeOutline, href: '/dashboard' },
    { name: 'Search', icon: IoSearch, href: '/dashboard/search' },
    { name: 'Inbox', icon: IoMailOutline, href: '#' },
];

interface Project {
    id: number; // Use number for the ID
    project_name: string;
    business_name: string | null; // Make it nullable
    description: string | null;    // Make it nullable
    owner_user_id: number;
    created_at: string;         // Assuming TIMESTAMPTZ is returned as string
}

/**
 * Fetches projects from the API and returns a formatted array suitable for display.
 * @returns {Promise<Project[]>} A promise that resolves with an array of Project objects.
 */
export const getMyProjects = async (): Promise<Project[]> => {
    try {
        // Use your sendRequest utility function to make the API call
        const projects = await sendRequest<Project[]>('/projects', { // API endpoint path
            method: 'GET',
        });

        // Format the projects array
        const formattedProjects: Project[] = projects.map(project => ({
            id: project.id,
            project_name: project.project_name,
            business_name: project.business_name,
            description: project.description,
            owner_user_id: project.owner_user_id,
            created_at: project.created_at,
        }));

        return formattedProjects;
    } catch (error) {
        console.error("Failed to fetch projects:", error);
        throw error; // Re-throw to allow the calling component to handle the error
    }
};



interface CreateProjectPayload {
    project_name: string;
    business_name?: string | null;
    description?: string | null;
}

// --- MAIN NAVBAR COMPONENT ---
interface NavbarProps {
    onInboxToggle: () => void;
}

export function Navbar(props: NavbarProps) {
    let promoRef: HTMLDivElement | undefined;
    let navRef: HTMLElement | undefined;

    const [isPromoVisible, setIsPromoVisible] = createSignal(true);
    const [isMobileNavOpen, setIsMobileNavOpen] = createSignal(false);
    const location = useLocation();
    const { user: authUser, logout: performLogout } = useAuth(); // Get logout function from AuthContext


    // Project Lists State
    const [ownedProjects, setOwnedProjects] = createSignal<ApiProjectResponseListItem[]>([]);
    const [sharedProjects, setSharedProjects] = createSignal<ApiProjectResponseListItem[]>([]);
    const [recentlyVisitedProjects, setRecentlyVisitedProjects] = createSignal<ApiRecentlyVisitedProject[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = createSignal(true);
    const [projectsError, setProjectsError] = createSignal<string | null>(null);

    const handleClosePromo = () => {
        if (!promoRef) return;
        gsap.to(promoRef, {
            height: 0, opacity: 0, marginTop: 0, marginBottom: 0, duration: 0.4, ease: 'power2.inOut',
            onComplete: () => setIsPromoVisible(false),
        });
    };

    const toggleMobileNav = () => {
        if (!navRef) return;

        const isOpen = isMobileNavOpen();
        setIsMobileNavOpen(!isOpen);

        if (!isOpen) {
            gsap.to(navRef, { x: '0%', duration: 0.5, ease: 'power3.out' });
        } else {
            gsap.to(navRef, { x: '-100%', duration: 0.4, ease: 'power3.in' });  
        }
    };

    // --- NEW: When opening inbox on mobile, also close the nav ---
    const handleInboxClick = () => {
        if (isMobileNavOpen()) {
            toggleMobileNav(); // Close the nav first
        }
        props.onInboxToggle();
    };



    const fetchProjectLists = async () => {
        setIsLoadingProjects(true);
        setProjectsError(null);
        try {
            const [allProjects, recentVisits] = await Promise.all([
                sendRequest<ApiProjectResponseListItem[]>('/projects'), // User's projects (owned + member)
                sendRequest<ApiRecentlyVisitedProject[]>('/users/me/recent-projects'),
            ]);

            const owned: ApiProjectResponseListItem[] = [];
            const shared: ApiProjectResponseListItem[] = [];

            allProjects.forEach(p => {
                if (p.is_owner) {
                    owned.push(p);
                } else {
                    shared.push(p);
                }
            });

            setOwnedProjects(owned);
            setSharedProjects(shared);
            setRecentlyVisitedProjects(recentVisits);

        } catch (error: any) {
            console.error("Error fetching project lists:", error);
            setProjectsError(error.message || "Failed to load project lists.");
        } finally {
            setIsLoadingProjects(false);
        }
    };

    onMount(() => {
        fetchProjectLists();
    });


    const handleAddProject = async () => {
        try {
            const newProjectPayload: CreateProjectPayload = {
                project_name: "New Project",
                business_name: "Test Business",
                description: "A test project created from the UI"
            };

            // Expect ProjectResponseListItem back
            await sendRequest<ApiProjectResponseListItem>('/projects', {
                method: 'POST',
                body: newProjectPayload,
            });
          
            // Refresh all project lists after adding a new one
            await fetchProjectLists(); 

        } catch (error) {
            console.error("Error creating project:", error);
        }
    };

    // Helper to determine if a project is the currently active one (in URL)
    const isCurrentProjectActive = (projectId: number) => {
        return location.pathname.startsWith(`/dashboard/project/${projectId}`);
    };

    return (
        <>
            {/* --- Hamburger Menu Button & Click-away Overlay (unchanged) --- */}
            <Show when={!isMobileNavOpen()}>
                <button
                    onClick={toggleMobileNav}
                    class="fixed block lg:hidden right-4 top-3 w-14 h-12 p-2 z-[200] text-white/60"
                    aria-label="Toggle Navigation"
                >
                    <div class='bg-gray-800 flex justify-center items-center p-2 rounded-lg ring-1 ring-white/10'>
                        <FiMenu size={24} />
                    </div>
                </button>
            </Show>
            <Show when={isMobileNavOpen()}>
                <div
                    onClick={toggleMobileNav}
                    class="fixed inset-0 bg-black/60 z-[90] lg:hidden"
                />
            </Show>

            <nav
                ref={navRef}
                class="fixed lg:relative flex flex-col h-screen z-[100] overflow-y-auto border-r border-gray-800 bg-gray-900 text-gray-300 w-full lg:w-96 
               transform -translate-x-full lg:translate-x-0"
            >
                {/* Internal Close Button (Mobile Only) */}
                <div class="flex justify-end p-2 lg:hidden">
                    <button
                        onClick={toggleMobileNav}
                        class="m-2 p-2.5 rounded-md hover:bg-gray-700"
                        aria-label="Close Navigation"
                    >
                        <IoClose size={28} class="text-gray-400" />
                    </button>
                </div>

                {/* Workspace Header - Displays user's email as workspace name */}
                <div class="p-4 pt-0 lg:pt-4 lg:mt-2 flex ">
                    <button class="flex cursor-pointer items-center justify-between p-2 hover:bg-gray-700 rounded-lg w-full mr-2 bg-gray-800 text-gray-400">
                        <div class="flex items-center space-x-3">
                            <IoPersonCircleOutline class="w-8 h-8" />
                            <span class="font-regular">{authUser()?.email || 'Loading Workspace...'}</span>
                            <FiChevronDown class="w-6 h-6 stroke-2" stroke-linecap='round' />
                        </div>
                    </button>
                    {/* Add project button */}
                    <button
                        onClick={handleAddProject}
                        class="p-1 cursor-pointer rounded-md bg-gray-800 hover:bg-gray-700"
                        title="Create New Project"
                    >
                        <RiDesignPencilFill class="w-10 h-5" />
                    </button>
                </div>

                <hr class="border-gray-800 mx-3 border-[1.5px]" />

                {/* Main Navigation Links */}
                <div class="mt-2">
                    <ul>
                        <For each={mainNavLinks}>
                            {(link) => {
                                const isActive = () => location.pathname === link.href;
                                return (
                                    <li class="nav-item flex flex-col ">
                                        <Switch>
                                            <Match when={link.href === '#'}>
                                                <button
                                                    onClick={handleInboxClick}
                                                    class="flex cursor-pointer items-center text-md  text-gray-400 p-2 mx-2 space-x-3 rounded-md hover:bg-gray-800"
                                                >
                                                    <link.icon class="w-5 h-5" />
                                                    <span class="font-semibold">{link.name}</span>
                                                </button>
                                            </Match>
                                            <Match when={link.href !== '#'}>
                                                <A
                                                    href={link.href}
                                                    class="flex items-center text-md text-gray-400 p-2 mx-2 space-x-3  rounded-md"
                                                    classList={{ 'bg-gray-800': isActive(), 'hover:bg-gray-800': !isActive() }}
                                                >
                                                    <link.icon class="w-5 h-5" />
                                                    <span class="font-semibold">{link.name}</span>
                                                </A>
                                            </Match>
                                        </Switch>
                                    </li>
                                );
                            }}
                        </For>
                    </ul>
                </div>

                <hr class="my-4 border-gray-800 mx-3 border-[1.5px]" />

                {/* --- Project Lists Section --- */}
                {/* Outer Show: Handles Loading state with a direct fallback */}
                <Show when={!isLoadingProjects()} fallback={
                    <div class="flex flex-col items-center justify-center p-4">
                        <TbLoader class="w-8 h-8 animate-spin text-gray-400 mb-2"/>
                        <p class="text-gray-400 text-sm">Loading projects...</p>
                    </div>
                }>
                    {/* Inner Show: Handles Error state with a direct fallback (only if not loading) */}
                    <Show when={!projectsError()} fallback={
                        <div class="px-4 text-red-400 text-sm"><TbAlertTriangle class="inline mr-1"/>{projectsError()}</div>
                    }>
                        {/* Content to show when not loading AND no error - these are the CHILDREN of this Show */}

                        {/* Recently Visited Projects Section */}
                        <Show when={recentlyVisitedProjects().length > 0}>
                            <div class="px-4 mb-2">
                                <h3 class="text-xs font-semibold tracking-wider text-gray-500 uppercase flex items-center">
                                    <IoSyncCircleOutline class="w-4 h-4 mr-1"/>Recently Visited
                                </h3>
                            </div>
                            <ul>
                                <For each={recentlyVisitedProjects()}>
                                    {(project) => (
                                        <li>
                                            <ProjectListItem project={{ id: project.project_id, project_name: project.project_name }} isActive={isCurrentProjectActive(project.project_id)} />
                                        </li>
                                    )}
                                </For>
                                <hr class="my-4 border-gray-800 mx-3 border-[1.5px]" />
                            </ul>
                        </Show>

                        {/* Owned Projects Section */}
                        <Show when={ownedProjects().length > 0}>
                            <div class="px-4 mb-2">
                                <h3 class="text-xs font-semibold tracking-wider text-gray-500 uppercase flex items-center">
                                    <IoStarOutline class="w-4 h-4 mr-1"/>Owned Projects
                                </h3>
                            </div>
                            <ul>
                                <For each={ownedProjects()}>
                                    {(project) => (
                                        <li>
                                            <ProjectListItem project={{ id: project.id, project_name: project.project_name }} isActive={isCurrentProjectActive(project.id)} />
                                        </li>
                                    )}
                                </For>
                                <hr class="my-4 border-gray-800 mx-3 border-[1.5px]" />
                            </ul>
                            
                        </Show>

                        {/* Shared Projects Section */}
                        <Show when={sharedProjects().length > 0}>
                            <div class="px-4 mb-2">
                                <h3 class="text-xs font-semibold tracking-wider text-gray-500 uppercase flex items-center">
                                    <IoShareOutline class="w-4 h-4 mr-1"/>Shared Projects
                                </h3>
                            </div>
                            <ul>
                                <For each={sharedProjects()}>
                                    {(project) => (
                                        <li>
                                            <ProjectListItem project={{ id: project.id, project_name: project.project_name }} isActive={isCurrentProjectActive(project.id)} />
                                        </li>
                                    )}
                                </For>
                                <hr class="my-4 border-gray-800 mx-3 border-[1.5px]" />
                            </ul>
                        </Show>

                        {/* Fallback if no projects (only show if none of the above sections rendered) */}
                        <Show when={recentlyVisitedProjects().length === 0 && ownedProjects().length === 0 && sharedProjects().length === 0}>
                            <div class="text-center text-sm text-gray-500 italic p-4">No projects found. Create one to get started!</div>
                        </Show>
                    </Show>
                </Show>

                {/* Footer - MODIFIED TO INCLUDE LOGOUT */}
                <div class="mt-auto p-2 border-t border-gray-800 bg-gray-800">
                    <div class="flex flex-col space-y-2"> 
                        {/* 
                        <div class="flex items-center justify-between">
                            <button class="flex cursor-pointer py-3 items-center mr-2 w-full p-2 space-x-3 rounded-md hover:bg-gray-600 bg-gray-700">
                                <RiUserFacesUserAddFill class="w-5 h-5 ml-2" />
                                <span class="font-medium">Invite members</span>
                            </button>
                            <button class="p-2 cursor-pointer rounded-md hover:bg-gray-600 bg-gray-700">
                                <IoHelpCircleOutline class="w-8 h-8" />
                            </button>
                        </div>
                        Changed to flex-col for better layout with logout */}
                        {/* NEW: Logout Button */}
                        <button
                            onClick={performLogout} // Call the logout function from context
                            class="w-full flex items-center justify-center p-3 rounded-lg font-semibold bg-red-600/10 text-red-300 hover:bg-red-600/20 transition-colors duration-200 cursor-pointer"
                        >
                            <TbLogout class="w-6 h-6 mr-2" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </nav>
        </>
    );
}
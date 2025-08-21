import { Component, JSX, Match, Show, Switch, createResource } from "solid-js";
import { useParams, Navigate } from "@solidjs/router";
import { sendRequest } from "../../utils/SendRequest";
import { TbLoader, TbAlertTriangle } from "solid-icons/tb";

// This component checks for project membership
const ProjectGuard: Component<{ children: JSX.Element }> = (props) => {
    const params = useParams();

    // We create a resource that attempts to fetch the project data.
    // The backend will return a 403 Forbidden if the user is not a member.
    const [projectAccess] = createResource(() => params.project_id, async (projectId) => {
        try {
            // We only need to check if the request succeeds. A minimal GET is enough.
            await sendRequest(`/projects/${projectId}`);
            return true; // Access granted
        } catch (error: any) {
            // If the error is 403, we know it's a permission issue.
            if (error.message && error.message.includes("403")) {
                return false; // Access denied
            }
            // For other errors (e.g., 404 Not Found, 500), re-throw to show an error page.
            throw error;
        }
    });

    return (
        <Show when={!projectAccess.loading} fallback={
            <div class="flex items-center justify-center p-10"><TbLoader class="w-8 h-8 animate-spin text-gray-400" /></div>
        }>
            <Switch>
                <Match when={projectAccess.error}>
                    <div class="p-8 text-center text-red-400">
                        <TbAlertTriangle class="w-12 h-12 mx-auto mb-4" />
                        <h2 class="text-xl font-bold">Error Loading Project</h2>
                        <p>{projectAccess.error.message}</p>
                    </div>
                </Match>
                <Match when={projectAccess() === true}>
                    {/* If access is true, render the actual page component */}
                    {props.children}
                </Match>
                <Match when={projectAccess() === false}>
                    {/* If access is false, show a "not a member" page or redirect */}
                    <div class="p-8 text-center w-[100vw] h-[100vh] flex justify-center items-center flex-col bg-gray-900 text-amber-400">
                        <TbAlertTriangle class="w-12 h-12 mx-auto mb-4" />
                        <h2 class="text-xl font-bold">Access Denied</h2>
                        <p>You are not a member of this project.</p>
                        <a href="/dashboard" class="mt-4 inline-block text-blue-400 hover:underline">Go to your Dashboard</a>
                    </div>
                </Match>
            </Switch>
        </Show>
    );
};

export default ProjectGuard;
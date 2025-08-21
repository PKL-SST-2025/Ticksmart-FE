// src/pages/InvitePage.tsx

import { Component, onMount, createSignal, Show } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { sendRequest } from "../../utils/SendRequest";
import { TbLoader, TbAlertTriangle, TbChecks } from "solid-icons/tb";
import { useAuth } from "../../context/AuthContext"; // To refetch user/auth state if needed

const InvitePage: Component = () => {
    const params = useParams(); // Get URL parameters
    const navigate = useNavigate(); // For redirection
    const { refetchUser } = useAuth(); // To refresh user's project list after joining
    
    const [status, setStatus] = createSignal<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = createSignal('');
    const [projectId, setProjectId] = createSignal<number | null>(null); // To store project ID for redirection

    onMount(async () => {
        const inviteCode = params.invite_code; // Get the invite code from the URL

        if (!inviteCode) {
            setStatus('error');
            setMessage('Invalid invite link: No code found in URL.');
            return;
        }

        try {
            // Attempt to accept the invite via your backend API
            // Your backend's `accept_invite_link` returns StatusCode::OK (200), no JSON body expected.
            await sendRequest(`/invites/${inviteCode}/accept`, {
                method: 'GET', // Your backend uses GET for this.
            });

            // If successful, the user is now a member. Refetch user data (which includes project list).
            await refetchUser(); 

            // Find the project ID from the newly updated user's project list.
            // This is a temporary workaround. A better API would return the project_id on success.
            // For now, let's assume if it succeeds, you should go to the dashboard.
            // A more robust solution: Backend's `accept_invite_link` could return the `project_id` in its JSON body.
            // For example: `Result<Json<{ project_id: i32 }>, AppError>` instead of `Result<StatusCode, AppError>`.
            // For now, we'll redirect to a generic dashboard or assume you can navigate to the project if you know its ID from an external source.

            // If backend does not return project_id, you can try to refetch projects here or go to general dashboard.
            // For a fully functional redirect, the backend should return the project_id.
            // Let's assume for now, it's safer to redirect to the general dashboard or a project list page.
            setStatus('success');
            setMessage('Invite accepted! Redirecting to project...');
            
            // OPTIONAL: If backend's `accept_invite_link` *was* modified to return `{ project_id: i32 }`:
            // const successResponse = await sendRequest<{ project_id: number }>(`/invites/${inviteCode}/accept`, { method: 'GET' });
            // setProjectId(successResponse.project_id);
            // navigate(`/dashboard/project/${successResponse.project_id}`);

            // For now, redirect to the main dashboard after a short delay
            setTimeout(() => {
                navigate('/dashboard'); // Redirect to main dashboard
            }, 2000);

        } catch (err: any) {
            setStatus('error');
            // Extract error message from API response if available
            setMessage(err.message || 'Failed to accept invite. Please try again.');
            console.error("Invite acceptance failed:", err);

            // If the error indicates already a member, show a specific message
            if (err.message && err.message.includes("already a member")) {
                setMessage("You are already a member of this project.");
            }
            // If the invite is expired/used, show specific message
            if (err.message && (err.message.includes("expired") || err.message.includes("maximum uses") || err.message.includes("not active"))) {
                setMessage("This invite link is invalid or has expired.");
            }

            setTimeout(() => {
                navigate('/login'); // Redirect to login or home page after error
            }, 3000);
        }
    });

    return (
        <div class="fixed inset-0 flex items-center justify-center bg-gray-950 text-white">
            <div class="p-8 bg-gray-800 rounded-lg shadow-xl text-center max-w-md w-full space-y-4">
                <Show when={status() === 'loading'}>
                    <TbLoader class="w-16 h-16 mx-auto animate-spin text-blue-500" />
                    <h2 class="text-2xl font-bold">Accepting Invite...</h2>
                    <p class="text-gray-400">Please wait while we process your request.</p>
                </Show>

                <Show when={status() === 'success'}>
                    <TbChecks class="w-16 h-16 mx-auto text-green-500" />
                    <h2 class="text-2xl font-bold">Success!</h2>
                    <p class="text-gray-300">{message()}</p>
                </Show>

                <Show when={status() === 'error'}>
                    <TbAlertTriangle class="w-16 h-16 mx-auto text-red-500" />
                    <h2 class="text-2xl font-bold">Invite Failed</h2>
                    <p class="text-gray-300">{message()}</p>
                </Show>
            </div>
        </div>
    );
};

export default InvitePage;
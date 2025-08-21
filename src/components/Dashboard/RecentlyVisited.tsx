import { createSignal, For, onMount, Show } from 'solid-js';
import type { Component } from 'solid-js';
import {
  IoTimeOutline,
  IoAddCircleOutline,
  IoEllipsisHorizontal,
} from 'solid-icons/io';
import gsap from 'gsap';

import { ProjectCard } from './ProjectCard';
import { SeeMoreCard } from './SeeMoreCard';
import { TbAlertTriangle, TbLoader } from 'solid-icons/tb';
import { sendRequest } from '../../utils/SendRequest';
import { A } from '@solidjs/router';


// --- API Data Structure for Recently Visited Projects ---
interface ApiRecentlyVisitedProject {
    project_id: number;
    project_name: string;
    business_name: string | null;
    description: string | null;
    last_visited_at: string;
}

export const RecentlyVisited: Component = () => {
    const [projects, setProjects] = createSignal<ApiRecentlyVisitedProject[]>([]);
    const [isLoading, setIsLoading] = createSignal(true);
    const [error, setError] = createSignal<string | null>(null);

    onMount(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch top 5 recently visited projects (or adjust limit as needed)
            const data = await sendRequest<ApiRecentlyVisitedProject[]>('/users/me/recent-projects?limit=6'); // Limit for grid layout
            setProjects(data);
        } catch (err: any) {
            console.error("Error fetching recently visited projects:", err);
            setError(err.message || "Failed to load recent projects.");
        } finally {
            setIsLoading(false);
        }
    });

    return (
        <div
            // Removed containerRef here as it's not needed for this component's mount animation
            class="w-full max-w-5xl p-4 rounded-xl border border-gray-700/80 bg-gray-800/40 backdrop-blur-sm"
        >
            {/* Header */}
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-2">
                    <IoTimeOutline class="w-5 h-5 text-gray-400" />
                    <h2 class="font-semibold text-gray-200">Recently Visited</h2>
                </div>
                <div class="flex items-center space-x-2">
                    <button class="p-1 text-gray-400 hover:text-white">
                        <IoAddCircleOutline class="w-5 h-5" />
                    </button>
                    <button class="p-1 text-gray-400 hover:text-white">
                        <IoEllipsisHorizontal class="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Grid of Projects */}
            <Show when={isLoading()} fallback={
                <Show when={!error()} fallback={
                    <div class="flex-1 flex flex-col items-center justify-center text-red-400 min-h-[150px]">
                        <TbAlertTriangle class="w-8 h-8 mb-2"/>
                        <p class="text-sm text-center">{error()}</p>
                    </div>
                }>
                    <Show when={projects().length > 0} fallback={
                        <div class="flex-1 flex flex-col items-center justify-center text-gray-500 italic min-h-[150px]">
                            <p>No recent projects found.</p>
                            {/*
                            <A href="/dashboard" class="mt-2 text-blue-400 hover:underline">Go to All Projects</A>
                            */}
                        </div>
                    }>
                        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            <For each={projects()} >
                                {(project) => <ProjectCard project={{ id: project.project_id, name: project.project_name, href: `/dashboard/project/${project.project_id}` }} />} {/* Map to Project type */}
                            </For>
                            <SeeMoreCard />
                        </div>
                    </Show>
                </Show>
            }>
                <div class="flex-1 flex items-center justify-center min-h-[150px]">
                    <TbLoader class="w-8 h-8 animate-spin text-gray-400" />
                </div>
            </Show>
        </div>
    );
};
import { createContext, useContext, createSignal, Accessor, Setter } from "solid-js";
import type { Component, JSX } from "solid-js";
// Define your frontend data types here or import them from a shared types file
// This ensures all components use the same definitions.
export type Member = { id: number; name: string; avatarInitial: string; jobRoleId: number | null; userId: number; };
export type JobRole = { id: number; name: string; };
export type SubTask = { id: number; text: string; completed: boolean; };
export type Task = {
    id: number;
    title: string;
    description?: string;
    status: 'ToDo' | 'InProgress' | 'InReview' | 'Done';
    leadAssigneeId: number | null;
    contributorIds: number[];
    subTasks: SubTask[];
    requiredRoleIds: number[];
};

interface IProjectContext {
    tasks: Accessor<Task[]>;
    setTasks: Setter<Task[]>;
    members: Accessor<Member[]>;
    setMembers: Setter<Member[]>;
    roles: Accessor<JobRole[]>;
    setRoles: Setter<JobRole[]>;
    isLoading: Accessor<boolean>;
    error: Accessor<string | null>;
    refetchData: () => Promise<void>; // Function to manually refetch all data
}

const ProjectContext = createContext<IProjectContext>();

// A custom hook to easily access the project context
export function useProject() {
    return useContext(ProjectContext)!;
}

// The provider component will be used in ProjectDashboardLayout
export const ProjectProvider = ProjectContext.Provider;
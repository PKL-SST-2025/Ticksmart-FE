// src/utils/types/tasks.ts
export interface Task {
  id: string;
  name: string;
  owner: string[];
  status: "Todo" | "In Progress" | "Done" | "Unfinished" | "Backlog" | "Working on it" | "Stuck" | "Not Started"; // Added more statuses
  statusColor: string; // Tailwind class string, e.g., 'bg-green-500/80'
  dueDate: string; // ISO string 'YYYY-MM-DD'
  priority: "High" | "Medium" | "Low" | "Critical";
  notes: string;
  budget: number;
  files: number;
  timeline: string; // Free text for now, could be Date range
  lastUpdatedTime: string; // e.g., "1 week ago", "Jul 10"
  lastUpdatedBy: string; // e.g., "Username"
  isNew?: boolean; // Flag for newly added rows
}

export interface TaskGroupData {
  id: string;
  title: string;
  color: string; // Tailwind class for text color, e.g., 'text-green-400'
  tasks: Task[];
}

export type TaskGroup = {
  id: string;
  name: string;
  tasks: Task[];
};
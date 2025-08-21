import { IconTypes } from 'solid-icons';

export interface Project {
  id: string;
  name: string;
  iconName?: keyof typeof import('solid-icons/io'); // To map to Solid Icons Io set
  emoji?: string; // Alternative for custom icons
  href: string;

  description?: string;
  date?: string;
}

// Type for sidebar navigation links in dashboard
export interface NavLink {
  name: string;
  icon: IconTypes;
  href: string;
  active?: boolean;
}



// Re-exporting from Tanstack for convenience
import { Row, Column, Table } from '@tanstack/solid-table';

// Core data types
export type Status = "Working on it" | "Done" | "Stuck" | "Not Started";
export type Priority = "Critical" | "High" | "Medium" | "Low";

export type Person = {
  id: string;
  name: string;
  avatar: string; // Could be initials or URL
};

export type Task = {
  id: string;
  task: string;
  owner?: Person;
  status: Status;
  dueDate?: string;
  priority: Priority;
};

export type TaskGroupData = {
    id: string;
    name: string;
    tasks: Task[];
};

// Props for our custom cell components
export interface CellComponentProps<T> {
    getValue: () => T;
    row: Row<Task>;
    column: Column<Task, T>;
    table: Table<Task>;
}
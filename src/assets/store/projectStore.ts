import { createStore } from "solid-js/store";
import { Task, TaskGroupData } from "../types/project";

const getInitialData = (): TaskGroupData[] => [
    {
        id: "group1",
        name: "To-Do",
        tasks: [
            { id: 'task-1', task: 'Design the main dashboard UI', owner: {id: "user-1", name: "Sarah", avatar: "SS"}, status: 'Working on it', priority: 'High', dueDate: '2025-07-15' },
            { id: 'task-2', task: 'Implement authentication flow', owner: {id: "user-2", name: "John", avatar: "JD"}, status: 'Done', priority: 'Critical', dueDate: '2025-07-11' },
            { id: 'task-3', task: 'Develop the task creation modal', owner: {id: "user-1", name: "Sarah", avatar: "SS"}, status: 'Stuck', priority: 'Medium', dueDate: '2025-07-20' },
        ]
    },
    {
        id: "group2",
        name: "Completed",
        tasks: [
             { id: 'task-4', task: 'Setup SolidJS project structure', owner: {id: "user-3", name: "Mike", avatar: "MJ"}, status: 'Done', priority: 'High', dueDate: '2025-07-10' },
        ]
    }
];

const [store, setStore] = createStore({
    groups: getInitialData(),
    globalFilter: "",
});

const projectActions = {
    setGlobalFilter(filter: string) {
        setStore("globalFilter", filter);
    },

    updateTask(groupId: string, rowIndex: number, columnId: string, value: any) {
        setStore("groups",
            (g) => g.id === groupId,
            "tasks",
            rowIndex,
            (t) => ({ ...t, [columnId]: value })
        );
    },

    addTask(groupId: string) {
        const newTask: Task = {
            id: `task_${Date.now()}`,
            task: "New Task",
            status: "Not Started",
            priority: "Medium",
            dueDate: new Date().toISOString().split('T')[0]
        };

        setStore(
            "groups",
            (g) => g.id === groupId,
            "tasks",
            (tasks) => [...tasks, newTask]
        );
    },

    deleteTask(groupId: string, rowIndex: number) {
        setStore(
            'groups',
            g => g.id === groupId,
            'tasks',
            tasks => tasks.filter((_, i) => i !== rowIndex)
        );
    },

    addGroup(name: string = "New Group") {
        const newGroup: TaskGroupData = {
            id: `group_${Date.now()}`,
            name,
            tasks: [],
        };
        setStore("groups", (groups) => [...groups, newGroup]);
    },

    updateGroupName(groupId: string, newName: string) {
        setStore("groups", (g) => g.id === groupId, "name", newName);
    }
};

export { store, projectActions };
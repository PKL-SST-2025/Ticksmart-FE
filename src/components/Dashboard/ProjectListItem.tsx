import { createResource, Suspense, Show } from 'solid-js';
import type { Component } from 'solid-js';
// We'll use IoDocumentsOutline as a fallback since iconName is not from API
import { IoDocumentOutline } from 'solid-icons/io';
import type { IconTypes } from 'solid-icons';
import { A } from '@solidjs/router';

// Create a resource to dynamically import the icon module.
const [iconModule] = createResource(() => import('solid-icons/io'));

// --- Frontend Project Type for ProjectListItem ---
// This should match the relevant fields from ApiProjectResponseListItem
interface ProjectDisplayItem {
  id: number; // The project's ID
  project_name: string; // The project's name
  business_name: string | null; // From API
  description: string | null; // From API
  href: string; // The URL for the project page
  // iconName is not directly from API, so it will be a fixed default or derived
  // date is not directly from API, so we'll use a placeholder or derived value
}

interface ProjectListItemProps {
  project: ProjectDisplayItem;
}

export const ProjectListItem: Component<ProjectListItemProps> = (props) => {
  // Always use a default icon if not explicitly provided by the API
  const Icon = () => {
    const icons = iconModule();
    // Default to IoDocumentOutline if no specific icon name logic exists
    const IconCmp = (icons && (props.project as any).iconName && icons[(props.project as any).iconName as keyof typeof icons]) as IconTypes || IoDocumentOutline;
    return <IconCmp class="w-5 h-5 text-gray-300" />;
  };

  return (
    <A href={props.project.href} class="block bg-gray-800/50 hover:bg-gray-700/70 transition-colors duration-200 rounded-lg p-3">
      <div class="flex items-start space-x-4">
        {/* Icon */}
        <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-900/50 rounded-full">
          <Suspense fallback={<div class="w-5 h-5 bg-gray-700 rounded-full animate-pulse" />}>
            <Icon />
          </Suspense>
        </div>

        {/* Content */}
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-center">
            <p class="font-bold text-gray-100 truncate">{props.project.project_name}</p>
            {/* Display business_name or a placeholder if 'date' is not coming from API */}
            <Show when={props.project.business_name}>
                <p class="text-xs text-gray-400 flex-shrink-0 ml-2 truncate">{props.project.business_name}</p>
            </Show>
            {/* If you want to show date, you'd need to add it to your API response */}
            {/* <p class="text-xs text-gray-400 flex-shrink-0 ml-2">{props.project.date}</p> */}
          </div>
          <p class="text-sm text-gray-400 mt-1 truncate">{props.project.description || 'No description provided.'}</p>
        </div>
      </div>
    </A>
  );
};
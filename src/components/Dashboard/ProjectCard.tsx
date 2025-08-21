import { createResource, Suspense } from 'solid-js';
import type { Component } from 'solid-js';
import { IoDocumentOutline } from 'solid-icons/io';
import type { IconTypes } from 'solid-icons';
import { A } from '@solidjs/router';


// Create a simple Project type that ProjectCard actually needs
interface Project {
  id: number;
  name: string; // Or project_name if you prefer
  href: string; // The URL for the card
  iconName?: string; // Optional icon name
}

// Create a resource to dynamically import the icon module.
const [iconModule] = createResource(() => import('solid-icons/io'));

interface ProjectCardProps {
  project: Project; // Use the local Project interface
}

export const ProjectCard: Component<ProjectCardProps> = (props) => {
  const Icon = () => {
    const icons = iconModule();
    const IconCmp = (icons && props.project.iconName && icons[props.project.iconName as keyof typeof icons]) as IconTypes || IoDocumentOutline;
    return <IconCmp class="w-7 h-7 text-gray-200" />;
  };

  return (
    <A
      href={props.project.href} // Use href from project prop
      class="group block text-center pointer-events-auto transition-transform duration-200 hover:-translate-y-1 ease-in-out "
    >
      <div class="overflow-hidden rounded-lg bg-gray-700  h-38 ">
        <div class="flex items-center justify-center h-28 ">
          <div class="flex items-center justify-center w-14 h-14 z-10 bg-gray-600 rounded-full">
            <Suspense fallback={<div class="w-7 h-7 bg-gray-600 rounded-full animate-pulse" />}>
              <Icon />
            </Suspense>
          </div>
        </div>
        <div class="px-2 py-3  -translate-y-10 pt-8 pb-24  z-20 bg-gray-950">
          <p class="text-sm text-gray-300 truncate">{props.project.name}</p>
        </div>
      </div>
    </A>
  );
};
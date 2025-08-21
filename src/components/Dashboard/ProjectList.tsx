      
import { For, createResource, Suspense } from 'solid-js';
import type { Project } from '../../utils/types/project';
import { IoDocumentOutline } from 'solid-icons/io';
import type { IconTypes } from 'solid-icons';

// Dynamically import icons to avoid bundling all of them
// We use createResource to load the icon module once.
const [iconModule] = createResource(() => import('solid-icons/io'));
interface ProjectListProps {
  title: string;
  projects: Project[];
}

export function ProjectList(props: ProjectListProps) {
  return (
    <div class="mt-2">
      <h3 class="px-4 mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
        {props.title}
      </h3>
      <ul>
        <For each={props.projects}>
          {(project) => {
            // This component dynamically renders the correct icon once the module is loaded.
            const Icon = () => {
              const icons = iconModule();
              // Fallback to a default icon if the name isn't provided or the module isn't ready.
              const Component = (icons && project.iconName && icons[project.iconName as keyof typeof icons]) as IconTypes || IoDocumentOutline;
              return <Component class="w-5 h-5 text-gray-400" />;
            };
            return (
              <li class="nav-item">
                <a
                  href={project.href}
                  class="flex items-center text-md text-gray-400 p-2 mx-2 space-x-3 rounded-md hover:bg-gray-800"
                >
                  <Suspense fallback={<div class="w-5 h-5 bg-gray-700 rounded animate-pulse" />}>
                    <Icon />
                  </Suspense>
                  <span class="font-medium text-gray-400">{project.name}</span>
                </a>
              </li>
            );
          }}
        </For>
      </ul>
    </div>
  );
}
import { Component, For, Show } from 'solid-js';
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from 'solid-icons/ai';

export interface CategoryItem {
  id: number;
  name: string;
}

interface CategoryColumnProps {
  title: string;
  items: CategoryItem[];
  selectedId: number | null;
  onSelect: (item: CategoryItem) => void;
  onAdd: () => void;
  onEdit: (item: CategoryItem) => void;
  onDelete: (item: CategoryItem) => void;
  isLoading?: boolean;
}

const CategoryColumn: Component<CategoryColumnProps> = (props) => {
  return (
    <div class="flex flex-col h-full bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700">
      {/* Column Header */}
      <div class="flex-shrink-0 flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
        <h2 class="font-semibold text-neutral-800 dark:text-neutral-200">{props.title}</h2>
        <button onClick={props.onAdd} class="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700">
          <AiOutlinePlus class="size-5" />
        </button>
      </div>
      
      {/* Column List */}
      <div class="flex-grow overflow-y-auto">
        <Show when={!props.isLoading} fallback={<p class="p-4 text-center text-sm dark:text-white text-neutral-500">Loading...</p>}>
          <ul class="p-2">
            <For each={props.items} fallback={<li class="p-4 text-center text-sm dark:text-white text-neutral-500">No {props.title.toLowerCase()} found.</li>}>
              {(item) => (
                <li>
                  <div
                    class="group flex items-center justify-between w-full dark:text-white  p-3 rounded-lg cursor-pointer transition-colors"
                    classList={{
                      'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300': props.selectedId === item.id,
                      'hover:bg-neutral-100 dark:hover:bg-neutral-700': props.selectedId !== item.id
                    }}
                    onClick={() => props.onSelect(item)}
                  >
                    <span class="font-medium text-sm">{item.name}</span>
                    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); props.onEdit(item); }} class="text-neutral-400 hover:text-indigo-600">
                        <AiOutlineEdit class="size-4" />
                      </button>
                       <button onClick={(e) => { e.stopPropagation(); props.onDelete(item); }} class="text-neutral-400 hover:text-red-600">
                        <AiOutlineDelete class="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </div>
  );
};

export default CategoryColumn;
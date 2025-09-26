import { Component, For, JSX, createSignal, createMemo } from 'solid-js';
import { AiOutlineLeft, AiOutlineRight, AiOutlineSearch } from 'solid-icons/ai';

export interface Column<T> {
  header: string;
  accessor: keyof T;
  cell?: (item: T) => JSX.Element;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  itemsPerPage?: number;
}

const Table: Component<TableProps<any>> = (props) => {
  const [currentPage, setCurrentPage] = createSignal(1);
  const itemsPerPage = () => props.itemsPerPage || 10;
  
  // --- NEW: State for the search query ---
  const [searchQuery, setSearchQuery] = createSignal("");
  let searchTimeout: number;

  // --- NEW: Debounced search handler ---
  const handleSearchInput = (e: Event) => {
    const query = (e.currentTarget as HTMLInputElement).value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setSearchQuery(query);
      setCurrentPage(1); // Reset to the first page on a new search
    }, 300); // 300ms debounce delay
  };

  // --- NEW: Memo to filter data based on the search query ---
  const filteredData = createMemo(() => {
    const query = searchQuery().toLowerCase();
    if (!query) return props.data;

    return props.data.filter(item => {
      // Search across all string values in the object
      return Object.values(item).some(value => 
        typeof value === 'string' && value.toLowerCase().includes(query)
      );
    });
  });

  // Memos for pagination now operate on the `filteredData`
  const totalPages = createMemo(() => Math.ceil(filteredData().length / itemsPerPage()));
  
  const paginatedData = createMemo(() => {
    const start = (currentPage() - 1) * itemsPerPage();
    const end = start + itemsPerPage();
    return filteredData().slice(start, end);
  });
  
  const canGoPrev = () => currentPage() > 1;
  const canGoNext = () => currentPage() < totalPages();

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages()) {
      setCurrentPage(page);
    }
  };

  return (
    // The main container for the table and its controls
    <div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
      
      {/* --- NEW: Search Bar and Header --- */}
      <div class="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <AiOutlineSearch class="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Search in table..."
            class="w-full sm:w-64 rounded-lg !cursor-text border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 
                   py-2 pl-10 pr-4 text-sm text-neutral-800 dark:text-neutral-200 
                   placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                   focus:border-indigo-500 focus:ring-indigo-500"
            onInput={handleSearchInput}
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-neutral-50 dark:bg-neutral-800/50">
            <tr>
              <For each={props.columns}>
                {(column) => (
                  <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {column.header}
                  </th>
                )}
              </For>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-200 dark:divide-neutral-700">
            <For each={paginatedData()} fallback={<TableRowEmpty colSpan={props.columns.length} />}>
              {(item) => (
                <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                  <For each={props.columns}>
                    {(column) => (
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        {column.cell ? column.cell(item) : item[column.accessor]}
                      </td>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>

      {/* --- PAGINATION CONTROLS (Updated) --- */}
      {/* Now they operate on `filteredData` length */}
      <nav class="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-700">
        <div class="text-sm text-neutral-600 dark:text-neutral-400">
          Showing <span class="font-semibold">{filteredData().length > 0 ? ((currentPage() - 1) * itemsPerPage()) + 1 : 0}</span> to <span class="font-semibold">{Math.min(currentPage() * itemsPerPage(), filteredData().length)}</span> of <span class="font-semibold">{filteredData().length}</span> results
        </div>
        <div class="flex items-center gap-2">
          <button onClick={() => goToPage(currentPage() - 1)} disabled={!canGoPrev()} class="p-2 rounded-md enabled:hover:bg-neutral-100 dark:enabled:hover:bg-neutral-700 disabled:opacity-50">
            <AiOutlineLeft class="size-4 dark:text-white" />
          </button>
          <span class="text-sm font-semibold dark:text-white">{totalPages() > 0 ? currentPage() : 0} / {totalPages()}</span>
          <button onClick={() => goToPage(currentPage() + 1)} disabled={!canGoNext()} class="p-2 rounded-md enabled:hover:bg-neutral-100 dark:enabled:hover:bg-neutral-700 disabled:opacity-50">
            <AiOutlineRight class="size-4 dark:text-white" />
          </button>
        </div>
      </nav>
    </div>
  );
};

// --- NEW: Helper component for the "no results" state ---
const TableRowEmpty: Component<{ colSpan: number }> = (props) => {
  return (
    <tr>
      <td colSpan={props.colSpan} class="text-center py-12 px-6">
        <div class="text-neutral-400">
          <AiOutlineSearch class="mx-auto size-8 mb-2" />
          <h3 class="font-semibold">No Results Found</h3>
          <p class="text-sm">Your search did not match any records.</p>
        </div>
      </td>
    </tr>
  );
};

export default Table;
import type { Component } from 'solid-js';
import { createSignal, createEffect, Show } from 'solid-js';
import DashboardLayout from '../../../layouts/DashboardLayout';
import CategoryColumn, { type CategoryItem } from '../../../components/admin/CategoryColumn';
import CategoryForm from '../../../components/forms/CategoryForm';
import ConfirmDeleteModal from '../../../components/modal/ConfirmDeleteModal';
import { useModal } from '../../../context/ModalContext';
import { sendRequest } from '../../../utils/SendRequest';


const AdminCategoriesPage: Component = () => {
  const { openModal, closeModal } = useModal();

  const [segments, setSegments] = createSignal<CategoryItem[]>([]);
  const [genres, setGenres] = createSignal<CategoryItem[]>([]);
  const [subGenres, setSubGenres] = createSignal<CategoryItem[]>([]);

  const [selectedSegment, setSelectedSegment] = createSignal<CategoryItem | null>(null);
  const [selectedGenre, setSelectedGenre] = createSignal<CategoryItem | null>(null);

  const [loading, setLoading] = createSignal({ segments: true, genres: false, subGenres: false });
  const [apiError, setApiError] = createSignal<string | null>(null);

  // --- API Functions ---
  const fetchSegments = async () => {
    setLoading(p => ({ ...p, segments: true }));
    setApiError(null);
    try {
      const data = await sendRequest<CategoryItem[]>('/categories/segments');
      setSegments(data);
    } catch (err: any) { setApiError(err.message); } 
    finally { setLoading(p => ({ ...p, segments: false })); }
  };

  const fetchGenres = async (segmentId: number) => {
    setLoading(p => ({ ...p, genres: true }));
    try {
      const data = await sendRequest<CategoryItem[]>(`/categories/segments/${segmentId}/genres`);
      setGenres(data);
    } catch (err: any) { setApiError(err.message); } 
    finally { setLoading(p => ({ ...p, genres: false })); }
  };

  const fetchSubGenres = async (genreId: number) => {
    setLoading(p => ({ ...p, subGenres: true }));
    try {
      const data = await sendRequest<CategoryItem[]>(`/categories/genres/${genreId}/sub-genres`);
      setSubGenres(data);
    } catch (err: any) { setApiError(err.message); } 
    finally { setLoading(p => ({ ...p, subGenres: false })); }
  };

  createEffect(() => { fetchSegments(); });
  createEffect(async () => {
    const segment = selectedSegment();
    setSelectedGenre(null);
    setGenres([]);
    if (segment) await fetchGenres(segment.id);
  });
  createEffect(async () => {
    const genre = selectedGenre();
    setSubGenres([]);
    if (genre) await fetchSubGenres(genre.id);
  });

  // --- CRUD Handlers ---
  const handleAdd = (itemType: 'Segment' | 'Genre' | 'Sub-Genre') => {
    let parentId: number | null = null;
    let endpoint = '';
    
    if (itemType === 'Genre') {
      if (!selectedSegment()) return; // Should not happen
      parentId = selectedSegment()!.id;
      endpoint = `/admin/categories/segments/${parentId}/genres`;
    } else if (itemType === 'Sub-Genre') {
      if (!selectedGenre()) return; // Should not happen
      parentId = selectedGenre()!.id;
      endpoint = `/admin/categories/genres/${parentId}/sub-genres`;
    } else {
      endpoint = '/admin/categories/segments';
    }

    const onSuccess = async (name: string) => {
      await sendRequest(endpoint, { method: 'POST', body: { name } });
      closeModal();
      // Re-fetch the appropriate list
      if (itemType === 'Genre') await fetchGenres(parentId!);
      else if (itemType === 'Sub-Genre') await fetchSubGenres(parentId!);
      else await fetchSegments();
    };
    openModal(`Create New ${itemType}`, () => <CategoryForm itemType={itemType} onSubmit={onSuccess} />);
  };

  const handleEdit = (item: CategoryItem, itemType: 'Segment' | 'Genre' | 'Sub-Genre') => {
    const endpoint = `/admin/categories/${itemType.toLowerCase()}s/${item.id}`;
    const onSuccess = async (name: string) => {
      await sendRequest(endpoint, { method: 'PATCH', body: { name } });
      closeModal();
      // Re-fetch based on type
      if (itemType === 'Genre') await fetchGenres(selectedSegment()!.id);
      else if (itemType === 'Sub-Genre') await fetchSubGenres(selectedGenre()!.id);
      else await fetchSegments();
    };
    openModal(`Edit ${itemType}`, () => <CategoryForm itemType={itemType} initialName={item.name} onSubmit={onSuccess} />);
  };

  const handleDelete = (item: CategoryItem, itemType: 'Segment' | 'Genre' | 'Sub-Genre') => {
    const endpoint = `/admin/categories/${itemType.toLowerCase()}s/${item.id}`;
    const onConfirm = async () => {
      await sendRequest(endpoint, { method: 'DELETE' });
      closeModal();
      
      // --- THIS IS THE FIX ---
      // After deleting, we reset the selection state and re-fetch the parent list.
      if (itemType === 'Segment') {
        setSelectedSegment(null); // This will hide the Genre and Sub-Genre columns
        await fetchSegments();
      } else if (itemType === 'Genre') {
        setSelectedGenre(null); // This will hide the Sub-Genre column
        await fetchGenres(selectedSegment()!.id);
      } else if (itemType === 'Sub-Genre') {
        await fetchSubGenres(selectedGenre()!.id);
      }
    };
    openModal("Confirm Deletion", () => <ConfirmDeleteModal itemName={item.name} itemType={itemType} onConfirm={onConfirm} />);
  };


  return (
    <DashboardLayout>
      <div class="p-4 sm:p-6 lg:p-8 w-full">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Categories</h1>
          <p class="mt-1 text-neutral-500 dark:text-neutral-400">Manage event segments, genres, and sub-genres.</p>
        </div>
        
        <Show when={apiError()}><div class="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">{apiError()}</div></Show>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[75vh]">
          <CategoryColumn 
            title="Segments" items={segments()} selectedId={selectedSegment()?.id || null}
            onSelect={setSelectedSegment} onAdd={() => handleAdd('Segment')}
            onEdit={(item) => handleEdit(item, 'Segment')} onDelete={(item) => handleDelete(item, 'Segment')}
            isLoading={loading().segments}
          />
          <Show when={selectedSegment()}>
            <CategoryColumn 
              title="Genres" items={genres()} selectedId={selectedGenre()?.id || null}
              onSelect={setSelectedGenre} onAdd={() => handleAdd('Genre')}
              onEdit={(item) => handleEdit(item, 'Genre')} onDelete={(item) => handleDelete(item, 'Genre')}
              isLoading={loading().genres}
            />
          </Show>
          <Show when={selectedGenre()}>
            <CategoryColumn 
              title="Sub-Genres" items={subGenres()} selectedId={null}
              onSelect={() => {}} onAdd={() => handleAdd('Sub-Genre')}
              onEdit={(item) => handleEdit(item, 'Sub-Genre')} onDelete={(item) => handleDelete(item, 'Sub-Genre')}
              isLoading={loading().subGenres}
            />
          </Show>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminCategoriesPage;
import type { Component } from 'solid-js';
import { createSignal, onMount, For, Show } from 'solid-js';
import DashboardLayout from '../../../layouts/DashboardLayout';
import Table, { type Column } from '../../../components/table/Table';
import UserForm from '../../../components/forms/UserForm';
import ConfirmDeleteModal from '../../../components/modal/ConfirmDeleteModal';
import { useModal } from '../../../context/ModalContext';
import { sendRequest } from '../../../utils/SendRequest';
import { AiOutlinePlusCircle, AiOutlineEdit, AiOutlineDelete, AiOutlineLoading } from 'solid-icons/ai';

// --- Type Definition based on your Rust 'User' struct ---
type User = {
  id: number;
  username: string;
  email: string;
  role: 'attendee' | 'organizer';
  created_at: string;
};

const RoleBadge: Component<{ role: User['role'] }> = (props) => (
  <span class={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${
    props.role === 'organizer' 
      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300' 
      : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300'
  }`}>
    {props.role.charAt(0).toUpperCase() + props.role.slice(1)}
  </span>
);

// --- A Simple Loading Spinner Component ---
const LoadingSpinner: Component = () => (
  <div class="flex justify-center items-center h-full">
    <AiOutlineLoading class="animate-spin size-8 text-indigo-500" />
  </div>
);


const AdminUsersPage: Component = () => {
  const { openModal, closeModal } = useModal();
  const [users, setUsers] = createSignal<User[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [apiError, setApiError] = createSignal<string | null>(null);

  // --- API Functions ---
  const fetchUsers = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Corrected to use the admin-specific endpoint for listing all users
      const fetchedUsers = await sendRequest<User[]>('/admin/users');
      setUsers(fetchedUsers);
    } catch (err: any) {
      setApiError(err.message || 'Failed to fetch users.');
    } finally {
      setIsLoading(false);
    }
  };

  onMount(fetchUsers);

  const handleCreate = async (formData: Partial<User>) => {
    // Admins create users through the admin endpoint
    await sendRequest('admin/users', { method: 'POST', body: formData });
    closeModal();
    await fetchUsers(); // Refresh list
  };
  
  const handleUpdate = async (formData: Partial<User>) => {
    // Admins update users through the admin endpoint
    await sendRequest(`admin/users/${formData.id}`, { method: 'PATCH', body: formData });
    closeModal();
    await fetchUsers(); // Refresh list
  };
  
  const handleDelete = async (userId: number) => {
    // Admins delete users through the admin endpoint
    await sendRequest(`admin/users/${userId}`, { method: 'DELETE' });
    closeModal();
    await fetchUsers(); // Refresh list
  };

  // --- Modal Triggers ---
  const handleCreateClick = () => {
    openModal("Create New User", () => <UserForm onSubmit={handleCreate} />);
  };
  const handleEditClick = (user: User) => {
    // Exclude password from the initial data passed to the form
    const { password_hash, ...editableData } = user; 
    openModal(`Edit User: ${user.username}`, () => <UserForm onSubmit={handleUpdate} initialData={editableData} />);
  };
  const handleDeleteClick = (user: User) => {
    openModal("Confirm Deletion", () => <ConfirmDeleteModal itemType="User" itemName={user.username} onConfirm={() => handleDelete(user.id)} />);
  };

  // --- Table Column Definitions ---
  const columns: Column<User>[] = [
    { 
      header: 'User', 
      accessor: 'username',
      cell: (item) => (
        <div>
          <p class="font-semibold text-neutral-800 dark:text-neutral-200">{item.username}</p>
          <p class="text-xs text-neutral-500">{item.email}</p>
        </div>
      )
    },
    { header: 'Role', accessor: 'role', cell: (item) => <RoleBadge role={item.role} /> },
    { header: 'Date Joined', accessor: 'created_at', cell: (item) => new Date(item.created_at).toLocaleDateString('en-US', { dateStyle: 'long' }) },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (item) => (
        <div class="flex items-center gap-x-4">
          <button onClick={() => handleEditClick(item)} class="text-indigo-600 hover:text-indigo-800" title="Edit User"><AiOutlineEdit class="size-5" /></button>
          <button onClick={() => handleDeleteClick(item)} class="text-red-500 hover:text-red-700" title="Delete User"><AiOutlineDelete class="size-5" /></button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div class="p-4 sm:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto">
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-neutral-800 dark:text-neutral-200">Manage Users</h1>
            <p class="mt-1 text-neutral-500 dark:text-neutral-400">Oversee all user accounts on the platform.</p>
          </div>
          <button onClick={handleCreateClick} class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
            <AiOutlinePlusCircle /> Create User
          </button>
        </div>

        <Show when={apiError()}><div class="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">{apiError()}</div></Show>
        
        <Show when={!isLoading()} fallback={<LoadingSpinner />}>
          <div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
            <Table data={users()} columns={columns} itemsPerPage={10} />
          </div>
        </Show>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsersPage;
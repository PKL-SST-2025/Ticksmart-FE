import { Component, createSignal } from 'solid-js';
import { useModal } from '../../context/ModalContext';
import { AiOutlineExclamationCircle } from 'solid-icons/ai';

interface ConfirmDeleteModalProps {
  itemName: string;
  itemType?: string;
  onConfirm: () => Promise<void>;
}

const ConfirmDeleteModal: Component<ConfirmDeleteModalProps> = (props) => {
  const { closeModal } = useModal();
  const [isDeleting, setIsDeleting] = createSignal(false);

  const handleConfirmClick = async () => {
    setIsDeleting(true);
    try {
      await props.onConfirm();
    } catch (error) {
      console.error("Deletion failed:", error);
      // You could show an error toast here
    } finally {
      // No need to set isDeleting(false) as the modal will close
    }
  };

  return (
    <div class="text-center">
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
        <AiOutlineExclamationCircle class="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
      </div>
      <div class="mt-3">
        <h3 class="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Delete {props.itemType || 'Item'}</h3>
        <div class="mt-2">
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete <span class="font-bold">{props.itemName}</span>? This action cannot be undone.
          </p>
        </div>
      </div>
      <div class="mt-6 flex justify-center gap-3">
        <button type="button" class="px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600" onClick={closeModal}>
          Cancel
        </button>
        <button
          type="button" class="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          onClick={handleConfirmClick} disabled={isDeleting()}
        >
          {isDeleting() ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
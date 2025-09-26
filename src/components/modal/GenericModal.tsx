import { Component, Show, createEffect } from "solid-js";
import { useModal } from "../../context/ModalContext";
import { Portal } from 'solid-js/web';
import { AiOutlineClose } from "solid-icons/ai";

const GenericModal: Component = () => {
  const { isOpen, title, content, closeModal } = useModal();

  // Effect to prevent body scrolling when the modal is open
  createEffect(() => {
    document.body.style.overflow = isOpen() ? 'hidden' : '';
  });

  return (
    <Portal>
      {/* Backdrop */}
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300"
        classList={{
          'opacity-100 bg-black/50': isOpen(),
          'opacity-0 pointer-events-none': !isOpen()
        }}
        onClick={closeModal} // Close when clicking the backdrop
      >
        {/* Modal Panel */}
        <div
          class="w-full max-w-4xl bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 transition-all duration-300"
          classList={{
            'opacity-100 translate-y-0': isOpen(),
            'opacity-0 -translate-y-10': !isOpen()
          }}
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
        >
          {/* Header */}
          <div class="flex justify-between items-center py-4 px-6 border-b border-neutral-200 dark:border-neutral-700">
            <h3 class="font-bold text-lg text-neutral-800 dark:text-white">
              {title()}
            </h3>
            <button
              type="button"
              class="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
              onClick={closeModal}
            >
              <span class="sr-only">Close</span>
              <AiOutlineClose class="size-5" />
            </button>
          </div>

          {/* Body */}
          <div class="p-6 overflow-y-auto max-h-[70vh]">
            {/* --- THIS IS THE FIX ---
                We check if the `content` function exists.
                If it does, we CALL it with `content()()` to get the JSX.
            */}
            {content() && content()!()}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default GenericModal;
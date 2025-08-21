// src/components/ProjectDashboard/Modal.tsx (NEW FILE)

import { Show, type Component, type JSX } from "solid-js";
import { Portal } from "solid-js/web";
import { TbX } from "solid-icons/tb";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: JSX.Element;
}

const Modal: Component<ModalProps> = (props) => {
    return (
        <Show when={props.isOpen}>
            <Portal>
                <div 
                    class="fixed inset-0 bg-black/60 z-40 flex items-center justify-center"
                    onClick={props.onClose}
                >
                    <div 
                        class="bg-gray-800 rounded-xl border border-gray-700/50 shadow-2xl w-full max-w-md m-4"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        <div class="flex justify-between items-center p-4 border-b border-gray-700">
                            <h2 class="text-lg font-bold text-white">{props.title}</h2>
                            <button onClick={props.onClose} class="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white">
                                <TbX size={20} />
                            </button>
                        </div>
                        <div class="p-6">
                            {props.children}
                        </div>
                    </div>
                </div>
            </Portal>
        </Show>
    );
};

export default Modal;
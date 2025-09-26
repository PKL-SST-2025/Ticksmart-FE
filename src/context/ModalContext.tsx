import { createContext, useContext, createSignal, JSX, Component, Accessor } from 'solid-js';

// The "contract": The content must be a function that returns JSX.
type Renderable = () => JSX.Element;

type ModalContextType = {
  isOpen: Accessor<boolean>;
  title: Accessor<string>;
  content: Accessor<Renderable | null>;
  openModal: (title: string, content: Renderable) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextType>();

export const ModalProvider: Component<{ children: JSX.Element }> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [title, setTitle] = createSignal("");
  const [content, setContent] = createSignal<Renderable | null>(null);

  const openModal = (newTitle: string, newContent: Renderable) => {
    setTitle(newTitle);
    setContent(() => newContent); // Store the function
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setTitle("");
      setContent(null);
    }, 300); // Allow for fade-out animation
  };

  const value = { isOpen, title, content, openModal, closeModal };

  return (
    <ModalContext.Provider value={value}>
      {props.children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within a ModalProvider");
  return context;
};
import { Component, createSignal, createEffect } from 'solid-js';

interface Props {
  src: string;
  alt: string;
  class?: string;
}

const ImageWithFallback: Component<Props> = (props) => {
  const fallbackSrc = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-family="sans-serif" font-size="24">Image not available</text></svg>';

  // --- THIS IS THE FIX ---
  // 1. Create an internal signal to manage the source URL.
  const [currentSrc, setCurrentSrc] = createSignal(props.src);

  // 2. Use `createEffect` to listen for changes to the *prop*.
  //    When `props.src` changes from the parent, this effect runs and resets
  //    our internal `currentSrc` signal to the new prop value. This is the key.
  createEffect(() => {
    setCurrentSrc(props.src || fallbackSrc);
  });

  const handleError = () => {
    // 3. If an error occurs, we only change our internal signal.
    setCurrentSrc(fallbackSrc);
  };

  return (
    // 4. The <img> tag is now driven by the reliable internal signal.
    <img
      src={currentSrc()}
      alt={props.alt}
      class={props.class}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default ImageWithFallback;
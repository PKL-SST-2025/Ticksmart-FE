import type { ParentComponent } from 'solid-js';
import { Show } from 'solid-js';

type Props = {
  withDashed?: boolean;
  class?: string;
};

// This container provides consistent max-width and padding for all pages.
const PageContainer: ParentComponent<Props> = (props) => {
  return (
    <div class={`max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans ${props.class ?? ''}`}>
      <Show 
        when={props.withDashed}
        fallback={props.children}
      >
        <div class="p-4 sm:p-6 border border-white/10 rounded-xl bg-white/5">
          {props.children}
        </div>
      </Show>
    </div>
  );
};

export default PageContainer;
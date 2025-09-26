import type { Component } from 'solid-js';
import { A } from '@solidjs/router';
import { AiOutlineArrowLeft } from 'solid-icons/ai';

const NotFoundPage: Component = () => {
  return (
    <main class="min-h-screen w-full bg-white dark:bg-neutral-900 flex items-center justify-center text-center p-4">
      <div>
        <p class="text-5xl sm:text-7xl font-bold text-indigo-600 dark:text-indigo-400">404</p>
        <h1 class="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-neutral-800 dark:text-neutral-200">
          Page Not Found
        </h1>
        <p class="mt-6 text-base text-neutral-600 dark:text-neutral-400">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <A
            href="/"
            class="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <AiOutlineArrowLeft />
            Go Back Home
          </A>
          <A href="/contact" class="text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:underline">
            Contact support <span aria-hidden="true">&rarr;</span>
          </A>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
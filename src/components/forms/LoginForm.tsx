import { Component, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { AiOutlineMail, AiOutlineKey } from 'solid-icons/ai';
import FloatingLabelInput from '../input/FloatingLabelInput'; // Assuming path

// This component only cares about displaying the form and emitting events.
interface LoginFormProps {
  form: { email: string; password: string };
  apiError: string;
  isLoading: boolean;
  onInput: (e: Event) => void;
  onSubmit: (e: Event) => void;
  onSwitch: () => void; // Event to trigger the switch to register view
}

const LoginForm: Component<LoginFormProps> = (props) => {
  return (
    <div class="w-full">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-neutral-400">Sign in to continue.</p>
      </div>

      <form class="mt-8 space-y-6" onSubmit={props.onSubmit}>
        <FloatingLabelInput name="email" label="Email Address" icon={AiOutlineMail} type="email" value={props.form.email} onInput={props.onInput} />
        <FloatingLabelInput name="password" label="Password" icon={AiOutlineKey} type="password" value={props.form.password} onInput={props.onInput} />
        
        <div class="text-right text-sm">
          <A href="/forgot-password" class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            Forgot password?
          </A>
        </div>

        <Show when={props.apiError}>
          <p class="text-sm text-center text-red-500">{props.apiError}</p>
        </Show>

        <div class="pt-2">
          <button type="submit" disabled={props.isLoading} class="w-full flex cursor-pointer justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-800 transition-colors disabled:opacity-50">
            {props.isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-neutral-400">
            Don't have an account?{' '}
            <button type="button" onClick={props.onSwitch} class="font-medium cursor-pointer text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Register here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
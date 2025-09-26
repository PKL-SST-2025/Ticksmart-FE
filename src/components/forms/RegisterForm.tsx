import type { Component } from 'solid-js';
import { A } from '@solidjs/router';
import { AiOutlineUser, AiOutlineMail, AiOutlineKey } from 'solid-icons/ai';
import FloatingLabelInput from '../input/FloatingLabelInput';
import PasswordStrengthMeter from '../ui/PasswordStrengthMeter';

// --- THE FIX (Part 1): Update the props interface ---
interface RegisterFormProps {
  form: { 
    username: string; 
    email: string; 
    password: string; 
    confirmPassword: string; // Add the new field
  };
  errors: Record<string, string>;
  isLoading: boolean;
  onInput: (e: Event) => void;
  onSubmit: (e: Event) => void;
  onSwitch: () => void;
}

const RegisterForm: Component<RegisterFormProps> = (props) => {
  return (
    <div class="w-full">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Create an Account</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-neutral-400">Let's get you started.</p>
      </div>

      <form class="mt-8 space-y-6" onSubmit={props.onSubmit}>
        <FloatingLabelInput 
          name="username" 
          label="Username" 
          icon={AiOutlineUser} 
          type="text" 
          value={props.form.username} 
          onInput={props.onInput} 
          error={props.errors.username} 
        />
        <FloatingLabelInput 
          name="email" 
          label="Email Address" 
          icon={AiOutlineMail} 
          type="email" 
          value={props.form.email} 
          onInput={props.onInput} 
          error={props.errors.email} 
        />
        <div>
          <FloatingLabelInput name="password" label="Password" icon={AiOutlineKey} type="password" value={props.form.password} onInput={props.onInput} error={props.errors.password} />
          <PasswordStrengthMeter password={props.form.password} />
        </div>
        
        <FloatingLabelInput name="confirmPassword" label="Confirm Password" icon={AiOutlineKey} type="password" value={props.form.confirmPassword} onInput={props.onInput} error={props.errors.confirmPassword} />
        
        
        <div class="pt-2">
          <button type="submit" disabled={props.isLoading} class="w-full cursor-pointer flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-800 transition-colors disabled:opacity-50">
            {props.isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-neutral-400">
            Already have an account?{' '}
            <button type="button" onClick={props.onSwitch} class="font-medium cursor-pointer text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Sign in
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
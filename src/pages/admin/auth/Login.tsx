import { Component, createSignal, Show, onMount, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { AiOutlineMail, AiOutlineKey, AiOutlineSafetyCertificate } from 'solid-icons/ai';
import gsap from "gsap";

import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import { sendRequest } from "../../../utils/SendRequest";
import { useAdmin } from "../../../context/AdminContext";
const AdminLoginPage: Component = () => {
  const navigate = useNavigate();
  const { isAdminAuthenticated, refetchAdmin } = useAdmin();

  // Redirect if already logged in as an admin
  createEffect(() => {
    if (isAdminAuthenticated()) {
      navigate("/admin/dashboard", { replace: true });
    }
  });

  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  let formContainer: HTMLDivElement | undefined;

  onMount(() => {
    gsap.from(".form-element", {
      opacity: 0, y: 20, duration: 0.5, stagger: 0.1, ease: "power2.out",
    });
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      // 1. Call the admin login endpoint to set the cookie.
      await sendRequest('/auth/admin/login', {
        method: 'POST',
        body: { email: email(), password: password() },
      });

      // 2. Call the dedicated refetch function from the AdminContext.
      // This will call `/api/admin/me` and update the global admin state.
      await refetchAdmin();
      
            navigate("/admin/dashboard", { replace: true });

      
      // 3. The redirect effect above will now fire.
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
            gsap.fromTo(formContainer, { x: -6 }, {
        x: 6, duration: 0.07, repeat: 5, yoyo: true, clearProps: "x", ease: "power1.inOut"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Only render the page if the user is not authenticated or is not an admin
    <Show when={!isAdminAuthenticated()}>
      <main class="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-neutral-900 p-4">
        <div ref={formContainer} class="w-full max-w-sm bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-sm">
          <form onSubmit={handleSubmit} class="p-8 sm:p-10 space-y-6">
            <div class="text-center form-element">
              <div class="inline-flex justify-center items-center size-12 bg-gray-100 dark:bg-neutral-700 rounded-full mb-4">
                <AiOutlineSafetyCertificate class="size-6 text-indigo-600 dark:text-indigo-500" />
              </div>
              <h1 class="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-neutral-200">
                Admin Portal
              </h1>
              <p class="mt-1 text-sm text-gray-600 dark:text-neutral-400">
                Please sign in to continue.
              </p>
            </div>
            
            <div class="form-element">
              <FloatingLabelInput label="Email Address" name="email" type="email" icon={AiOutlineMail} value={email()} onInput={(e) => setEmail(e.currentTarget.value)} />
            </div>
            <div class="form-element">
              <FloatingLabelInput label="Password" name="password" type="password" icon={AiOutlineKey} value={password()} onInput={(e) => setPassword(e.currentTarget.value)} />
            </div>

            <Show when={error()}><p class="text-xs text-center text-red-600 dark:text-red-500 -my-2">{error()}</p></Show>

            <div class="form-element pt-2">
              <button type="submit" disabled={isLoading()} class="w-full py-3 bg-indigo-600 hover:bg-indigo-500 dark:text-white cursor-pointer rounded-lg">
                {isLoading() ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </Show>
  );
};

export default AdminLoginPage;
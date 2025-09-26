import type { Component } from 'solid-js';
import { createStore } from 'solid-js/store';
import { createSignal, onMount, onCleanup, createEffect, on, Show } from 'solid-js';
import { useNavigate, useLocation, A } from '@solidjs/router';
import gsap from 'gsap';

import LoginForm from '../components/forms/LoginForm';
import RegisterForm from '../components/forms/RegisterForm';

import { sendRequest } from '../utils/SendRequest'; 
import { useUser } from '../context/UserContext';
import { useAdmin } from '../context/AdminContext';
const AuthPage: Component = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoginView, setIsLoginView] = createSignal(true);
  const [isInitialLoad, setIsInitialLoad] = createSignal(true);
  
  const [loginForm, setLoginForm] = createStore({ email: '', password: '' });
  const [registerForm, setRegisterForm] = createStore({ username: '', email: '', password: '', confirmPassword: '' });
  const [registerErrors, setRegisterErrors] = createStore<Record<string, string>>({});
  const [apiError, setApiError] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);

  // --- Refs & Animations (unchanged) ---
  let logoRef: HTMLDivElement | undefined;
  let shape1Ref: HTMLDivElement | undefined;
  let shape2Ref: HTMLDivElement | undefined;
  let loginContainerRef: HTMLDivElement | undefined;
  let registerContainerRef: HTMLDivElement | undefined;

  createEffect(() => {
    const isLoginPath = location.pathname.includes('/login');
    if (isLoginView() !== isLoginPath) setIsLoginView(isLoginPath);
  });

  const { isAuthenticated, user, refetchUser } = useUser();
  const { isAdminAuthenticated } = useAdmin();


  // --- NEW: Redirect if already logged in ---
  createEffect(() => {

    if (isAuthenticated() && useUser().isBoarding() == true) {
      navigate("/organizer/onboarding", {resolve: true})
    }
    if (isAdminAuthenticated()) {
        navigate("/admin/dashboard", { replace: true });
    }

    if (isAuthenticated()) {
      // Redirect to the correct dashboard based on role
      const role = user()?.role;

      if (role === 'organizer') {
        navigate("/organizer/dashboard", { replace: true });
      } 
      else {
        navigate("/dashboard", { replace: true });
      }
    }
  });

  
  createEffect(on(isLoginView, (isLogin, prev) => {
    if (isInitialLoad() || prev === undefined) {
      setIsInitialLoad(false);
      return;
    }
    animateSwitch(isLogin);
  }));
  onMount(() => {
    gsap.to(logoRef, { y: -8, duration: 2.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    const bgTimeline = gsap.timeline({ repeat: -1, yoyo: true });
    bgTimeline
      .to(shape1Ref, { y: -40, rotation: 25, duration: 30, ease: 'sine.inOut' })
      .to(shape2Ref, { y: 40, x: -30, rotation: -20, duration: 25, ease: 'sine.inOut' }, "<");
  });
  onCleanup(() => {
    gsap.killTweensOf([logoRef, shape1Ref, shape2Ref, loginContainerRef, registerContainerRef]);
  });
  const animateSwitch = (showLogin: boolean) => {
    const outgoing = showLogin ? registerContainerRef : loginContainerRef;
    const incoming = showLogin ? loginContainerRef : registerContainerRef;
    const timeline = gsap.timeline();
    timeline
      .to(outgoing, { autoAlpha: 0, y: -20, duration: 0.3, ease: 'power2.in' })
      .set(outgoing, { display: 'none' })
      .set(incoming, { display: 'block', y: 20, autoAlpha: 0 })
      .to(incoming, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' });
  };
  const handleSwitch = () => {
    const newIsLogin = !isLoginView();
    setIsLoginView(newIsLogin); 
    navigate(newIsLogin ? '/login' : '/register', { replace: true });
  };
  
  // --- LOGIN FORM HANDLERS ---
  const handleLoginInput = (e: Event) => {
    const { name, value } = e.currentTarget as HTMLInputElement;
    setLoginForm(name as 'email' | 'password', value);
  };

  const handleLoginSubmit = async (e: Event) => {
    e.preventDefault();
    setApiError('');
    setIsLoading(true);
    try {
      await sendRequest('/auth/login', {
        method: 'POST',
        body: { email: loginForm.email, password: loginForm.password },
      });
      
      // --- THE FIX: Refetch user data after login ---
      // This updates the global state and will trigger the redirect effect above.
      await refetchUser();

    } catch (err: any) {
      setApiError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };
  // --- REGISTER FORM HANDLERS ---
  const handleRegisterInput = (e: Event) => {
    const { name, value } = e.currentTarget as HTMLInputElement;
    setRegisterForm(name as 'username' | 'email' | 'password', value);
    if (registerErrors[name]) setRegisterErrors(name, undefined);
  };

  // --- REWRITTEN with API call ---
  const handleRegisterSubmit = async (e: Event) => {
    e.preventDefault();
    setRegisterErrors({});
    setApiError('');
    setIsLoading(true);

        if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterErrors({ confirmPassword: "Passwords do not match." });
      setIsLoading(false);

      return;
    }

    // Client-side validation (unchanged)
    const errors: Record<string, string> = {};
    if (!registerForm.username) errors.username = "Username is required.";
    if (!/^\S+@\S+\.\S+$/.test(registerForm.email)) errors.email = "Please enter a valid email.";
    if (registerForm.password.length < 8) errors.password = "Password must be at least 8 characters.";
    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      // Use the sendRequest utility to call the backend
      await sendRequest('/auth/register', {
        method: 'POST',
        body: {
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
          confirm_password: registerForm.confirmPassword,
        },
      });
      // A great UX is to switch to the login view after successful registration
      handleSwitch();
    } catch (err: any) {
      // Handle backend errors (e.g., "Email already exists")
      // Check if the error is an object (per-field errors) or a string (general error)
      if (typeof err === 'object' && err !== null && !err.message) {
        // It's a validation error object from the backend, e.g., { password: "Password is not strong enough." }
        setRegisterErrors(err);
        setIsLoading(false);
      } else {
        // It's a general error message
      setIsLoading(false);

        setApiError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
      setIsLoading(false);

  } 

  return (
     <Show when={!isAuthenticated()}>
    <main class="relative min-h-screen w-full bg-zinc-100 dark:bg-neutral-900 flex items-center justify-center p-4 overflow-hidden">
      <div class="absolute inset-0 z-0">
        <div ref={shape1Ref} class="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-indigo-200 dark:bg-indigo-500/20 filter blur-3xl opacity-50"></div>
        <div ref={shape2Ref} class="absolute bottom-[10%] right-[5%] w-96 h-96 rounded-3xl bg-purple-200 dark:bg-purple-500/20 filter blur-3xl opacity-40"></div>
      </div>
      
      <div class="relative z-10 w-full max-w-md mx-auto bg-white/70 dark:bg-neutral-800/60 backdrop-blur-xl p-8 rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl dark:shadow-none">
        <div class="mx-auto w-16 h-16 mb-6" ref={logoRef}>
          <div class="w-full h-full rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30">
            <span class="font-bold text-2xl text-indigo-600 dark:text-indigo-400">T</span>
          </div>
        </div>

        {/* --- Animation Container --- */}
        <div class="relative h-[32rem]"> {/* Fixed height helps prevent layout shifts */}
          <div ref={loginContainerRef} classList={{ 'hidden': !isLoginView() }} style={isLoginView() ? '' : 'display: none;'}>
            <LoginForm form={loginForm} apiError={apiError()} isLoading={isLoading()} onInput={handleLoginInput} onSubmit={handleLoginSubmit} onSwitch={handleSwitch} />
          </div>
          <div ref={registerContainerRef} classList={{ 'hidden': isLoginView() }} style={!isLoginView() ? '' : 'display: none;'}>
            <RegisterForm form={registerForm} errors={registerErrors} isLoading={isLoading()} onInput={handleRegisterInput} onSubmit={handleRegisterSubmit} onSwitch={handleSwitch} />
          </div>
        </div>


        {/* --- NEW: Organizer Portal Section --- */}
        <div class="mt-6 text-center">
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            Are you an event organizer?
          </p>
          <A
            href="/organizer/login" 
            class="mt-2 inline-block font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Go to Organizer Portal 
          </A>
        </div>
      </div>
    </main>
    </Show>
  );
};

export default AuthPage;
import { Component, createSignal, For, onMount, onCleanup, Show, createEffect } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { 
  AiOutlineMail, 
  AiOutlineKey,
  AiOutlineQrcode,
  AiOutlineUsergroupAdd,
  AiOutlineBarChart,
  AiOutlineGlobal,
  AiOutlineArrowLeft
} from 'solid-icons/ai';
import gsap from "gsap";

import { useUser } from "../../../context/UserContext";
import ThemedFloatingLabelInput from "../../../components/input/ThemedFloatingLabelInput";
import { createStore } from "solid-js/store";
import { sendRequest } from "../../../utils/SendRequest";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import { useAdmin } from "../../../context/AdminContext";

// Data for the left-hand benefits panel
const benefits = [
  { icon: AiOutlineQrcode, title: "Effortless Ticket Sales", description: "Create tiered tickets, manage inventory, and sell directly to your audience with our seamless checkout process." },
  { icon: AiOutlineUsergroupAdd, title: "Seamless Attendee Management", description: "Keep track of your attendees, communicate updates, and manage check-ins all in one place." },
  { icon: AiOutlineBarChart, title: "Powerful Event Analytics", description: "Gain valuable insights into your sales, audience demographics, and event performance to grow your brand." },
  { icon: AiOutlineGlobal, title: "Reach a Wider Audience", description: "List your events on our marketplace and tap into a new community of potential attendees." }
];

const OrganizerLoginPage: Component = () => {
  const navigate = useNavigate();
  const { isAuthenticated, refetchUser, user, isBoarding } = useUser();
  const { isAdminAuthenticated, refetchAdmin, admin } = useAdmin();

  // --- NEW: Redirect if already logged in ---
  createEffect(() => {

    if (isAdminAuthenticated()) {
        navigate("/admin/dashboard", { replace: true });
    }

    if (isAuthenticated()   && !isBoarding()) {
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


    createEffect(() => {
    // If the user is logged in AND they are in the middle of onboarding,
    // force them to the onboarding page.
    if (isAuthenticated() && isBoarding()) {
      navigate('/organizer/onboarding', { replace: true });
    }
  });


  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);

    const [form, setForm] = createStore({ email: '', password: '' });
  const [apiError, setApiError] = createSignal("");
  let formContainer: HTMLDivElement | undefined;
  onMount(() => {
    gsap.from(".animate-in", {
      opacity: 0, y: 20, duration: 0.6, stagger: 0.1, ease: "power2.out"
    });

    // Idle animation for benefit icons with stagger
    gsap.to(".benefit-icon", {
      y: -5,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 1,
      // The stagger effect is applied here
      stagger: {
        each: 0.2, // Time between each icon's animation start
        from: "random" // Animate icons in a random order for a natural feel
      }
    });
  });

  onCleanup(() => {
    gsap.killTweensOf(".animate-in");
    gsap.killTweensOf(".benefit-icon");
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setApiError("");
    setIsLoading(true);
    try {
      // Call the standard /api/auth/login endpoint
      await sendRequest('/auth/login', {
        method: 'POST',
        body: {
          email: form.email,
          password: form.password,
        },
      });
      
      // After a successful login, refetch the user data to update the global context.
      // This will trigger the redirect effect above.
      await refetchUser();

    } catch (err: any) {
      setApiError(err.message || "Login failed. Please check your credentials.");
      gsap.fromTo(formContainer, { x: -6 }, {
        x: 6, duration: 0.07, repeat: 5, yoyo: true, clearProps: "x", ease: "power1.inOut"
      });
    } finally {
      setIsLoading(false);
    }
  };

    const handleInput = (e: Event) => {
    const { name, value } = e.currentTarget as HTMLInputElement;
    setForm(name as keyof typeof form, value);
  };


  return (
    <main class="min-h-screen w-full concert-image flex items-center justify-center p-4 relative">
      
      <A 
        href="/" 
        class="animate-in absolute top-4 left-4 lg:top-6 lg:left-6 z-20 flex items-center gap-x-2 text-white bg-black/30 backdrop-blur-md rounded-full py-2 px-4 text-sm hover:bg-black/50 transition-colors"
      >
        <AiOutlineArrowLeft />
        Back to Home
      </A>

      {/* CHANGED: flex-col is removed as it's not needed when the left panel is hidden */}
      <div class="w-full max-w-4xl flex lg:flex-row rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        
        {/* Left "Why Join?" Panel */}
        {/* CHANGED: Added `hidden lg:flex` to hide this panel on mobile */}
        <div class="w-full lg:w-1/2 bg-indigo-700/80 backdrop-blur-lg text-white p-8 sm:p-12 hidden lg:flex flex-col justify-center">
          <h1 class="text-3xl font-bold mb-4 animate-in">Empower Your Events</h1>
          <p class="text-indigo-200 mb-8 animate-in">
            Join our platform to access a full suite of tools designed to make your events more successful and easier to manage.
          </p>
          <ul class="space-y-6">
            <For each={benefits}>
              {(item) => (
                <li class="flex items-start gap-x-4 animate-in">
                  <div class="benefit-icon flex-shrink-0 size-10 bg-indigo-500/80 rounded-full flex items-center justify-center">
                    <item.icon class="size-5" />
                  </div>
                  <div>
                    <h3 class="font-semibold">{item.title}</h3>
                    <p class="text-indigo-200 text-sm">{item.description}</p>
                  </div>
                </li>
              )}
            </For>
          </ul>
        </div>

            {/* Right Login Form Panel */}
          <div ref={formContainer} class="w-full lg:w-1/2 bg-neutral-900/80 backdrop-blur-lg flex items-center justify-center">
            <form onSubmit={handleSubmit} class="w-full max-w-sm p-8 sm:p-10 space-y-6">
              <div class="text-left animate-in">
                <h2 class="text-3xl font-bold text-white">Organizer Portal</h2>
                <p class="mt-2 text-neutral-300">Welcome back! Please sign in.</p>
              </div>
              
              <div class="animate-in">
                <FloatingLabelInput label="Email Address" name="email" type="email" icon={AiOutlineMail}
                  value={form.email} onInput={handleInput}
                />
              </div>
              <div class="animate-in">
                <FloatingLabelInput label="Password" name="password" type="password" icon={AiOutlineKey}
                  value={form.password} onInput={handleInput}
                />
              </div>
              
              <Show when={apiError()}>
                <p class="text-xs text-start text-red-500 animate-in">{apiError()}</p>
              </Show>
              
              <div class="animate-in pt-2">
          <button
            type="submit" disabled={isLoading()}
            class="w-full py-3 !cursor-pointer inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {isLoading() ? 'Signing In...' : 'Sign In'}
          </button>

                
              </div>
              <div class="animate-in text-center">
                <p class="text-sm text-neutral-400">
                  New to the platform?{' '}
                  <A href="/organizer/register" class="font-semibold cursor-pointer text-indigo-400 hover:text-indigo-300">
                    Create an Account
                  </A>
                </p>
              </div>
            </form>
          </div>
      </div>
    </main>
  );
};

export default OrganizerLoginPage;
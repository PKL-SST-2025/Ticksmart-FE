    import { Component, createSignal, For, onMount, onCleanup, Show, createEffect } from "solid-js";
import { useNavigate, A } from "@solidjs/router";
import { 
  AiOutlineMail, 
  AiOutlineKey,
  AiOutlineUser, // NEW: Icon for username
  AiOutlineQrcode,
  AiOutlineUsergroupAdd,
  AiOutlineBarChart,
  AiOutlineGlobal,
  AiOutlineArrowLeft
} from 'solid-icons/ai';
import gsap from "gsap";

import ThemedFloatingLabelInput from "../../../components/input/ThemedFloatingLabelInput";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import { useUser } from "../../../context/UserContext";
import { sendRequest } from "../../../utils/SendRequest";
import { createStore } from "solid-js/store";
import { useAdmin } from "../../../context/AdminContext";

// Benefits data (same as login page)
const benefits = [
  { icon: AiOutlineQrcode, title: "Effortless Ticket Sales", description: "Create tiered tickets, manage inventory, and sell directly to your audience..." },
  { icon: AiOutlineUsergroupAdd, title: "Seamless Attendee Management", description: "Keep track of your attendees, communicate updates, and manage check-ins..." },
  { icon: AiOutlineBarChart, title: "Powerful Event Analytics", description: "Gain valuable insights into your sales, audience demographics, and performance..." },
  { icon: AiOutlineGlobal, title: "Reach a Wider Audience", description: "List your events on our marketplace and tap into a new community of attendees." }
];

const OrganizerRegisterPage: Component = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isBoarding } = useUser();
  const { isAdminAuthenticated } = useAdmin();



    createEffect(() => {
    // If the user is logged in AND they are in the middle of onboarding,
    // force them to the onboarding page.
    if (isAuthenticated() && isBoarding()) {
      navigate('/organizer/onboarding', { replace: true });
    }


    if (isAdminAuthenticated()) {
        navigate("/admin/dashboard", { replace: true });
    }

    if (isAuthenticated() && !isBoarding()) {
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

  // --- NEW STATE for registration ---
  // --- State Management ---
  const [form, setForm] = createStore({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = createStore<Record<string, string>>({});
  const [apiError, setApiError] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  let formContainer: HTMLDivElement | undefined;

  
  onMount(() => {
    gsap.from(".animate-in", { opacity: 0, y: 20, duration: 0.6, stagger: 0.1, ease: "power2.out" });
    gsap.to(".benefit-icon", { y: -5, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1, stagger: { each: 0.2, from: "random" } });
  });

  onCleanup(() => {
    gsap.killTweensOf(".animate-in, .benefit-icon");
  });

    const handleInput = (e: Event) => {
    const { name, value } = e.currentTarget as HTMLInputElement;
    setForm(name as keyof typeof form, value);
    if (errors[name]) setErrors(name, undefined);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setErrors({});
    setApiError("");
    
    // --- Client-side validation ---
    const newErrors: Record<string, string> = {};
    if (!form.username.trim()) newErrors.username = "Username is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Please enter a valid email.";
    if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      // Call the standard /api/auth/register endpoint, but specify the 'organizer' role
      await sendRequest('/auth/register', {
        method: 'POST',
        body: {
          username: form.username,
          email: form.email,
          password: form.password,
          confirm_password: form.confirmPassword,
          role: 'Organizer', // This is the key to creating an organizer account
        },
      });
      

      
      // On success, navigate to the multi-step onboarding page
      navigate("/organizer/onboarding", { resolve: true });

    } catch (err: any) {
      setApiError(err.message || "Registration failed. Please try again.");
      gsap.fromTo(formContainer, { x: -6 }, {
        x: 6, duration: 0.07, repeat: 5, yoyo: true, clearProps: "x", ease: "power1.inOut"
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <main class="min-h-screen w-full concert-image flex items-center justify-center p-4 relative">
      <A href="/" class="animate-in absolute top-4 left-4 lg:top-6 lg:left-6 z-20 flex items-center gap-x-2 text-white bg-black/30 backdrop-blur-md rounded-full py-2 px-4 text-sm hover:bg-black/50 transition-colors">
        <AiOutlineArrowLeft /> Back to Home
      </A>
      <div class="w-full max-w-4xl flex lg:flex-row rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        <div class="w-full lg:w-1/2 bg-indigo-700/80 backdrop-blur-lg text-white p-8 sm:p-12 hidden lg:flex flex-col justify-center">
          <h1 class="text-3xl font-bold mb-4 animate-in">Empower Your Events</h1>
          <p class="text-indigo-200 mb-8 animate-in">Join our platform to access a full suite of tools designed to make your events more successful and easier to manage.</p>
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
        <div ref={formContainer} class="w-full lg:w-1/2 bg-neutral-900/80 backdrop-blur-lg flex items-center justify-center">
          <form onSubmit={handleSubmit} class="w-full max-w-sm p-8 sm:p-10 space-y-4">
            <div class="text-left animate-in">
              <h2 class="text-3xl font-bold text-white">Create an Account</h2>
              <p class="mt-2 text-neutral-300">Let's get you started.</p>
            </div>
            <div class="animate-in">
              <FloatingLabelInput label="Username" name="username" type="text" icon={AiOutlineUser} value={form.username} onInput={handleInput} error={errors.username} />
            </div>
            <div class="animate-in">
              <FloatingLabelInput label="Email Address" name="email" type="email" icon={AiOutlineMail} value={form.email} onInput={handleInput} error={errors.email}  />
            </div>
            <div class="animate-in">
              <FloatingLabelInput label="Password" name="password" type="password" icon={AiOutlineKey} value={form.password} onInput={handleInput} error={errors.password}/>
            </div>
            <div class="animate-in">
              <FloatingLabelInput label="Confirm Password" name="confirmPassword" type="password" icon={AiOutlineKey}  value={form.confirmPassword} onInput={handleInput} error={errors.confirmPassword} />
            </div>


              <Show when={apiError()}>
                <p class="text-xs text-center text-red-500 animate-in">{apiError()}</p>
              </Show>
              
            <div class="animate-in pt-2">
              <button type="submit" disabled={isLoading()} class="w-full py-3 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:pointer-events-none transition-colors">
                {isLoading() ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
            <div class="animate-in text-center">
              <p class="text-sm text-neutral-400">
                Already have an account?{' '}
                <A href="/organizer/login" class="font-semibold cursor-pointer text-indigo-400 hover:text-indigo-300">
                  Login
                </A>
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default OrganizerRegisterPage;
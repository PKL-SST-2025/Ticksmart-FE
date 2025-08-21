import { Component, createEffect, createSignal, onMount, Show } from "solid-js";
import AuthGrid from "../../components/Auth/GridBackground";
import { IoEye, IoEyeOff, IoLogoFacebook, IoLogoGoogle, IoLogoLinkedin, IoMail, IoPerson } from "solid-icons/io";
import { RiSystemLockPasswordFill } from 'solid-icons/ri';
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { A, useNavigate, useSearchParams } from "@solidjs/router";

import { sendRequest } from '../../utils/SendRequest'; 
import { useAuth } from "../../context/AuthContext";
import { TbAlertTriangle, TbLoader } from "solid-icons/tb";
// Register the TextPlugin with GSAP
gsap.registerPlugin(TextPlugin);


const LoginPage: Component = (props) => {
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [showPassword, setShowPassword] = createSignal(false);
    const [isLoading, setIsLoading] = createSignal(false); // Controls button loading state
    const [error, setError] = createSignal<string | null>(null); // Stores error message for display

    const navigate = useNavigate();
    const auth = useAuth();

    const [searchParams] = useSearchParams();
    const [redirectTo, setRedirectTo] = createSignal<string | null>(null);

    // Refs for animation
    let rightPanelRef: HTMLDivElement | undefined;
    let welcomeHeaderRef: HTMLHeadingElement | undefined;
    let welcomeParagraphRef: HTMLParagraphElement | undefined;
    let registerButtonRef: HTMLAnchorElement | undefined;
    let registerTextRef: HTMLDivElement | undefined;

    // --- Entry Animation ---
    onMount(() => {
        if (!rightPanelRef) return;
        const tl = gsap.timeline();
        tl.from(rightPanelRef, { clipPath: 'inset(100% 0 0 0)', duration: 2, ease: "power2.inOut" });
        tl.to(welcomeHeaderRef!, { duration: 2, text: "Are you New?", ease: 'none' }, "<0.3");
        tl.to(welcomeParagraphRef!, { duration: 2, text: "To get started, please provide your information to create an account.", ease: 'none' }, "<0.5");
        tl.from([registerButtonRef, registerTextRef], { y: 30, opacity: 0, duration: 1, stagger: 0.2 }, "<0.2");
        tl.from(".anim-left", { opacity: 0, x: 30, duration: 1, stagger: 0.2, ease: "power2.out" }, 0.2);
    });

    // --- Read redirect parameter on mount or searchParams change ---
    createEffect(() => {
        const redirectParam = searchParams.redirect;
        if (redirectParam) {
            try {
                setRedirectTo(decodeURIComponent(redirectParam));
                console.log("LoginPage: Found redirect parameter:", decodeURIComponent(redirectParam));
            } catch (e) {
                console.error("Failed to decode redirect URL parameter:", e);
                setRedirectTo(null);
            }
        } else {
            setRedirectTo(null);
        }
    });

    // --- Effect for Navigation after AuthContext update ---
    createEffect(() => {
        // Only navigate if AuthContext is NOT loading AND user is authenticated
        if (!auth.isAuthLoading() && auth.isAuthenticated()) {
            console.log("AuthContext detected authenticated state.");
            if (redirectTo()) {
                console.log("Navigating to stored redirect path:", redirectTo());
                navigate(redirectTo()!);
            } else {
                console.log("Navigating to default dashboard.");
                navigate('/dashboard');
            }
        }
    });
        
    const handleLogin = async (e: Event) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        setIsLoading(true); // Start loading

        // Prevent submission if AuthContext is still doing its initial check
        if (auth.isAuthLoading()) {
            console.log("AuthContext is still loading initial state, delaying login attempt.");
            setIsLoading(false);
            return;
        }

        try {
            const payload = {
                email: email(),
                password: password(),
            };

            const response = await sendRequest<{ message: string }>('/auth/login', {
                method: 'POST',
                body: payload,
            });

            if (response.message === "Login successful.") {
                console.log("Login successful. Backend responded. Triggering AuthContext refetch.");
                auth.refetchUser(); // Trigger auth state refresh
                // Navigation will be handled by the createEffect above once auth state updates
            } else {
                // Display specific message from backend if available
                setError(response.message || "Login failed. Please check your credentials.");
                console.log("Login failed.", response);
            }

        } catch (err: any) {
            console.error("Login request failed:", err);
            // Display more detailed error if backend sends it in the 'error' property
            setError(err.message || "An unexpected error occurred during login. Please try again.");
            // Optional: If you want to parse `error.message` for specific backend validation issues, do it here.
        } finally {
            setIsLoading(false); // Stop loading regardless of success or failure
        }
    };

    // --- Exit Animation and Navigation ---
    const handleNavigateToRegister = (event: MouseEvent) => {
        event.preventDefault();
        const exitTl = gsap.timeline({ onComplete: () => { navigate('/register'); } });
        exitTl.to(".anim-left", { opacity: 0, x: 30, stagger: 0.05, duration: 0.4, ease: "power2.in" });
        exitTl.to(rightPanelRef!, { clipPath: 'inset(100% 0 0 0)', duration: 0.6, ease: "power2.in" }, "<");
    };

    return (
        // Show loading state for initial AuthContext check (full screen)
        <Show when={!auth.isAuthLoading()} fallback={
            <div class="fixed inset-0 flex items-center justify-center bg-gray-900 text-white">
                <TbLoader class="w-12 h-12 animate-spin" />
                <p class="ml-4">Checking session...</p>
            </div>
        }>
            <div class="w-[100vw] h-[100vh] flex flex-row dark:bg-gray-950 overflow-hidden">
                {/* LEFT PANEL - LOGIN FORM */}
                <div class="2xl:w-[50vw] w-[100vw] overflow-y-scroll flex flex-col items-center justify-center rounded-r-4xl dark:bg-gray-900 h-[100vh]">
                    <h2 class="dark:text-white text-5xl font-bold mb-8 anim-left">Login</h2>
                    <div class="flex gap-6 text-white anim-left">
                        <button class="size-16 cursor-pointer border border-gray-700 flex justify-center items-center rounded-full hover:bg-white hover:text-black transition-colors">
                            <IoLogoGoogle class="size-8" />
                        </button>
                        <button class="size-16 cursor-pointer border border-gray-700 flex justify-center items-center rounded-full hover:bg-white hover:text-black transition-colors">
                            <IoLogoLinkedin class="size-8" />
                        </button>
                        <button class="size-16 cursor-pointer border border-gray-700 flex justify-center items-center rounded-full hover:bg-white hover:text-black transition-colors"> 
                            <IoLogoFacebook class="size-8" />
                        </button>
                    </div>
                    <p class="text-gray-400 font-light mt-8 mb-4 anim-left">Or login using your email</p>

                    {/* --- NEW: Error Display Area --- */}
                    <Show when={error()}>
                        <div class="anim-left bg-red-500/10 text-red-300 p-3 rounded-lg text-sm mb-4 max-w-[48rem] w-full text-center">
                            <TbAlertTriangle class="inline mr-2"/>{error()}
                        </div>
                    </Show>
                    {/* --- END Error Display Area --- */}

                    <form onSubmit={handleLogin} class="flex gap-6 flex-col w-full items-center mt-2 px-4">
                        <div class="flex flex-col w-full max-w-[48rem] 2xl:min-w-[38rem] anim-left">
                            <label for="username/email" class="text-gray-400 cursor-none font-bold mb-2 ml-2">Username / Email</label>
                            <div class="relative w-full max-w-[48rem]">
                                <IoPerson class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                                <input
                                    id="email"
                                    name="email"
                                    placeholder="your@email.com"
                                    class="block text-white bg-gray-950 border-[2px] border-gray-800 rounded-2xl min-w-[21rem] w-full h-[4rem] pl-16"
                                    type="email"
                                    required
                                    value={email()}
                                    onInput={(e) => setEmail(e.currentTarget.value)}
                                />
                            </div>
                        </div>

                        <div class="flex flex-col w-full max-w-[48rem] 2xl:min-w-[38rem] anim-left">
                            <label for="password" class="text-gray-400 cursor-none font-bold mb-2 ml-2">Password</label>
                            <div class="relative">
                                <RiSystemLockPasswordFill class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                                <input
                                    id="password"
                                    name="password"
                                    placeholder="Password"
                                    class="block text-white w-full bg-gray-950 border-[2px] border-gray-800 rounded-2xl min-w-[21rem] h-[4rem] pl-16 pr-12 "
                                    type={showPassword() ? "text" : "password"}
                                    required
                                    value={password()}
                                    onInput={(e) => setPassword(e.currentTarget.value)}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword())} class="absolute cursor-pointer right-6 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showPassword() ? <IoEyeOff size={28} /> : <IoEye size={28} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            class="inline-flex cursor-pointer min-w-[21rem] max-w-[28rem] w-full mt-4 pointer-events-auto items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 anim-left disabled:bg-gray-600 disabled:cursor-not-allowed"
                            disabled={isLoading()}
                        >
                            <Show when={isLoading()} fallback={<span>Login</span>}>
                                <TbLoader class="animate-spin mr-2"/>Logging In...
                            </Show>
                        </button>

                        <div   class="2xl:hidden block anim-left">
                            <p class="text-gray-400">Don't have an account yet? <A class="text-blue-500 hover:text-blue-400 font-bold" href="/register" onClick={handleNavigateToRegister}>Register</A>
                            </p>
                        </div>
                    </form>
                </div>
                {/* RIGHT PANEL - WELCOME */}
                <div ref={rightPanelRef} class="w-[50vw] max-2xl:hidden  h-[100vh] relative overflow-hidden">
                    <AuthGrid />
                    <div class="absolute w-[50vw] h-[100vh] bg-transparent flex justify-center flex-col px-[10rem] items-start left-0  z-40 pointer-events-none">
                        <h2 ref={welcomeHeaderRef} class="dark:text-white text-6xl font-bold -mb-8 min-h-[7rem]"></h2>
                        <p ref={welcomeParagraphRef} class="dark:text-gray-400 text-2xl font-light mb-18 min-h-[6rem]"></p>

                        <A
                            ref={registerButtonRef}
                            href="/register" // Href is still good for accessibility and right-click behavior
                            onClick={handleNavigateToRegister} // We now control the left-click behavior
                            class="inline-flex w-48 pointer-events-auto items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
                        >
                            Register
                        </A>
                    </div>
                </div>
            </div>
        </Show>
    );
}


export default LoginPage;
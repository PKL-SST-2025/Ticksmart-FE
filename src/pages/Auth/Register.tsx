import { Component, createSignal, onMount, Show } from "solid-js";
import AuthGrid from "../../components/Auth/GridBackground";
import { IoEye, IoEyeOff, IoLogoFacebook, IoLogoGoogle, IoLogoLinkedin, IoMail, IoPerson } from "solid-icons/io";
import { RiSystemLockPasswordFill } from 'solid-icons/ri';
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { A, useNavigate } from "@solidjs/router"; // Import useNavigate
import { sendRequest } from "../../utils/SendRequest";
import { TbAlertTriangle, TbLoader } from "solid-icons/tb";

// Register the TextPlugin with GSAP
gsap.registerPlugin(TextPlugin);

interface RegisterForm {
    username: string;
    email: string;
    password: string;
    confirm_password: string;
}

// NEW: Interface for backend validation errors
interface BackendErrorResponse {
    error: string; // "Validation error: ..."
    details?: { [key: string]: string[] }; // Field-specific errors if available
}


const RegisterPage: Component = (props) => {
    const [showPassword, setShowPassword] = createSignal(false);
    const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);
    const [registerForm, setRegisterForm] = createSignal<RegisterForm>({
        username: '', // Initialize username
        email: '',
        password: '',
        confirm_password: '',
    });
    const [isLoading, setIsLoading] = createSignal(false); // For button loading state
    const [globalError, setGlobalError] = createSignal<string | null>(null); // For general errors
    const [fieldErrors, setFieldErrors] = createSignal<{[key: string]: string}>({}); // For specific field errors

    const navigate = useNavigate();

    // Refs for the elements we want to animate
    let rightPanelRef: HTMLDivElement | undefined;
    let welcomeHeaderRef: HTMLHeadingElement | undefined;
    let welcomeParagraphRef: HTMLParagraphElement | undefined;
    let loginButtonRef: HTMLAnchorElement | undefined;
    let loginTextRef: HTMLDivElement | undefined; // Ref for the "Don't have an account?" text

    // --- Entry Animation ---
    onMount(() => {
        if (!rightPanelRef) return;
        const tl = gsap.timeline();
        tl.from(rightPanelRef, { clipPath: 'inset(100% 0 0 0)', duration: 2, ease: "power2.inOut" });
        tl.to(welcomeHeaderRef!, { duration: 2, text: "Welcome Back!", ease: 'none' }, "<0.3");
        tl.to(welcomeParagraphRef!, { duration: 2, text: "To keep connected with us please login with your personal information.", ease: 'none' }, "<0.5");
        tl.from([loginButtonRef, loginTextRef], { y: 30, opacity: 0, duration: 1, stagger: 0.2 }, "<0.2");
        tl.from(".anim-left", { opacity: 0, x: -30, duration: 1, stagger: 0.2, ease: "power2.out" }, 0.2);
    });

    // --- Exit Animation and Navigation ---
    const handleNavigateToLogin = (event: MouseEvent) => {
        event.preventDefault(); // Stop the link from navigating instantly
        const exitTl = gsap.timeline({ onComplete: () => { navigate('/login'); } });
        exitTl.to(".anim-left", { opacity: 0, x: -30, stagger: 0.05, duration: 0.4, ease: "power2.in" });
        exitTl.to(rightPanelRef!, { clipPath: 'inset(100% 0 0 0)', duration: 0.6, ease: "power2.in" }, "<");
    };


    const handleRegister = async () => {
        const { username, email, password, confirm_password } = registerForm();

        // Clear previous errors
        setGlobalError(null);
        setFieldErrors({});

        if (password !== confirm_password) {
            setFieldErrors({ confirm_password: "Passwords do not match." });
            return;
        }
        
        setIsLoading(true);

        try {
            // Send the registration request using the sendRequest utility
            // FIX: Send username, email, and password
            const response = await sendRequest<{ message: string }>('/auth/register', {
                method: 'POST',
                body: {
                    username, // Send username
                    email,
                    password,
                },
            });

            console.log("Registration successful:", response);
            // On successful registration, typically redirect to login or dashboard
            navigate('/login'); 

        } catch (error: any) {
            console.error("Registration failed:", error);
            setIsLoading(false); // Stop loading on error

            // Parse backend error for detailed messages
            if (error.message && error.message.startsWith("API Error: 400 - Validation error:")) {
                // This is a validation error. Extract details.
                try {
                    const errorDetail = JSON.parse(error.message.substring(error.message.indexOf("{")));
                    if (errorDetail.fields) { // Assuming `details` key for field-specific errors
                        const newFieldErrors: {[key: string]: string} = {};
                        for (const key in errorDetail.fields) {
                            newFieldErrors[key] = errorDetail.fields[key].join(', '); // Join multiple messages for a field
                        }
                        setFieldErrors(newFieldErrors);
                    } else {
                        setGlobalError(error.message.substring(error.message.indexOf(":") + 2)); // Generic validation message
                    }
                } catch (parseError) {
                    setGlobalError("Registration failed due to validation issues. Check your input.");
                    console.error("Failed to parse validation error details:", parseError);
                }
            } else if (error.message && error.message.includes("unique constraint")) {
                 setGlobalError("Email or username is already taken. Please choose another.");
            }
            else {
                // Other API errors or network issues
                setGlobalError(error.message || "An unexpected error occurred during registration.");
            }
        } finally {
            setIsLoading(false); // Ensure loading state is false in all cases
        }
    };

    const handleInputChange = (e: Event) => {
        const { name, value } = e.currentTarget as HTMLInputElement;
        setRegisterForm({ ...registerForm(), [name]: value });
        // Clear specific field error when user types
        if (fieldErrors()[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        setGlobalError(null); // Clear global error on input change
    };


    return (
        <div class="w-[100vw] h-[100vh] flex flex-row dark:bg-gray-950 overflow-hidden">
            {/* LEFT PANEL */}
            <div class="2xl:w-[50vw] w-[100vw] overflow-y-scroll flex flex-col items-center justify-center rounded-r-4xl dark:bg-gray-900 h-[100vh]">
                <h2 class="dark:text-white text-5xl font-bold mb-8 anim-left">Register</h2>
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
                <p class="text-gray-400 font-light mt-8 anim-left">Or use your email for registration</p>

                {/* --- FIX: FORM TAG PLACEMENT --- */}
                {/* The form tag must wrap all inputs and the submit button. */}
                {/* It should be a direct child of the content div that contains all form elements. */}
                <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} class="flex gap-6 flex-col w-full items-center mt-2 px-4">
                    {/* Global Error Display */}
                    <Show when={globalError()}>
                        <div class="anim-left bg-red-500/10 text-red-300 p-3 rounded-lg text-sm mb-4 max-w-[48rem] w-full text-center">
                            <TbAlertTriangle class="inline mr-2"/>{globalError()}
                        </div>
                    </Show>

                    {/* Username Input */}
                    <div class="flex flex-col w-full max-w-[48rem] 2xl:min-w-[38rem] anim-left px-4">
                        <label for="username" class="text-gray-400 font-bold mb-2 ml-2 cursor-none">Username</label>
                        <div class="relative w-full max-w-[48rem]">
                            <IoPerson class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                                <input
                                name="username"
                                placeholder="Username"
                                class="block text-white bg-gray-950 border-[2px] border-gray-800 rounded-2xl min-w-[21rem]  w-full h-[4rem] pl-16"
                                type="text"
                                onChange={handleInputChange}
                                value={registerForm().username}
                                classList={{"!border-red-500": fieldErrors().username}} // Highlight on error
                            />
                        </div>
                        <Show when={fieldErrors().username}><p class="text-red-400 text-sm mt-1 ml-2">{fieldErrors().username}</p></Show>
                    </div>

                    {/* Email Input */}
                    <div class="flex  flex-col w-full max-w-[48rem] 2xl:min-w-[38rem] anim-left px-4">
                        <label for="email" class="text-gray-400 font-bold mb-2 ml-2 cursor-none" >Email</label>
                        <div class="relative w-full max-w-[48rem]">
                            <IoMail class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                            <input
                                name="email"
                                placeholder="Email"
                                class="block text-white bg-gray-950 border-[2px] border-gray-800 rounded-2xl min-w-[21rem]  w-full h-[4rem] pl-16"
                                type="email"
                                onChange={handleInputChange}
                                value={registerForm().email}
                                classList={{"!border-red-500": fieldErrors().email}}
                            />
                        </div>
                        <Show when={fieldErrors().email}><p class="text-red-400 text-sm mt-1 ml-2">{fieldErrors().email}</p></Show>
                    </div>

                    {/* Password Input */}
                    <div class="flex flex-col w-full max-w-[48rem] 2xl:min-w-[38rem] anim-left px-4">
                        <label for="password" class="text-gray-400 font-bold mb-2 ml-2 cursor-none">Password</label>
                        <div class="relative w-full max-w-[48rem]">
                            <RiSystemLockPasswordFill class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                            <input
                                name="password"
                                placeholder="Password"
                                class="block text-white bg-gray-950 border-[2px] border-gray-800 rounded-2xl min-w-[21rem]  w-full h-[4rem] pl-16 pr-12 "
                                type={showPassword() ? "text" : "password"}
                                onChange={handleInputChange}
                                value={registerForm().password}
                                classList={{"!border-red-500": fieldErrors().password}}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword())} class="absolute cursor-pointer right-6 top-1/2 -translate-y-1/2 text-gray-400">
                                {showPassword() ? <IoEyeOff size={28} /> : <IoEye size={28} />}
                            </button>
                        </div>
                        <Show when={fieldErrors().password}><p class="text-red-400 text-sm mt-1 ml-2">{fieldErrors().password}</p></Show>
                    </div>

                    {/* Confirm Password Input */}
                    <div class="flex flex-col w-full max-w-[48rem] 2xl:min-w-[38rem] anim-left px-4">
                        <label for="confirm_password" class="text-gray-400 font-bold mb-2 ml-2 cursor-none">Confirm Password</label>
                        <div class="relative  w-full max-w-[48rem]">
                            <RiSystemLockPasswordFill class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                            <input
                                name="confirm_password"
                                placeholder="Confirm Password"
                                class="block text-white bg-gray-950 border-[2px] border-gray-800 rounded-2xl min-w-[21rem]  w-full h-[4rem] pl-16 pr-12 "
                                type={showConfirmPassword() ? "text" : "password"}
                                onChange={handleInputChange}
                                value={registerForm().confirm_password}
                                classList={{"!border-red-500": fieldErrors().confirm_password}}
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword())} class="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400">
                                {showConfirmPassword() ? <IoEyeOff size={28} /> : <IoEye size={28} />}
                            </button>
                        </div>
                        <Show when={fieldErrors().confirm_password}><p class="text-red-400 text-sm mt-1 ml-2">{fieldErrors().confirm_password}</p></Show>
                    </div>

                    {/* Register Button */}
                    <button type="submit" class="inline-flex w-96 cursor-pointer mt-4 pointer-events-auto items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 anim-left disabled:bg-gray-600 disabled:cursor-not-allowed"
                    disabled={isLoading()}>
                        <Show when={isLoading()} fallback={<span>Register</span>}>
                            <TbLoader class="animate-spin mr-2"/>Registering...
                        </Show>
                    </button>

                    <div   class="2xl:hidden block anim-left">
                        <p class="text-gray-400">Already have an account? <A class="text-blue-500 hover:text-blue-400 font-bold" href="/login" onClick={handleNavigateToLogin}>Login</A>
                        </p>
                    </div>
                </form>
            </div>

            {/* RIGHT PANEL */}
            <div ref={rightPanelRef} class="w-[50vw] h-[100vh] 2xl:block hidden relative overflow-hidden">
                <AuthGrid />
                <div class="absolute w-[50vw] h-[100vh] bg-transparent flex justify-center flex-col px-[10rem] items-start left-0 cursor z-40 pointer-events-none">
                    <h2 ref={welcomeHeaderRef} class="dark:text-white text-6xl font-bold -mb-8 min-h-[7rem]"></h2>
                    <p ref={welcomeParagraphRef} class="dark:text-gray-400 text-2xl font-light mb-18 min-h-[6rem]"></p>

                    <A
                        ref={loginButtonRef}
                        href="/login"
                        onClick={handleNavigateToLogin} // Control the click event
                        class="inline-flex w-48 pointer-events-auto items-center justify-center px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
                    >
                        Login
                    </A>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage;
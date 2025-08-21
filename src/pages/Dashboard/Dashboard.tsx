import { Component, createSignal, onMount, Show } from "solid-js";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { RecentlyVisited } from "../../components/Dashboard/RecentlyVisited";
import { UpcomingEvents } from "../../components/Dashboard/UpcomingEvent";
import gsap from "gsap";
import { useAuth } from "../../context/AuthContext";
import { sendRequest } from "../../utils/SendRequest";
import { TbAlertTriangle, TbLoader } from "solid-icons/tb";

// --- API Data Structures ---
// Define what /auth/me returns
interface ApiUserResponse {
    id: number;
    email: string;
    username: string; // From Rust backend User model
    // other fields if needed, like full_name
}


// Note: No need to register TextPlugin if you aren't using the text animation property.
// If you plan to, keep this line:
// import { TextPlugin } from "gsap/TextPlugin";
// gsap.registerPlugin(TextPlugin);

const DashboardPage: Component = () => {
    let containerRef: HTMLDivElement | undefined;

    const { user: authUser } = useAuth(); // Get current authenticated user details from context
    const [currentUserData, setCurrentUserData] = createSignal<ApiUserResponse | null>(null);
    const [isLoading, setIsLoading] = createSignal(true);
    const [error, setError] = createSignal<string | null>(null);

    // --- Data Fetching ---
    const fetchDashboardData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch current user data
            const userData = await sendRequest<ApiUserResponse>('/auth/me');
            setCurrentUserData(userData);

            // `RecentlyVisited` component will fetch its own data internally,
            // so no need to fetch it here and pass it down.
            
        } catch (err: any) {
            console.error("Error fetching dashboard data:", err);
            setError(err.message || "Failed to load dashboard data.");
        } finally {
            setIsLoading(false);
        }
    };

    onMount(() => {
        if (containerRef) {
            const timeline = gsap.timeline();
            
            // Animate the main container itself
            timeline.fromTo(containerRef, {
                opacity: 0,
                y: 50,
            }, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
            })
            // Animate the children inside with a stagger effect
            .fromTo(containerRef.querySelectorAll('h1, .dashboard-card'), {
                opacity: 0,
                y: 20,
            }, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.15, // A slightly longer stagger can feel more premium
                ease: 'power2.out',
            }, '<0.2'); // Start slightly after the main container animation begins
        }


        // Fetch data after initial render
        fetchDashboardData();
    });

    return (
          <DashboardLayout username={currentUserData()?.username || 'Loading...'}> {/* Pass fetched username */}
            {/* 
              Main content container. 
            */}
            <div ref={el => containerRef = el} class="w-full max-w-7xl flex flex-col lg:mt-0 mt-16 items-center overflow-y-scroll pointer-events-auto z-[40] mx-auto p-4 sm:p-6 lg:p-8">
                <Show when={!isLoading()} fallback={
                    <div class="flex items-center justify-center h-full p-10">
                        <TbLoader class="w-10 h-10 animate-spin text-blue-500" />
                    </div>
                }>
                    <Show when={!error()} fallback={
                        <div class="p-4 bg-red-500/10 text-red-300 rounded-lg text-center">
                            <TbAlertTriangle class="w-8 h-8 mx-auto mb-2" />
                            <p>{error()}</p>
                        </div>
                    }>
                        {/* 
                            The main heading.
                        */}
                        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center lg:text-left">
                            Welcome, {currentUserData()?.username || 'User'}!
                        </h1>
                        
                        {/* 
                            Content wrapper. 
                        */}
                        <div class="mt-8 md:mt-12 lg:flex lg:gap-8 flex flex-col">
                            
                            {/* Card 1: Recently Visited. */}
                            <div class="flex-1 max-w-5xl w-[80vw] p-4 dashboard-card  h-full">
                                <RecentlyVisited /> {/* This component will fetch its own data */}
                            </div>

                            {/* Card 2: Upcoming Events. 
                            <div class="flex-1 dashboard-card mt-8 lg:mt-0">
                                <UpcomingEvents />
                            </div>
                            */}

                        </div>
                    </Show>
                </Show>
            </div>
        </DashboardLayout>
    );
}

export default DashboardPage;
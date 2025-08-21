import { Component, onMount } from "solid-js";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin"; // TextPlugin is not used in this version, but can be kept
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { ProjectSearchList } from "../../components/Dashboard/ProjectSearchList";

// Registering the plugin is fine, even if not used immediately.
gsap.registerPlugin(TextPlugin);

const DashboardSearchPage: Component = () => {
    let titleRef: HTMLHeadingElement | undefined;
    let listContainerRef: HTMLDivElement | undefined;

    onMount(() => {
        if (titleRef && listContainerRef) {
            gsap.set([titleRef, listContainerRef], { opacity: 0, y: 25 });
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            tl.to(titleRef, { opacity: 1, y: 0, duration: 0.6 })
              .to(listContainerRef, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4");
        }
    });

    return (
        <DashboardLayout>
            <div class="overflow-hidden p-8">
                <h1 ref={el => titleRef = el} class="text-5xl relative z-10 font-bold text-white text-center">
                    Search
                </h1>
                <div ref={el => listContainerRef = el} class="mt-12 relative z-10">
                    <ProjectSearchList />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardSearchPage;
import { Component, onMount, onCleanup } from "solid-js";
import gsap from "gsap";

const AuthGrid: Component = () => {
    // Refs for DOM elements
    let svgRef: SVGSVGElement | undefined;
    let svgContainerRef: HTMLDivElement | undefined;
    let originalGridGroupRef: SVGGElement | undefined;
    let glowLayerGroupRef: SVGGElement | undefined;
    let spotlightCircleRef: SVGCircleElement | undefined;
    let spotlightGradientRef: SVGRadialGradientElement | undefined; // Ref for the spotlight gradient

    // Configuration
    const ORIGINAL_STROKE_COLOR = "#484e5c";
    const SPOTLIGHT_GLOW_STROKE_COLOR = "#7dd3fc"; // Tailwind's sky-300 (bright blue)
    const SPOTLIGHT_RADIUS = 250; // Increased radius for a more prominent spotlight with gradient
    const SPOTLIGHT_BLUR_STD_DEVIATION = 3.5; // Slightly increased blur
    const PERIODIC_SQUARE_GLOW_FILL_COLOR = "#67e8f9"; // Tailwind's cyan-300

    // Store original state and animation instances
    const originalPathFills = new Map<SVGPathElement, string>();
    let periodicGlowTrigger: ReturnType<typeof gsap.delayedCall> | null = null;
    let allGlowableOriginalPaths: SVGPathElement[] = [];

    // --- Animation Functions for Periodic Square Glow ---
    const animateRandomSquare = () => {
        if (allGlowableOriginalPaths.length === 0 || !document.body.contains(originalGridGroupRef!)) {
            periodicGlowTrigger?.kill();
            return;
        }

        const path = gsap.utils.random(allGlowableOriginalPaths);
        const originalFill = originalPathFills.get(path);

        if (path && originalFill) {
            gsap.timeline()
                .to(path, {
                    fill: PERIODIC_SQUARE_GLOW_FILL_COLOR,
                    duration: 0.3,
                    ease: 'power1.out'
                })
                .to(path, {
                    fill: originalFill,
                    duration: 0.7,
                    ease: 'power1.in',
                    delay: 0.2
                });
        }
    };

    const scheduleNextRandomGlow = () => {
        periodicGlowTrigger?.kill();
        const randomDelay = gsap.utils.random(0.02, 0.4);
        periodicGlowTrigger = gsap.delayedCall(randomDelay, () => {
            animateRandomSquare();
            scheduleNextRandomGlow();
        });
    };

    // --- SolidJS Lifecycle Hooks ---
    onMount(() => {
        if (!svgRef || !svgContainerRef || !originalGridGroupRef || !glowLayerGroupRef || !spotlightCircleRef || !spotlightGradientRef) {
            console.error("Required refs not found for AuthGrid animation.");
            return;
        }

        // --- Setup for Periodic Square Glow ---
        const pathsInOriginalGrid = originalGridGroupRef.querySelectorAll('path[fill]:not([fill="none"])');
        pathsInOriginalGrid.forEach(p => {
            const pathElement = p as SVGPathElement;
            const fillAttribute = pathElement.getAttribute('fill');
            if (fillAttribute && fillAttribute.toLowerCase() !== 'none') {
                originalPathFills.set(pathElement, fillAttribute);
                allGlowableOriginalPaths.push(pathElement);
            }
        });
        if (allGlowableOriginalPaths.length > 0) {
           scheduleNextRandomGlow();
        }


        // --- Setup for Hover Spotlight Glow ---
        originalGridGroupRef.childNodes.forEach(node => {
            if (node.nodeName.toLowerCase() === 'path') {
                const originalPath = node as SVGPathElement;
                const clonedPath = originalPath.cloneNode(true) as SVGPathElement;
                clonedPath.removeAttribute('fill');
                glowLayerGroupRef!.appendChild(clonedPath);
            }
        });

        let CTM = svgRef.getScreenCTM();
        const svgPoint = svgRef.createSVGPoint();

        const handleMouseEnter = () => {
            if (!CTM) CTM = svgRef!.getScreenCTM();
            gsap.to(glowLayerGroupRef!, { opacity: 1, duration: 0.3 });
            // Animate the circle's radius and also the gradient's spread if needed (though radius is primary)
            gsap.to(spotlightCircleRef!, { attr: { r: SPOTLIGHT_RADIUS }, duration: 0.3, ease: "power1.out" });
            // Make the spotlight gradient appear fully opaque (its stop colors define the fade)
            gsap.to(spotlightGradientRef!.querySelectorAll('stop'), {stopOpacity: 1, duration: 0.3});
        };

        const handleMouseLeave = () => {
            gsap.to(glowLayerGroupRef!, { opacity: 0, duration: 0.3 });
            gsap.to(spotlightCircleRef!, { attr: { r: 0 }, duration: 0.3, ease: "power1.in" });
            // Fade out the spotlight gradient
            gsap.to(spotlightGradientRef!.querySelectorAll('stop'), {stopOpacity: 0, duration: 0.3});
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (!CTM || !spotlightCircleRef || !spotlightGradientRef) return;

            svgPoint.x = event.clientX;
            svgPoint.y = event.clientY;
            const transformedPoint = svgPoint.matrixTransform(CTM!.inverse());

            // Update the circle's position
            gsap.to(spotlightCircleRef, {
                attr: { cx: transformedPoint.x, cy: transformedPoint.y },
                duration: 0.1,
                ease: "power1.out"
            });
            
            // Update the radial gradient's center to match the circle
            // This is crucial for the gradient to follow the spotlight
            gsap.to(spotlightGradientRef, {
                attr: { fx: transformedPoint.x, fy: transformedPoint.y, cx: transformedPoint.x, cy: transformedPoint.y },
                duration: 0.1, // Match circle's animation
                ease: "power1.out"
            });
        };
        
        // Throttling Function
        const throttle = (func: (event: MouseEvent) => void, limit: number) => {
            let inThrottle: boolean;
            return function(this: any, ...args: any[]) {
              const context = this;
              if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
              }
            }
          }

        const updateCTM = () => {
            if (svgRef) CTM = svgRef.getScreenCTM();
        };
        window.addEventListener('resize', updateCTM);

        svgContainerRef.addEventListener('mouseenter', handleMouseEnter);        svgContainerRef.addEventListener('mouseleave', handleMouseLeave);
        svgContainerRef.addEventListener('mousemove', throttle(handleMouseMove, 78)); // ~60fps (1000ms / 60fps ≈ 16ms)

        // Cleanup
        onCleanup(() => {
            periodicGlowTrigger?.kill();
            gsap.killTweensOf([
                glowLayerGroupRef, 
                spotlightCircleRef, 
                spotlightGradientRef,
                ...(spotlightGradientRef?.querySelectorAll('stop') || []),
                ...allGlowableOriginalPaths
            ]);
            
            if (svgContainerRef) {
                svgContainerRef.removeEventListener('mouseenter', handleMouseEnter);
                svgContainerRef.removeEventListener('mouseleave', handleMouseLeave);
                svgContainerRef.removeEventListener('mousemove', handleMouseMove);
            }
            window.removeEventListener('resize', updateCTM);
            
            originalPathFills.clear();
            allGlowableOriginalPaths = [];
            if (glowLayerGroupRef) glowLayerGroupRef.innerHTML = ''; 
        });
    });

    return (
        <div ref={svgContainerRef} >
            <svg class="h-[100vh] w-[100vw] absolute -left-[40%] top-[1] z-10" ref={svgRef} viewBox="0 0 2000 1400" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    {/* Vignette Gradient (for overall fading at edges) */}
                    <radialGradient id="vignette_gradient_source">
                        <stop offset="0" stop-color="#fff" stop-opacity=".826"/>
                        <stop offset="85.5%" stop-color="#fff" stop-opacity="0"/>
                    </radialGradient>

                    {/* Radial Gradient for the Spotlight Mask (for soft edges) */}
                    <radialGradient 
                        id="spotlight_mask_gradient" 
                        ref={spotlightGradientRef}
                        // cx, cy, fx, fy will be set by JS to follow the mouse
                        // r will effectively be controlled by the circle's radius
                        gradientUnits="userSpaceOnUse" // Important for cx/cy/fx/fy to be in SVG coords
                    >
                        {/* Start opaque white at the center, fade to transparent white at the edge */}
                        <stop offset="0%" stop-color="white" stop-opacity="0" /> {/* Initially hidden */}
                        <stop offset="50%" stop-color="white" stop-opacity="0" /> {/* Adjust for desired softness */}
                        <stop offset="100%" stop-color="white" stop-opacity="0" />
                    </radialGradient>

                    {/* Spotlight Mask: A circle that will use the gradient fill */}
                    <mask id="spotlight_hover_mask">
                        <circle 
                            ref={spotlightCircleRef} 
                            cx="0" cy="0" r="0" 
                            fill="url(#spotlight_mask_gradient)" /* Use the gradient here */
                        />
                    </mask>

                    {/* Filter for the glowing lines in the spotlight */}
                    <filter id="spotlight_line_blur_filter" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation={SPOTLIGHT_BLUR_STD_DEVIATION} />
                    </filter>
                </defs>

                {/* Vignette Mask Definition */}
                <mask id="overall_vignette_mask" x="0" y="0" width="2000" height="1400">
                    <path fill="url(#vignette_gradient_source)" d="M0 0h2000v1400H0z"/>
                </mask>

                {/* Background */}
                <path fill="#030712" d="M0 0h2000v1400H0z"/>

                {/* Main container group */}
                <g mask="url(#overall_vignette_mask)">
                    {/* Original Grid Lines */}
                    <g 
                        ref={originalGridGroupRef} 
                        style="transform-origin:center center" 
                        stroke={ORIGINAL_STROKE_COLOR} 
                        stroke-width="2"
                    >
                        {/* All your <path> elements from the original SVG go here. */}
                        {/* Example: (MAKE SURE TO PUT YOUR FULL SVG PATHS HERE) */}
                        <path fill="#484e5cde" d="M0 0h83.333v83.333H0z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c64" d="M83.333 0h83.333v83.333H83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5ce4" d="M166.667 0H250v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M250 0h83.333v83.333H250z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c98" d="M333.333 0h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M416.667 0H500v83.333h-83.333zM500 0h83.333v83.333H500z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c34" d="M583.333 0h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M666.667 0H750v83.333h-83.333zM750 0h83.333v83.333H750z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c42" d="M833.333 0h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cc6" d="M916.667 0H1000v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1000 0h83.333v83.333H1000zM1083.333 0h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c97" d="M1166.667 0H1250v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1250 0h83.333v83.333H1250zM1333.333 0h83.333v83.333h-83.333zM1416.667 0H1500v83.333h-83.333zM1500 0h83.333v83.333H1500zM1583.333 0h83.333v83.333h-83.333zM1666.667 0H1750v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cb9" d="M1750 0h83.333v83.333H1750z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1833.333 0h83.333v83.333h-83.333zM1916.667 0H2000v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c59" d="M0 83.333h83.333v83.333H0z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cbe" d="M83.333 83.333h83.333v83.333H83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M166.667 83.333H250v83.333h-83.333zM250 83.333h83.333v83.333H250zM333.333 83.333h83.333v83.333h-83.333zM416.667 83.333H500v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c8d" d="M500 83.333h83.333v83.333H500z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c8a" d="M583.333 83.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5ca9" d="M666.667 83.333H750v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c1a" d="M750 83.333h83.333v83.333H750z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c54" d="M833.333 83.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M916.667 83.333H1000v83.333h-83.333zM1000 83.333h83.333v83.333H1000zM1083.333 83.333h83.333v83.333h-83.333zM1166.667 83.333H1250v83.333h-83.333zM1250 83.333h83.333v83.333H1250zM1333.333 83.333h83.333v83.333h-83.333zM1416.667 83.333H1500v83.333h-83.333zM1500 83.333h83.333v83.333H1500z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c94" d="M1583.333 83.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c9b" d="M1666.667 83.333H1750v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1750 83.333h83.333v83.333H1750z" transform="skewX(30) scale(1.2)"/><path fill="#484e5ca2" d="M1833.333 83.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1916.667 83.333H2000v83.333h-83.333zM0 166.667h83.333V250H0zM83.333 166.667h83.333V250H83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c96" d="M166.667 166.667H250V250h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M250 166.667h83.333V250H250z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cc7" d="M333.333 166.667h83.333V250h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M416.667 166.667H500V250h-83.333zM500 166.667h83.333V250H500zM583.333 166.667h83.333V250h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cc5" d="M666.667 166.667H750V250h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M750 166.667h83.333V250H750zM833.333 166.667h83.333V250h-83.333zM916.667 166.667H1000V250h-83.333zM1000 166.667h83.333V250H1000zM1083.333 166.667h83.333V250h-83.333zM1166.667 166.667H1250V250h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c44" d="M1250 166.667h83.333V250H1250z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1333.333 166.667h83.333V250h-83.333zM1416.667 166.667H1500V250h-83.333zM1500 166.667h83.333V250H1500zM1583.333 166.667h83.333V250h-83.333zM1666.667 166.667H1750V250h-83.333zM1750 166.667h83.333V250H1750zM1833.333 166.667h83.333V250h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5ce0" d="M1916.667 166.667H2000V250h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M0 250h83.333v83.333H0zM83.333 250h83.333v83.333H83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c3e" d="M166.667 250H250v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M250 250h83.333v83.333H250zM333.333 250h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c0e" d="M416.667 250H500v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c3b" d="M500 250h83.333v83.333H500z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M583.333 250h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cd5" d="M666.667 250H750v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M750 250h83.333v83.333H750zM833.333 250h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cbb" d="M916.667 250H1000v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cbc" d="M1000 250h83.333v83.333H1000z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1083.333 250h83.333v83.333h-83.333zM1166.667 250H1250v83.333h-83.333zM1250 250h83.333v83.333H1250zM1333.333 250h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c2c" d="M1416.667 250H1500v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1500 250h83.333v83.333H1500z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cf3" d="M1583.333 250h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1666.667 250H1750v83.333h-83.333zM1750 250h83.333v83.333H1750zM1833.333 250h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c25" d="M1916.667 250H2000v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M0 333.333h83.333v83.333H0zM83.333 333.333h83.333v83.333H83.333zM166.667 333.333H250v83.333h-83.333zM250 333.333h83.333v83.333H250zM333.333 333.333h83.333v83.333h-83.333zM416.667 333.333H500v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c23" d="M500 333.333h83.333v83.333H500z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M583.333 333.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c94" d="M666.667 333.333H750v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c06" d="M750 333.333h83.333v83.333H750z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M833.333 333.333h83.333v83.333h-83.333zM916.667 333.333H1000v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5ca7" d="M1000 333.333h83.333v83.333H1000z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1083.333 333.333h83.333v83.333h-83.333zM1166.667 333.333H1250v83.333h-83.333zM1250 333.333h83.333v83.333H1250z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c29" d="M1333.333 333.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1416.667 333.333H1500v83.333h-83.333zM1500 333.333h83.333v83.333H1500z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c8c" d="M1583.333 333.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c3f" d="M1666.667 333.333H1750v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1750 333.333h83.333v83.333H1750z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c6c" d="M1833.333 333.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1916.667 333.333H2000v83.333h-83.333zM0 416.667h83.333V500H0zM83.333 416.667h83.333V500H83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c72" d="M166.667 416.667H250V500h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M250 416.667h83.333V500H250zM333.333 416.667h83.333V500h-83.333zM416.667 416.667H500V500h-83.333zM500 416.667h83.333V500H500zM583.333 416.667h83.333V500h-83.333zM666.667 416.667H750V500h-83.333zM750 416.667h83.333V500H750zM833.333 416.667h83.333V500h-83.333zM916.667 416.667H1000V500h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cc3" d="M1000 416.667h83.333V500H1000z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1083.333 416.667h83.333V500h-83.333zM1166.667 416.667H1250V500h-83.333zM1250 416.667h83.333V500H1250zM1333.333 416.667h83.333V500h-83.333zM1416.667 416.667H1500V500h-83.333zM1500 416.667h83.333V500H1500zM1583.333 416.667h83.333V500h-83.333zM1666.667 416.667H1750V500h-83.333zM1750 416.667h83.333V500H1750zM1833.333 416.667h83.333V500h-83.333zM1916.667 416.667H2000V500h-83.333zM0 500h83.333v83.333H0zM83.333 500h83.333v83.333H83.333zM166.667 500H250v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c8e" d="M250 500h83.333v83.333H250z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M333.333 500h83.333v83.333h-83.333zM416.667 500H500v83.333h-83.333zM500 500h83.333v83.333H500z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cfa" d="M583.333 500h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M666.667 500H750v83.333h-83.333zM750 500h83.333v83.333H750zM833.333 500h83.333v83.333h-83.333zM916.667 500H1000v83.333h-83.333zM1000 500h83.333v83.333H1000z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c71" d="M1083.333 500h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c1d" d="M1166.667 500H1250v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5ccf" d="M1250 500h83.333v83.333H1250z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1333.333 500h83.333v83.333h-83.333zM1416.667 500H1500v83.333h-83.333zM1500 500h83.333v83.333H1500zM1583.333 500h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c11" d="M1666.667 500H1750v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1750 500h83.333v83.333H1750zM1833.333 500h83.333v83.333h-83.333zM1916.667 500H2000v83.333h-83.333zM0 583.333h83.333v83.333H0zM83.333 583.333h83.333v83.333H83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c66" d="M166.667 583.333H250v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c24" d="M250 583.333h83.333v83.333H250z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M333.333 583.333h83.333v83.333h-83.333zM416.667 583.333H500v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5ccf" d="M500 583.333h83.333v83.333H500z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M583.333 583.333h83.333v83.333h-83.333zM666.667 583.333H750v83.333h-83.333zM750 583.333h83.333v83.333H750zM833.333 583.333h83.333v83.333h-83.333zM916.667 583.333H1000v83.333h-83.333zM1000 583.333h83.333v83.333H1000zM1083.333 583.333h83.333v83.333h-83.333zM1166.667 583.333H1250v83.333h-83.333zM1250 583.333h83.333v83.333H1250zM1333.333 583.333h83.333v83.333h-83.333zM1416.667 583.333H1500v83.333h-83.333zM1500 583.333h83.333v83.333H1500zM1583.333 583.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c52" d="M1666.667 583.333H1750v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1750 583.333h83.333v83.333H1750z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cf1" d="M1833.333 583.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1916.667 583.333H2000v83.333h-83.333zM0 666.667h83.333V750H0z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c6b" d="M83.333 666.667h83.333V750H83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M166.667 666.667H250V750h-83.333zM250 666.667h83.333V750H250zM333.333 666.667h83.333V750h-83.333zM416.667 666.667H500V750h-83.333zM500 666.667h83.333V750H500zM583.333 666.667h83.333V750h-83.333zM666.667 666.667H750V750h-83.333zM750 666.667h83.333V750H750zM833.333 666.667h83.333V750h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c08" d="M916.667 666.667H1000V750h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1000 666.667h83.333V750H1000zM1083.333 666.667h83.333V750h-83.333zM1166.667 666.667H1250V750h-83.333zM1250 666.667h83.333V750H1250z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cce" d="M1333.333 666.667h83.333V750h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1416.667 666.667H1500V750h-83.333zM1500 666.667h83.333V750H1500zM1583.333 666.667h83.333V750h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c6f" d="M1666.667 666.667H1750V750h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c5f" d="M1750 666.667h83.333V750H1750z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c3b" d="M1833.333 666.667h83.333V750h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1916.667 666.667H2000V750h-83.333zM0 750h83.333v83.333H0zM83.333 750h83.333v83.333H83.333zM166.667 750H250v83.333h-83.333zM250 750h83.333v83.333H250zM333.333 750h83.333v83.333h-83.333zM416.667 750H500v83.333h-83.333zM500 750h83.333v83.333H500z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c53" d="M583.333 750h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M666.667 750H750v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c15" d="M750 750h83.333v83.333H750z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M833.333 750h83.333v83.333h-83.333zM916.667 750H1000v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c3f" d="M1000 750h83.333v83.333H1000z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c86" d="M1083.333 750h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1166.667 750H1250v83.333h-83.333zM1250 750h83.333v83.333H1250zM1333.333 750h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cd7" d="M1416.667 750H1500v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1500 750h83.333v83.333H1500z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cb3" d="M1583.333 750h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1666.667 750H1750v83.333h-83.333zM1750 750h83.333v83.333H1750zM1833.333 750h83.333v83.333h-83.333zM1916.667 750H2000v83.333h-83.333zM0 833.333h83.333v83.333H0zM83.333 833.333h83.333v83.333H83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c4c" d="M166.667 833.333H250v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M250 833.333h83.333v83.333H250zM333.333 833.333h83.333v83.333h-83.333zM416.667 833.333H500v83.333h-83.333zM500 833.333h83.333v83.333H500z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cdb" d="M583.333 833.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M666.667 833.333H750v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5ca7" d="M750 833.333h83.333v83.333H750z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M833.333 833.333h83.333v83.333h-83.333zM916.667 833.333H1000v83.333h-83.333zM1000 833.333h83.333v83.333H1000z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c39" d="M1083.333 833.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1166.667 833.333H1250v83.333h-83.333zM1250 833.333h83.333v83.333H1250zM1333.333 833.333h83.333v83.333h-83.333zM1416.667 833.333H1500v83.333h-83.333zM1500 833.333h83.333v83.333H1500zM1583.333 833.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cc5" d="M1666.667 833.333H1750v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1750 833.333h83.333v83.333H1750zM1833.333 833.333h83.333v83.333h-83.333zM1916.667 833.333H2000v83.333h-83.333zM0 916.667h83.333V1000H0zM83.333 916.667h83.333V1000H83.333zM166.667 916.667H250V1000h-83.333zM250 916.667h83.333V1000H250z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c60" d="M333.333 916.667h83.333V1000h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M416.667 916.667H500V1000h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5ce2" d="M500 916.667h83.333V1000H500z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M583.333 916.667h83.333V1000h-83.333zM666.667 916.667H750V1000h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cd5" d="M750 916.667h83.333V1000H750z" transform="skewX(30) scale(1.2)"/><path fill="#484e5ca5" d="M833.333 916.667h83.333V1000h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M916.667 916.667H1000V1000h-83.333zM1000 916.667h83.333V1000H1000z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c33" d="M1083.333 916.667h83.333V1000h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1166.667 916.667H1250V1000h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5ca0" d="M1250 916.667h83.333V1000H1250z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cea" d="M1333.333 916.667h83.333V1000h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cec" d="M1416.667 916.667H1500V1000h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1500 916.667h83.333V1000H1500zM1583.333 916.667h83.333V1000h-83.333zM1666.667 916.667H1750V1000h-83.333zM1750 916.667h83.333V1000H1750zM1833.333 916.667h83.333V1000h-83.333zM1916.667 916.667H2000V1000h-83.333zM0 1000h83.333v83.333H0z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c89" d="M83.333 1000h83.333v83.333H83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M166.667 1000H250v83.333h-83.333zM250 1000h83.333v83.333H250zM333.333 1000h83.333v83.333h-83.333zM416.667 1000H500v83.333h-83.333zM500 1000h83.333v83.333H500zM583.333 1000h83.333v83.333h-83.333zM666.667 1000H750v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cba" d="M750 1000h83.333v83.333H750z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M833.333 1000h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c4a" d="M916.667 1000H1000v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1000 1000h83.333v83.333H1000zM1083.333 1000h83.333v83.333h-83.333zM1166.667 1000H1250v83.333h-83.333zM1250 1000h83.333v83.333H1250zM1333.333 1000h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c5a" d="M1416.667 1000H1500v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1500 1000h83.333v83.333H1500z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cd0" d="M1583.333 1000h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1666.667 1000H1750v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cfe" d="M1750 1000h83.333v83.333H1750z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1833.333 1000h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5ca5" d="M1916.667 1000H2000v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M0 1083.333h83.333v83.333H0z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cb9" d="M83.333 1083.333h83.333v83.333H83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M166.667 1083.333H250v83.333h-83.333zM250 1083.333h83.333v83.333H250zM333.333 1083.333h83.333v83.333h-83.333zM416.667 1083.333H500v83.333h-83.333zM500 1083.333h83.333v83.333H500z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cce" d="M583.333 1083.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c30" d="M666.667 1083.333H750v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5ca0" d="M750 1083.333h83.333v83.333H750z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c7e" d="M833.333 1083.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M916.667 1083.333H1000v83.333h-83.333zM1000 1083.333h83.333v83.333H1000zM1083.333 1083.333h83.333v83.333h-83.333zM1166.667 1083.333H1250v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cf6" d="M1250 1083.333h83.333v83.333H1250z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1333.333 1083.333h83.333v83.333h-83.333zM1416.667 1083.333H1500v83.333h-83.333zM1500 1083.333h83.333v83.333H1500z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c18" d="M1583.333 1083.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1666.667 1083.333H1750v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cf0" d="M1750 1083.333h83.333v83.333H1750z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1833.333 1083.333h83.333v83.333h-83.333zM1916.667 1083.333H2000v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c97" d="M0 1166.667h83.333V1250H0z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M83.333 1166.667h83.333V1250H83.333zM166.667 1166.667H250V1250h-83.333zM250 1166.667h83.333V1250H250z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c45" d="M333.333 1166.667h83.333V1250h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c5d" d="M416.667 1166.667H500V1250h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M500 1166.667h83.333V1250H500zM583.333 1166.667h83.333V1250h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cea" d="M666.667 1166.667H750V1250h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cac" d="M750 1166.667h83.333V1250H750z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M833.333 1166.667h83.333V1250h-83.333zM916.667 1166.667H1000V1250h-83.333zM1000 1166.667h83.333V1250H1000zM1083.333 1166.667h83.333V1250h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cf7" d="M1166.667 1166.667H1250V1250h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1250 1166.667h83.333V1250H1250zM1333.333 1166.667h83.333V1250h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c14" d="M1416.667 1166.667H1500V1250h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1500 1166.667h83.333V1250H1500zM1583.333 1166.667h83.333V1250h-83.333zM1666.667 1166.667H1750V1250h-83.333zM1750 1166.667h83.333V1250H1750zM1833.333 1166.667h83.333V1250h-83.333zM1916.667 1166.667H2000V1250h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c82" d="M0 1250h83.333v83.333H0z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M83.333 1250h83.333v83.333H83.333zM166.667 1250H250v83.333h-83.333zM250 1250h83.333v83.333H250zM333.333 1250h83.333v83.333h-83.333zM416.667 1250H500v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c05" d="M500 1250h83.333v83.333H500z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M583.333 1250h83.333v83.333h-83.333zM666.667 1250H750v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cdb" d="M750 1250h83.333v83.333H750z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c32" d="M833.333 1250h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M916.667 1250H1000v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cc4" d="M1000 1250h83.333v83.333H1000z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1083.333 1250h83.333v83.333h-83.333zM1166.667 1250H1250v83.333h-83.333zM1250 1250h83.333v83.333H1250zM1333.333 1250h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cc4" d="M1416.667 1250H1500v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c75" d="M1500 1250h83.333v83.333H1500z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1583.333 1250h83.333v83.333h-83.333zM1666.667 1250H1750v83.333h-83.333zM1750 1250h83.333v83.333H1750z" transform="skewX(30) scale(1.2)"/><path fill="#484e5ce7" d="M1833.333 1250h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1916.667 1250H2000v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c19" d="M0 1333.333h83.333v83.333H0z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M83.333 1333.333h83.333v83.333H83.333zM166.667 1333.333H250v83.333h-83.333zM250 1333.333h83.333v83.333H250zM333.333 1333.333h83.333v83.333h-83.333zM416.667 1333.333H500v83.333h-83.333zM500 1333.333h83.333v83.333H500zM583.333 1333.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c9f" d="M666.667 1333.333H750v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M750 1333.333h83.333v83.333H750zM833.333 1333.333h83.333v83.333h-83.333zM916.667 1333.333H1000v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cbb" d="M1000 1333.333h83.333v83.333H1000z" transform="skewX(30) scale(1.2)"/><path fill="#484e5ced" d="M1083.333 1333.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1166.667 1333.333H1250v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5ce3" d="M1250 1333.333h83.333v83.333H1250z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1333.333 1333.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c13" d="M1416.667 1333.333H1500v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="none" d="M1500 1333.333h83.333v83.333H1500zM1583.333 1333.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c51" d="M1666.667 1333.333H1750v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c12" d="M1750 1333.333h83.333v83.333H1750z" transform="skewX(30) scale(1.2)"/><path fill="#484e5c2a" d="M1833.333 1333.333h83.333v83.333h-83.333z" transform="skewX(30) scale(1.2)"/><path fill="#484e5cd7" d="M1916.667 1333.333H2000v83.333h-83.333z" transform="skewX(30) scale(1.2)"/>
                        {/* ... and so on for ALL your paths ... */}
                    </g>

                    {/* Glow Layer for Hover Spotlight */}
                    <g 
                        ref={glowLayerGroupRef} 
                        style="transform-origin:center center" 
                        stroke={SPOTLIGHT_GLOW_STROKE_COLOR} 
                        stroke-width="3" 
                        fill="none" 
                        opacity="0" 
                        mask="url(#spotlight_hover_mask)" 
                        filter="url(#spotlight_line_blur_filter)" 
                    >
                        {/* Cloned paths */}
                    </g>
                </g>
            </svg>
        </div>
    );
}

export default AuthGrid;
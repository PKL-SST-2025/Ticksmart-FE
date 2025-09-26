// import type { Component } from 'solid-js';
// import { A } from '@solidjs/router';
// import { logoUrl } from '../assets/brand';

// const TopNav: Component = () => {
//   return (
//     <nav class="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
//       <div class="mx-auto max-w-screen-2xl px-3 sm:px-6 lg:px-8">
//         <div class="flex h-14 items-center justify-between">
//           {/* Brand */}
//           <A href="/dashboard" class="flex items-center gap-2">
//             <img src={logoUrl} class="h-7 w-7 rounded" alt="TikSmart" />
//             <span class="text-white font-bold tracking-tight">TikSmart</span>
//           </A>

//           {/* Search */}
//           <div class="hidden md:flex flex-1 max-w-xl mx-6">
//             <div class="relative w-full">
//               <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
//                 <svg class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
//                   <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 103.475 9.7l3.664 3.663a.75.75 0 101.06-1.06l-3.663-3.664A5.5 5.5 0 009 3.5zM5 9a4 4 0 118 0 4 4 0 01-8 0z" clip-rule="evenodd" />
//                 </svg>
//               </div>
//               <input
//                 type="search"
//                 placeholder="Search events, artists, venues"
//                 class="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-gray-100 placeholder:text-gray-400 focus-neon"
//               />
//             </div>
//           </div>

//           {/* Actions */}
//           <div class="flex items-center gap-2">
//             <A href="/orders" class="hidden sm:inline-flex btn-primary text-sm">My Tickets</A>
//             <A href="/profile" class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-sm text-gray-100 hover:bg-white/10">
//               <span class="hidden sm:inline">Profile</span>
//               <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A9 9 0 1118 7.5M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
//             </A>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default TopNav;

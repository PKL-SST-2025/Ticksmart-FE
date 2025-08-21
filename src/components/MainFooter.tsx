// src/components/MainFooter.tsx (Renamed from Footer.tsx)
import { Component, For } from "solid-js";
import { FiInstagram, FiTwitter, FiLinkedin, FiFacebook, FiYoutube } from 'solid-icons/fi'; // Importing Feather Icons
import CollabSparkLogo from "/Logo/Digital_2_-removebg-preview.png"
interface FooterLink {
  name: string;
  href: string;
}

interface FooterColumn {
  heading: string; // Made heading mandatory as per the new structure
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    heading: "Company",
    links: [
      { name: "About us", href: "about" },
      { name: "Terms & privacy", href: "/terms-privacy" },
      { name: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Resources", // Renamed "Help" to "Resources" for broader context
    links: [
      { name: "FAQ", href: "/faq" },
    ],
  },
];

// Data for social media links
const socialLinks = [
  { icon: FiInstagram, href: "#", name: "Instagram" },
  { icon: FiTwitter, href: "#", name: "Twitter (X)" },
  { icon: FiLinkedin, href: "#", name: "LinkedIn" },
  { icon: FiFacebook, href: "#", name: "Facebook" },
  { icon: FiYoutube, href: "#", name: "Youtube" },
];

const MainFooter: Component = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer class="bg-slate-900 text-gray-400 py-16 px-4 border-t border-slate-800">
      <div class="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        {/* Logo and Social Media Section (First Column) */}
        <div class="flex flex-col items-start space-y-6">
          {/* Your Custom Logo Placeholder */}
          {/* Replace this SVG with your actual logo component or image */}
          <a href="/" class="flex items-center text-slate-50  justify-center text-2xl font-bold">
            <img src={CollabSparkLogo} alt="logo" class="size-32 mb-4" />
          </a>

          {/* Social Media Icons */}
          <div class="flex space-x-4">
            <For each={socialLinks}>
              {(social) => (
                <a href={social.href} aria-label={social.name} class="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                  <social.icon class="w-6 h-6" />
                </a>
              )}
            </For>
          </div>
        </div>

        {/* Link Columns */}
        <For each={footerColumns}>
          {(col) => (
            <div>
              <h3 class="font-bold text-lg mb-4 text-slate-50">{col.heading}</h3>
              <ul class="space-y-2">
                <For each={col.links}>
                  {(link) => (
                    <li>
                      <a href={link.href} class="hover:text-blue-400 transition-colors duration-200 text-sm">
                        {link.name}
                      </a>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          )}
        </For>
      </div>

      {/* Bottom Section - Copyright and Disclaimers */}
      <div class="max-w-screen-xl mx-auto mt-12 pt-8 border-t border-slate-800 text-sm text-gray-500 flex flex-col md:flex-row md:justify-between items-center space-y-4 md:space-y-0">
        <p>© {currentYear} YourApp, Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default MainFooter;
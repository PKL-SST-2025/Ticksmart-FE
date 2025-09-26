import { Component } from "solid-js";
import { 
  AiOutlineAppstore, AiOutlineCalendar, AiOutlineEnvironment, AiOutlineStar, 
  AiOutlineBarChart, AiOutlineWallet, AiOutlineTeam, AiOutlineSetting, 
  AiOutlineSafetyCertificate, AiOutlineUser, AiOutlineFileText, AiOutlineCreditCard
} from 'solid-icons/ai';

// --- Type Definitions (Unchanged) ---
export type UserRole = 'admin' | 'organizer' | 'user';

export interface NavItem {
  text: string;
  href: string;
  icon: Component;
  roles: UserRole[]; // The minimum role(s) required to see this link
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

// --- The Master Configuration for ALL Sidebar Links ---
// The structure is now simplified. We define links for each role.
const masterSidebarData: NavSection[] = [
  // --- USER-SPECIFIC SECTION ---
  // These links are visible to 'user', 'organizer', and 'admin'.
  {
    title: "My Account",
    items: [
      { text: "Dashboard", href: "/dashboard", icon: AiOutlineAppstore, roles: ['user'] },
      { text: "My Orders", href: "/orders", icon: AiOutlineFileText, roles: ['user'] },
    ],
  },
  
  // --- ORGANIZER-SPECIFIC SECTION ---
  // These links are visible to 'organizer' and 'admin'.
  {
    title: "Organizer Tools",
    items: [
      { text: "Dashboard", href: "/organizer/dashboard", icon: AiOutlineBarChart, roles: ['organizer'] },
      { text: "Events", href: "/organizer/events", icon: AiOutlineCalendar, roles: ['organizer'] },
      { text: "Venues", href: "/organizer/venues", icon: AiOutlineEnvironment, roles: ['organizer'] },
      { text: "Attractions", href: "/organizer/attractions", icon: AiOutlineStar, roles: ['organizer'] },
      { text: "Orders", href: "/organizer/orders", icon: AiOutlineFileText, roles: ['organizer'] },
      { text: "Finances", href: "/organizer/finance", icon: AiOutlineWallet, roles: ['organizer'] },
      { text: "Stripe Connect", href: "/organizer/stripe", icon: AiOutlineSafetyCertificate, roles: ['organizer'] },
    ],
  },

  // --- ADMIN-SPECIFIC SECTION ---
  // These links are visible ONLY to 'admin'.
  {
    title: "Admin Panel",
    items: [
      { text: "Dashboard", href: "/admin/dashboard", icon: AiOutlineBarChart, roles: ['admin'] },
      { text: "Categories", href: "/admin/categories", icon: AiOutlineAppstore, roles: ['admin'] },
      { text: "Events", href: "/admin/events", icon: AiOutlineCalendar, roles: ['admin'] },
      { text: "Venues", href: "/admin/venues", icon: AiOutlineEnvironment, roles: ['admin'] },
      { text: "Users", href: "/admin/users", icon: AiOutlineTeam, roles: ['admin'] },
      { text: "Orders", href: "/admin/orders", icon: AiOutlineFileText, roles: ['admin'] },
      { text: "Payments", href: "/admin/payments", icon: AiOutlineCreditCard, roles: ['admin'] },
    ],
  },

  // --- SHARED ACCOUNT SECTION ---
  // Visible to ALL authenticated users.
  {
    title: "Account",
    items: [
      { text: "Profile", href: "/profile", icon: AiOutlineUser, roles: ['user', 'organizer', 'admin'] },
    ],
  },
];

/**
 * Generates a filtered list of sidebar sections based on the user's role.
 * This new logic correctly implements the role hierarchy.
 * 
 * @param role The role of the current user.
 * @returns An array of NavSection objects the user is allowed to see.
 */
export const getSidebarDataForRole = (role: UserRole | null | undefined): NavSection[] => {
  // If no role is provided (e.g., user is logging out), return an empty array.
  if (!role) return [];

  // --- THIS IS THE NEW, SIMPLIFIED FILTERING LOGIC ---
  const hasPermission = (itemRoles: UserRole[]) => {
    // An admin can see everything.
    if (role === 'admin') {
      return itemRoles.includes('admin');
    }
    // An organizer can see 'organizer' and 'user' links.
    if (role === 'organizer') {
      return itemRoles.includes('organizer') || itemRoles.includes('user');
    }
    // A user can only see 'user' links.
    if (role === 'user') {
      return itemRoles.includes('user');
    }
    return false;
  };

  return masterSidebarData
    .map(section => ({
      ...section,
      // Filter items based on our new permission logic
      items: section.items.filter(item => hasPermission(item.roles))
    }))
    // Remove any sections that have become empty after filtering.
    .filter(section => section.items.length > 0);
};
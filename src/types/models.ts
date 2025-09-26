// --- Venue Model ---
export type Venue = {
  id: number; // A real venue from the DB always has an ID
  name: string;
  address_line_1: string | null;
  city: string;
  postal_code: string;
  country: string;
  capacity: number | null;
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
  organizer_id: number | null;
};
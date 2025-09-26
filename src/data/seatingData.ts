// This file simulates the data you would fetch from your backend API.

// --- Type Definitions ---
// These interfaces match your database tables.

export interface Seat {
  id: number;
  seat_number: string;
  pos_x?: number;
  pos_y?: number;
  width: number;
  height: number;

  type?: 'seat' | 'spacer'; 
}

// A Row can now be a straight line or a Bezier curve
export type Row = {
  id: number;
  name: string;
} & (
  | {
      type: 'line';
      seats: Required<Seat>[]; // Seats with explicit coordinates
    }
  | {
      type: 'curve';
      seatCount: number; // How many seats are on this curve
      // Bezier curve parameters
      start: { x: number; y: number };
      end: { x: number; y: number };
      control: { x: number; y: number };
      // All seats in a curved row share dimensions
      seatWidth: number; 
      seatHeight: number;
    }
);

export interface Section {
  id: number;
  name: string;
  rows: Row[];
  defaultTierId: number; 
}

export interface SeatingChartData {
  id: number;
  name: string;
  background_image_url?: string;
  sections: Section[];
}

// Represents the dynamic status of a seat for a specific event
export interface EventSeat {
  seat_id: number;
  ticket_tier_id: number;
  status: 'available' | 'sold' | 'reserved'; // We'll add 'selected' on the frontend
}

// --- Mock Data ---
// This simulates a complete seating chart for a venue.
export const mockSeatingChart: SeatingChartData = {
  id: 1,
  name: 'Pro Concert Layout',
  sections: [
    {
      id: 101, name: 'Orchestra Left', defaultTierId: 3,
      rows: [
        // --- FIX IS HERE ---
        { id: 1001, name: 'A', type: 'line', seats: Array.from({ length: 10 }, (_, i) => ({ id: 10001 + i, seat_number: (i + 1).toString(), pos_x: 50 + i * 28, pos_y: 200, width: 22, height: 22, type: 'seat' })) },
        { id: 1002, name: 'B', type: 'line', seats: Array.from({ length: 10 }, (_, i) => ({ id: 10011 + i, seat_number: (i + 1).toString(), pos_x: 50 + i * 28, pos_y: 230, width: 22, height: 22, type: 'seat' })) },
      ]
    },
    {
      id: 102, name: 'Orchestra Right', defaultTierId: 2,
      rows: [
        // --- FIX IS HERE ---
        { id: 2001, name: 'A', type: 'line', seats: Array.from({ length: 10 }, (_, i) => ({ id: 20001 + i, seat_number: (i + 1).toString(), pos_x: 450 + i * 28, pos_y: 200, width: 22, height: 22, type: 'seat' })) },
        { id: 2002, name: 'B', type: 'line', seats: Array.from({ length: 10 }, (_, i) => ({ id: 20011 + i, seat_number: (i + 1).toString(), pos_x: 450 + i * 28, pos_y: 230, width: 22, height: 22, type: 'seat' })) },
      ]
    },
    {
      id: 103, name: 'Balcony', defaultTierId: 1,
      rows: [
        // Curve types don't have this issue as seats are generated dynamically
        { id: 3001, name: 'C', type: 'curve', seatCount: 25, start: { x: 50, y: 100 }, control: { x: 400, y: -20 }, end: { x: 750, y: 100 }, seatWidth: 20, seatHeight: 20 },
        { id: 3002, name: 'D', type: 'curve', seatCount: 28, start: { x: 40, y: 130 }, control: { x: 400, y: 10 }, end: { x: 760, y: 130 }, seatWidth: 20, seatHeight: 20 },
      ]
    }
  ],
};


// --- NEW: Ticket Tier Definition ---
export interface TicketTier {
  id: number;
  name: string;
  price: number;
  // Hex colors for light and dark themes
  color: string;
}


// --- Upgraded Mock Data ---
export const mockTicketTiers: TicketTier[] = [
  { id: 1, name: 'Regular', price: 350000, color: '#4f46e5' }, // Indigo
  { id: 2, name: 'VIP', price: 750000, color: '#16a34a' },     // Green
  { id: 3, name: 'Front Row', price: 1200000, color: '#dc2626' }, // Red
];

export const mockEventSeats = new Map<number, EventSeat>([
  [10002, { seat_id: 10002, ticket_tier_id: 3, status: 'sold' }],
  [10003, { seat_id: 10003, ticket_tier_id: 3, status: 'sold' }],
  [10015, { seat_id: 10015, ticket_tier_id: 1, status: 'reserved' }], // Reserved seat, let's make it orange
  [20005, { seat_id: 20005, ticket_tier_id: 1, status: 'sold' }],
  [20006, { seat_id: 20006, ticket_tier_id: 2, status: 'sold' }],
]);

// Helper to get a seat's tier (defaults to Orchestra)
export const getTierForSeat = (seatId: number): number => {
    if (seatId >= 3001000) return 2; // Balcony seats
    return 1; // Default to Orchestra
}

// Assume all other seats not in this map are 'available' for their respective tiers.
export type OrderStatus = 'confirmed' | 'cancelled' | 'pending' | 'used';

export type Order = {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string; // ISO date (yyyy-mm-dd)
  eventTime: string; // e.g., "19:00 - 01:00"
  venue: string;
  ticketType: string; // Regular | VIP | VVIP
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  orderDate: string; // ISO date
  ticketCode: string;
  image: string;
};

const STORAGE_KEY = 'tiksmart_orders';

export function getOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data as Order[];
    return [];
  } catch {
    return [];
  }
}

export function addOrder(order: Order): void {
  const current = getOrders();
  current.unshift(order); // newest first
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function clearOrders(): void {
  localStorage.removeItem(STORAGE_KEY);
}

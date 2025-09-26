export type EventItem = {
  id: number;
  title: string;
  artist: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  distance: string;
  price: string;
  oldPrice?: string;
  discountPrice?: string;
  rating?: number;
  reviews?: number;
  promo?: string | null;
  image: string;
  gallery: string[];
  category: string;
  genre: string | null;
  status: 'Available' | 'Limited' | 'Sold Out';
};

export const events: EventItem[] = [
  {
    id: 1,
    title: 'Bruno Mars Live in Jakarta',
    artist: 'Bruno Mars',
    date: '2025-09-15',
    time: '19:00',
    venue: 'Gelora Bung Karno Stadium',
    location: 'Jakarta',
    distance: '2.5 km',
    price: 'IDR 350,000',
    oldPrice: 'IDR 480,000',
    discountPrice: 'IDR 350,000',
    rating: 4.7,
    reviews: 25200,
    promo: 'SALEtember',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop',
    ],
    category: 'entertainment',
    genre: 'pop',
    status: 'Available',
  },
  {
    id: 2,
    title: 'Tulus Intimate Concert',
    artist: 'Tulus',
    date: '2025-09-20',
    time: '20:00',
    venue: 'Taman Ismail Marzuki',
    location: 'Jakarta',
    distance: '5.2 km',
    price: 'IDR 150,000',
    oldPrice: 'IDR 185,000',
    discountPrice: 'IDR 150,000',
    rating: 4.6,
    reviews: 66200,
    promo: 'SALEtember',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1511671902329-1d3176227f96?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
    ],
    category: 'entertainment',
    genre: 'indie',
    status: 'Available',
  },
  {
    id: 3,
    title: 'Taylor Swift | The Eras Tour',
    artist: 'Taylor Swift',
    date: '2025-10-01',
    time: '06:00',
    venue: 'Bundaran HI',
    location: 'Jakarta',
    distance: '3.8 km',
    price: 'IDR 250,000',
    oldPrice: 'IDR 300,000',
    discountPrice: 'IDR 250,000',
    rating: 4.9,
    reviews: 120000,
    promo: null,
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800&h=600&fit=crop',
    ],
    category: 'entertainment',
    genre: 'pop',
    status: 'Available',
  },
  {
    id: 4,
    title: 'Raisa Live Orchestra',
    artist: 'Raisa',
    date: '2025-09-25',
    time: '19:30',
    venue: 'ICE BSD',
    location: 'Tangerang',
    distance: '25.3 km',
    price: 'IDR 500,000',
    oldPrice: 'IDR 650,000',
    discountPrice: 'IDR 500,000',
    rating: 4.6,
    reviews: 8300,
    promo: 'SALEtember',
    image: 'https://images.unsplash.com/photo-1511671902329-1d3176227f96?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
    ],
    category: 'entertainment',
    genre: 'pop',
    status: 'Available',
  },
  {
    id: 5,
    title: 'NOAH Reunion Concert',
    artist: 'NOAH',
    date: '2025-09-28',
    time: '09:00',
    venue: 'Jakarta Convention Center',
    location: 'Jakarta',
    distance: '6.5 km',
    price: 'IDR 125,000',
    oldPrice: 'IDR 150,000',
    discountPrice: 'IDR 125,000',
    rating: 4.5,
    reviews: 5400,
    promo: null,
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop',
    ],
    category: 'seminar',
    genre: null,
    status: 'Available',
  },
  {
    id: 6,
    title: 'Alan Walker World Tour',
    artist: 'Alan Walker',
    date: '2025-10-05',
    time: '20:00',
    venue: 'Ancol Beach City',
    location: 'Jakarta',
    distance: '12.1 km',
    price: 'IDR 400,000',
    oldPrice: 'IDR 520,000',
    discountPrice: 'IDR 400,000',
    rating: 4.7,
    reviews: 17800,
    promo: 'SALEtember',
    image: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=600&fit=crop',
    ],
    category: 'entertainment',
    genre: 'electronic',
    status: 'Limited',
  },
];

export const getEventById = (id: string | number) =>
  events.find((e) => String(e.id) === String(id));

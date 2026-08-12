import type { RoomCategory } from "../types";

export type RoomListing = {
  id: string;
  name: string;
  category: RoomCategory;
  thumb: string;
};

export const BUILT_IN_ROOMS: RoomListing[] = [
  {
    id: "living-room-01",
    name: "Modern Living Room",
    category: "Living Room",
    thumb: "/rooms/living-room-01/room.jpg",
  },
  {
    id: "bedroom-01",
    name: "Classic Bedroom",
    category: "Bedroom",
    thumb: "/rooms/bedroom-01/room.jpg",
  },
  {
    id: "kitchen-01",
    name: "Open Kitchen",
    category: "Kitchen",
    thumb: "/rooms/kitchen-01/room.jpg",
  },
  {
    id: "bathroom-01",
    name: "Compact Bathroom",
    category: "Bathroom",
    thumb: "/rooms/bathroom-01/room.jpg",
  },
  {
    id: "balcony-01",
    name: "City-View Balcony",
    category: "Balcony",
    thumb: "/rooms/balcony-01/room.jpg",
  },
];

export const ROOM_CATEGORIES: RoomCategory[] = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Balcony",
];

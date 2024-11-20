import { Vehicle } from "./vehicle";

export interface Order {
  id: string;
  weight: number;
  destination: Destination;
  date: Date;
  observations?: string;
  vehicle: Vehicle | null;
  completed: boolean;
}

export interface Destination {
  city: string;
  country: string;
  coordinates: Coordinates;
  postalCode: string;
  address: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Filters {
  unassignedOrdersOnly: boolean;
  searchText: string;
  sort: SortColumn<keyof Order>;
}

export interface SortColumn<T extends keyof any> {
  column: T;
  order: "ASC" | "DESC";
}

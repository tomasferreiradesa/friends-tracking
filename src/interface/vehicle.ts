import { Order } from "./order";

export interface Vehicle {
  plate: string;
  maxWeightCapacity: number;
  availableWeight: number;
  favourite: boolean;
}

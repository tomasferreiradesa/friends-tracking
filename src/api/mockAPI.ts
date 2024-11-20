import { eventEmitter } from "../context/NotificationContext";
import { Filters, Order } from "../interface/order";
import { Vehicle } from "../interface/vehicle";
import { loadFromStorage, saveToStorage } from "../utils/api";
import { haversineDistance } from "../utils/haversine";
import { ordersStart, originCoordinates, vehiclesStart } from "./dummy-data";

let orders: Order[] = loadFromStorage("orders", ordersStart);

let vehicles: Vehicle[] = loadFromStorage("vehicles", vehiclesStart);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const API = {
  getOrders: async (filters?: Filters): Promise<Order[]> => {
    await delay(500);
    let filteredOrders = orders;

    if (filters) {
      const { unassignedOrdersOnly, searchText, sort } = filters;

      if (unassignedOrdersOnly) {
        filteredOrders = filteredOrders.filter(
          (order) => order.vehicle === null
        );
      }

      if (searchText) {
        const searchTextLower = searchText.toLowerCase();
        filteredOrders = filteredOrders.filter((order) =>
          [order.destination?.city, order.destination?.country]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(searchTextLower))
        );
      }

      if (sort) {
        filteredOrders = filteredOrders.sort((a, b) => {
          let aValue = a[sort.column];
          let bValue = b[sort.column];

          if (aValue == null || bValue == null) {
            return aValue == null ? (bValue == null ? 0 : 1) : -1;
          }

          if (sort.column === "destination") {
            aValue = a.destination.city + ", " + a.destination.country;
            bValue = b.destination.city + ", " + b.destination.country;
          }

          if (aValue instanceof Date && bValue instanceof Date) {
            return sort.order === "ASC"
              ? aValue.getTime() - bValue.getTime()
              : bValue.getTime() - aValue.getTime();
          }

          if (typeof aValue === "string" && typeof bValue === "string") {
            return sort.order === "ASC"
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          }

          if (typeof aValue === "number" && typeof bValue === "number") {
            return sort.order === "ASC" ? aValue - bValue : bValue - aValue;
          }

          return 0;
        });
      }
    }
    return Promise.resolve(filteredOrders);
  },

  getOrderDetails: (id: string): Promise<Order | null> => {
    const order = orders.find((o) => o.id === id);
    return Promise.resolve(order || null);
  },

  getUnassignedOrders: (): Promise<Order[]> =>
    Promise.resolve(orders.filter((order) => !order.vehicle)),

  createOrder: async (newOrder: Order): Promise<string> => {
    await delay(500);
    orders.push(newOrder);
    saveToStorage("orders", orders);
    return Promise.resolve("Order created");
  },

  changeObservation: async (orderId: string, text: string): Promise<string> => {
    await delay(500);
    const orderIndex = orders.findIndex((order) => order.id === orderId);
    if (orderIndex !== -1) {
      orders[orderIndex].observations = text; // Update the field in the original array
      saveToStorage("orders", orders);
    }

    // TODO
    // notify driver
    return Promise.resolve("Observation saved");
  },

  getVehicles: async (): Promise<Vehicle[]> => {
    await delay(500);
    const sortedVehicles = [...vehicles].sort(
      (a, b) => (b.favourite ? 1 : 0) - (a.favourite ? 1 : 0)
    );
    return Promise.resolve(sortedVehicles);
  },

  getVehicleDetails: (plate: string): Promise<Vehicle | null> => {
    const vehicle = vehicles.find((v) => v.plate === plate);
    return Promise.resolve(vehicle || null);
  },

  getVehicleOrdersSorted: async (
    vehiclePlate: string,
    dateFilter: Date
  ): Promise<Order[]> => {
    const orders = await API.getOrders();
    const filteredOrders = orders.filter((order) => {
      return (
        order.vehicle &&
        order.vehicle.plate === vehiclePlate &&
        order.date.toString().split("T")[0] ===
          dateFilter.toISOString().split("T")[0]
      );
    });

    const sortedOrders = await API.getSortedOrdersByDistance(filteredOrders); // Mock distance API

    return Promise.resolve(sortedOrders);
  },

  getSortedOrdersByDistance: async (orders: Order[]): Promise<Order[]> => {
    const sortedOrders = orders.sort((a, b) => {
      const distanceA = haversineDistance(
        originCoordinates,
        a.destination.coordinates
      );
      const distanceB = haversineDistance(
        originCoordinates,
        b.destination.coordinates
      );
      return distanceA - distanceB;
    });
    return Promise.resolve(sortedOrders);
  },

  assignVehicle: async (
    orderId: string,
    vehiclePlate?: string
  ): Promise<string> => {
    await delay(500);
    const orderIndex = orders.findIndex((order) => order.id === orderId);
    if (orderIndex === -1) {
      return Promise.reject("Order not found");
    }
    const order = orders[orderIndex];
    if (vehiclePlate) {
      const vehicleIndex = vehicles.findIndex(
        (vehicle) => vehicle.plate === vehiclePlate
      );
      if (vehicleIndex === -1) {
        return Promise.reject("Vehicle not found");
      }
      const vehicle = vehicles[vehicleIndex];
      if (vehicle && order) {
        if (vehicle.availableWeight < order.weight) {
          return Promise.reject(
            "Vehicle does not have enough capacity for this order"
          );
        } else {
          if (!order.completed) {
            vehicle.availableWeight -= order.weight;
          }
          order.vehicle = vehicle;
          orders[orderIndex] = order;
          vehicles[vehicleIndex] = vehicle;
          saveToStorage("orders", orders);
          saveToStorage("vehicles", vehicles);
          return Promise.resolve("Vehicle assigned");
        }
      }
    }
    return Promise.reject("Invalid order or vehicle");
  },

  unassignVehicle: async (
    orderId: string,
    vehiclePlate?: string
  ): Promise<string> => {
    const orderIndex = orders.findIndex((order) => order.id === orderId);
    if (orderIndex === -1) {
      return Promise.reject("Order not found");
    }
    const order = orders[orderIndex];
    if (order && vehiclePlate) {
      const vehicleIndex = vehicles.findIndex(
        (vehicle) => vehicle.plate === vehiclePlate
      );
      if (vehicleIndex === -1) {
        return Promise.reject("Vehicle not found");
      }
      const vehicle = vehicles[vehicleIndex];
      order.vehicle = null;
      vehicle.availableWeight += order.weight;
      orders[orderIndex] = order;
      vehicles[vehicleIndex] = vehicle;
      saveToStorage("orders", orders);
      saveToStorage("vehicles", vehicles);
    }
    return Promise.resolve("Vehicle unassigned");
  },

  completeDelivery: (orderId: string): Promise<string> => {
    const orderIndex = orders.findIndex((order) => order.id === orderId);
    console.log(orders);
    console.log(orderId);
    console.log(orderIndex);
    if (orderIndex === -1) {
      return Promise.reject("Order not found");
    }
    const order = orders[orderIndex];

    if (order && order.vehicle) {
      const vehicleIndex = vehicles.findIndex(
        (vehicle) => vehicle.plate === order.vehicle?.plate
      );
      if (vehicleIndex === -1) {
        return Promise.reject("Vehicle not found");
      }
      const vehicle = vehicles[vehicleIndex];

      order.completed = true;
      if (vehicle) {
        vehicle.availableWeight += order.weight;
      }
      orders[orderIndex] = order;
      vehicles[vehicleIndex] = vehicle;
      saveToStorage("orders", orders);
      saveToStorage("vehicles", vehicles);

      eventEmitter.emit(
        "deliveryCompleted",
        `Vehicle ${order.vehicle?.plate} delivered order ${orderId}`
      );
      return Promise.resolve("Delivery completed");
    }
    return Promise.reject("Invalid order");
  },

  setFavouriteVehicle: async (vehiclePlate: string): Promise<string> => {
    await delay(500);
    const vehicleIndex = vehicles.findIndex(
      (vehicle) => vehicle.plate === vehiclePlate
    );
    if (vehicleIndex === -1) {
      return Promise.reject("Vehicle not found");
    }
    const vehicle = vehicles[vehicleIndex];
    if (!vehicle) {
      return Promise.reject("Vehicle not found");
    }
    if (vehicle) {
      vehicle.favourite = !vehicle.favourite;
      vehicles[vehicleIndex] = vehicle;
      saveToStorage("vehicles", vehicles);
    }
    return Promise.resolve(
      `Vehicle ${vehicle.favourite ? "marked" : "unmarked"} as favourite`
    );
  },
};

if (
  localStorage.getItem("orders") === null ||
  localStorage.getItem("vehicles") === null
) {
  localStorage.removeItem("orders");
  localStorage.removeItem("vehicles");

  API.assignVehicle(orders[0].id, vehicles[0].plate);
  API.assignVehicle(orders[1].id, vehicles[0].plate);
  API.assignVehicle(orders[12].id, vehicles[0].plate);
  API.assignVehicle(orders[13].id, vehicles[0].plate);
  API.assignVehicle(orders[2].id, vehicles[1].plate);
  API.assignVehicle(orders[3].id, vehicles[3].plate);
  API.assignVehicle(orders[4].id, vehicles[4].plate);
  API.assignVehicle(orders[7].id, vehicles[4].plate);
  API.assignVehicle(orders[10].id, vehicles[3].plate);
  API.setFavouriteVehicle(vehicles[3].plate);
}

const completeDeliveryWithDelay = async () => {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  for (let i = 0; i < 3; i++) {
    const delayTime = [5000, 2500, 1500];
    await delay(delayTime[i]);
    const selectedOrder = orders[i];
    if (selectedOrder.vehicle && !selectedOrder.completed) {
      await API.completeDelivery(selectedOrder.id);
    }
  }
};
completeDeliveryWithDelay();

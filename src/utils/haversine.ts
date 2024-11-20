import { Coordinates } from "../interface/order";

export const haversineDistance = (
  coord1: Coordinates,
  coord2: Coordinates
): number => {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const pos1 = coord1;
  const pos2 = coord2;

  const R = 6371;
  const dLat = toRadians(pos2.latitude - pos1.latitude);
  const dLon = toRadians(pos2.longitude - pos1.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(pos1.latitude)) *
      Math.cos(toRadians(pos2.latitude)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

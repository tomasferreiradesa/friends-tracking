export function generateOrderId() {
  const randomPart = Math.random().toString(36).substring(2, 8);
  const timestampPart = Date.now().toString(36);
  return `${randomPart}-${timestampPart}`;
}

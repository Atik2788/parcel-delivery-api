export const validateDeliveryDate = (deliveryDate: string | Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // শুধু তারিখের তুলনা

  const delivery = new Date(deliveryDate);
  delivery.setHours(0, 0, 0, 0);

  return delivery >= today; // true if deliveryDate is today or future
};
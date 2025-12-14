"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeliveryDate = void 0;
const validateDeliveryDate = (deliveryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // শুধু তারিখের তুলনা
    const delivery = new Date(deliveryDate);
    delivery.setHours(0, 0, 0, 0);
    return delivery >= today; // true if deliveryDate is today or future
};
exports.validateDeliveryDate = validateDeliveryDate;

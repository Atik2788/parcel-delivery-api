/* eslint-disable no-unused-vars */
import { Types } from "mongoose";

export enum ParcelStatus {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  DISPATCHED = "DISPATCHED",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
  BLOCKED = "BLOCKED"
}

export interface ITrackingEvent {
  status: ParcelStatus;
  location: string;
  note?: string;
  updatedAt: Date;
}

export interface IRating {
  rating: number;   // 1–5
  comment?: string;
  ratedAt: Date;
}


export interface IAddress {
  division: string;      // Required
  area: string;          // Required
  postOffice: string;    // Required
  district?: string;     // Optional
  extra?: string;        // Optional, e.g., road number, landmark
}


export interface IParcel {
  _id?: Types.ObjectId;
  trackingId: string;                 // e.g., TRK-YYYYMMDD-000001
  type: string;                       // Parcel type: Document, Box, Electronics
  weight: number;                     // Parcel weight (kg)
  fee: number;                        // Delivery fee

  sender: {
    userId: Types.ObjectId;
    name: string;
    deliveryPhone: string;
    pickupPhone: string;
    pickupAddress: IAddress;
    deliveryAddress: IAddress;
  };

  receiver?: {                        // Receiver info (claim করার সময় fill হবে)
    userId?: Types.ObjectId;
    name: string;
    receiverPhone: string;
    pickupPhone?: string;
    deliveryPhone?: string;
    pickupAddress?: IAddress;
    deliveryAddress?: IAddress;
  };

  deliveryDate?: Date;
  currentStatus: ParcelStatus;

  trackingEvents?: ITrackingEvent[];

  ratings?: {
    senderToReceiver?: IRating;
    receiverToSender?: IRating;
  };

  isBlocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

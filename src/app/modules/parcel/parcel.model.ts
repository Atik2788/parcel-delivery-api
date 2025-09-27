import { Schema, model } from "mongoose";
import { IParcel, ParcelStatus } from "./parcel.interface";



const trackingEventSchema = new Schema({
  status: { type: String, enum: Object.values(ParcelStatus) },
  location: String,
  note: String,
  updatedAt: { type: Date, default: Date.now }
});


const addressSchema = new Schema({
  division: { type: String, required: true },
  area: { type: String, required: true },
  postOffice: { type: String, required: true },
  district: { type: String },    // optional
  extra: { type: String }        // optional, e.g., road, landmark
}, { _id: false });


const ratingSchema = new Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: false
  },
  feedback: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const parcelSchema = new Schema<IParcel>(
  {
    trackingId: { type: String, unique: true},
    type: { type: String, required: true },
    weight: { type: Number, required: true },
    fee: { type: Number, required: true },

    sender: {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: String,
      deliveryPhone: { type: String, required: true },
      pickupPhone: { type: String, required: true },
      pickupAddress: addressSchema,
      deliveryAddress: addressSchema,
    },

    receiver: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      name: String,
      receiverPhone: { type: String },
      pickupPhone: { type: String },
      deliveryPhone: { type: String },
      pickupAddress: addressSchema,
      deliveryAddress: addressSchema,
    },

    deliveryDate: Date,
    currentStatus: {
      type: String,
      enum: Object.values(ParcelStatus),
      default: ParcelStatus.REQUESTED
    },

    trackingEvents: [trackingEventSchema],

    ratings: {
      senderToReceiver: { type: ratingSchema },
      receiverToSender: { type: ratingSchema }
    },

    isBlocked: { type: Boolean, default: false }
  },
  { timestamps: true }
);


// Pre-save hook to auto-generate trackingId
parcelSchema.pre("save", async function (next) {
  if (this.isNew) {
    const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
    this.trackingId = `TRK-${dateStr}-${randomNum}`;
  }
  next();
});


export const Parcel = model<IParcel>("Parcel", parcelSchema);

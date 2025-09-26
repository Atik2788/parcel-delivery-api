import { Schema, model } from "mongoose";
import { IParcel, ParcelStatus } from "./parcel.interface";



const trackingEventSchema = new Schema({
  status: { type: String, enum: Object.values(ParcelStatus) },
  location: String,
  note: String,
  updatedAt: { type: Date, default: Date.now }
});

const ratingSchema = new Schema({
  rating: Number,
  comment: String,
  ratedAt: Date
});

const addressSchema = new Schema({
  division: { type: String, required: true },
  area: { type: String, required: true },
  postOffice: { type: String, required: true },
  district: { type: String },    // optional
  extra: { type: String }        // optional, e.g., road, landmark
}, { _id: false });



const parcelSchema = new Schema<IParcel>(
  {
    trackingId: { type: String, unique: true},
    type: { type: String, required: true },
    weight: { type: Number, required: true },
    fee: { type: Number, required: true },

    sender: {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: String,
      phone: String,
      address: addressSchema,
    },

    receiver: {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      name: String,
      phone: String,
      address: String
    },

    deliveryDate: Date,
    currentStatus: {
      type: String,
      enum: Object.values(ParcelStatus),
      default: ParcelStatus.REQUESTED
    },

    trackingEvents: [trackingEventSchema],

    ratings: {
      senderToReceiver: ratingSchema,
      receiverToSender: ratingSchema
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

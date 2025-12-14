"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parcel = void 0;
const mongoose_1 = require("mongoose");
const parcel_interface_1 = require("./parcel.interface");
const trackingEventSchema = new mongoose_1.Schema({
    status: { type: String, enum: Object.values(parcel_interface_1.ParcelStatus) },
    location: String,
    note: String,
    updatedAt: { type: Date, default: Date.now }
});
const addressSchema = new mongoose_1.Schema({
    division: { type: String, required: true },
    area: { type: String, required: true },
    postOffice: { type: String, required: true },
    district: { type: String }, // optional
    extra: { type: String } // optional, e.g., road, landmark
}, { _id: false });
const ratingSchema = new mongoose_1.Schema({
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
const parcelSchema = new mongoose_1.Schema({
    trackingId: { type: String, unique: true },
    type: { type: String, required: true },
    weight: { type: Number, required: true },
    fee: { type: Number, required: true },
    sender: {
        userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
        name: String,
        deliveryPhone: { type: String, required: true },
        pickupPhone: { type: String, required: true },
        pickupAddress: addressSchema,
        deliveryAddress: addressSchema,
    },
    receiver: {
        userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
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
        enum: Object.values(parcel_interface_1.ParcelStatus),
        default: parcel_interface_1.ParcelStatus.REQUESTED
    },
    trackingEvents: [trackingEventSchema],
    ratings: {
        senderToReceiver: { type: ratingSchema },
        receiverToSender: { type: ratingSchema }
    },
    isBlocked: { type: Boolean, default: false }
}, { timestamps: true,
    versionKey: false,
});
// Pre-save hook to auto-generate trackingId
parcelSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew) {
            const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
            const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
            this.trackingId = `TRK-${dateStr}-${randomNum}`;
        }
        next();
    });
});
exports.Parcel = (0, mongoose_1.model)("Parcel", parcelSchema);

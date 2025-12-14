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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const parcel_interface_1 = require("./parcel.interface");
const parcel_model_1 = require("./parcel.model");
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const user_model_1 = require("../user/user.model");
const parcel_validation_1 = require("./parcel.validation");
const validTransitions = {
    [parcel_interface_1.ParcelStatus.REQUESTED]: [parcel_interface_1.ParcelStatus.DISPATCHED],
    [parcel_interface_1.ParcelStatus.DISPATCHED]: [parcel_interface_1.ParcelStatus.IN_TRANSIT],
    [parcel_interface_1.ParcelStatus.IN_TRANSIT]: [parcel_interface_1.ParcelStatus.DELIVERED],
    [parcel_interface_1.ParcelStatus.DELIVERED]: [],
    [parcel_interface_1.ParcelStatus.APPROVED]: [],
    [parcel_interface_1.ParcelStatus.BLOCKED]: [],
    [parcel_interface_1.ParcelStatus.RETURNED]: [],
    [parcel_interface_1.ParcelStatus.CANCELLED]: [],
};
const createParcel = (senderJwt, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const senderId = senderJwt.userId;
    const sender = yield user_model_1.User.findById(senderId);
    if (!sender) {
        throw new appError_1.default(404, "Sender not found");
    }
    // console.log("sender from service", sender);
    const { type, weight, deliveryDate, deliveryPhone, pickupPhone, pickupAddress, deliveryAddress } = payload;
    if (!pickupPhone || !deliveryPhone || !deliveryAddress || !pickupAddress) {
        throw new appError_1.default(400, "Sender Phone, Pickup Phone, sender address, and pickup address are required");
    }
    if (deliveryDate && !(0, parcel_validation_1.validateDeliveryDate)(deliveryDate)) {
        throw new appError_1.default(400, "Delivery date must be at least 2 days from now");
    }
    if (!type || !weight || !deliveryDate) {
        throw new appError_1.default(400, "Type, weight, and delivery date are required to create a parcel");
    }
    const baseFee = 50;
    const perKg = 20;
    const fee = baseFee + weight * perKg;
    const newParcel = yield parcel_model_1.Parcel.create({
        type,
        weight,
        fee,
        sender: {
            userId: sender._id,
            name: sender.name,
            pickupPhone,
            deliveryPhone,
            pickupAddress,
            deliveryAddress,
        },
        currentStatus: parcel_interface_1.ParcelStatus.REQUESTED,
        trackingEvents: [
            {
                status: parcel_interface_1.ParcelStatus.REQUESTED,
                location: `${pickupAddress.area}, ${pickupAddress.postOffice}`,
                note: "Parcel created",
                updatedAt: new Date()
            }
        ]
    });
    // Update sender parcelsSent
    yield user_model_1.User.findByIdAndUpdate(sender._id, {
        $push: { parcelsSent: newParcel._id }
    });
    return newParcel;
});
const claimParcel = (parcelId, receiver, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    // console.log(payload)
    if (!parcel) {
        throw new appError_1.default(404, "Parcel not found");
    }
    if (parcel.currentStatus !== parcel_interface_1.ParcelStatus.REQUESTED && parcel.currentStatus !== parcel_interface_1.ParcelStatus.APPROVED) {
        throw new appError_1.default(400, "Parcel is not available for claiming");
    }
    if (!payload.name || !payload.receiverPhone) {
        throw new appError_1.default(400, "Receiver name, and phone are required to claim a parcel");
    }
    // Update parcel with receiver info
    parcel.receiver = {
        userId: receiver.userId,
        name: payload.name,
        receiverPhone: payload.receiverPhone,
        pickupPhone: parcel.sender.pickupPhone,
        deliveryPhone: parcel.sender.deliveryPhone,
        pickupAddress: parcel.sender.pickupAddress,
        deliveryAddress: parcel.sender.deliveryAddress,
    };
    parcel.currentStatus = parcel_interface_1.ParcelStatus.DISPATCHED;
    // Add tracking event
    (_a = parcel.trackingEvents) === null || _a === void 0 ? void 0 : _a.push({
        status: parcel_interface_1.ParcelStatus.DISPATCHED,
        location: `${parcel.sender.pickupAddress.area}, ${parcel.sender.pickupAddress.postOffice}`,
        note: `Parcel claimed by receiver ${payload.name}`,
        updatedAt: new Date(),
    });
    yield parcel.save();
    return parcel;
});
const updateTrackingReceiver = (receiver, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { trackingId, currentStatus, location, note } = payload;
    const parcel = yield parcel_model_1.Parcel.findOne({ trackingId: trackingId });
    if (!trackingId || !currentStatus) {
        throw new appError_1.default(400, "Tracking ID, currentStatus, and location are required to update tracking");
    }
    if (!parcel) {
        throw new appError_1.default(404, "Parcel not found");
    }
    if (((_b = (_a = parcel === null || parcel === void 0 ? void 0 : parcel.receiver) === null || _a === void 0 ? void 0 : _a.userId) === null || _b === void 0 ? void 0 : _b.toString()) !== receiver.userId.toString()) {
        throw new appError_1.default(403, "You are not authorized to update tracking for this parcel");
    }
    // 🚫 Invalid statuses
    const invalidStatusesForReceiver = [
        parcel_interface_1.ParcelStatus.APPROVED,
        parcel_interface_1.ParcelStatus.BLOCKED,
        parcel_interface_1.ParcelStatus.RETURNED,
        parcel_interface_1.ParcelStatus.CANCELLED,
    ];
    // ❌ User cannot send an invalid status
    if (invalidStatusesForReceiver.includes(currentStatus)) {
        throw new appError_1.default(400, `${currentStatus} status cannot be set by receiver`);
    }
    // ❌ If the parcel's currentStatus is one of the invalid statuses, the user cannot update tracking
    if (invalidStatusesForReceiver.includes(parcel.currentStatus)) {
        throw new appError_1.default(400, `Cannot update tracking for a ${parcel.currentStatus} parcel`);
    }
    if (parcel.currentStatus === payload.currentStatus) {
        throw new appError_1.default(400, `Parcel already in ${payload.currentStatus} status`);
    }
    const allowedNext = validTransitions[parcel.currentStatus] || [];
    if (!allowedNext.includes(currentStatus)) {
        throw new appError_1.default(400, `Invalid transition: ${parcel.currentStatus} → ${currentStatus}. Allowed: ${allowedNext.join(", ") || "none"}`);
    }
    (_c = parcel.trackingEvents) === null || _c === void 0 ? void 0 : _c.push({
        status: currentStatus,
        location: location,
        note: note,
        updatedAt: new Date(),
    });
    parcel.currentStatus = currentStatus;
    yield parcel.save();
    return parcel;
});
const updateTrackingSender = (sender, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { trackingId, currentStatus } = payload;
    const senderId = sender.userId;
    const parcel = yield parcel_model_1.Parcel.findOne({ trackingId: trackingId });
    const parcelSenderId = parcel === null || parcel === void 0 ? void 0 : parcel.sender.userId;
    if (!parcel) {
        throw new appError_1.default(404, "Parcel not found");
    }
    if (!parcel.sender || (parcelSenderId === null || parcelSenderId === void 0 ? void 0 : parcelSenderId.toString()) !== senderId.toString()) {
        throw new appError_1.default(403, "You are not authorized to update tracking for this parcel");
    }
    if (currentStatus !== parcel_interface_1.ParcelStatus.CANCELLED && currentStatus !== parcel_interface_1.ParcelStatus.RETURNED) {
        throw new appError_1.default(400, "Only CANCELLED or RETURNED status can be set by sender");
    }
    // ✅ Rule system
    if (currentStatus === parcel_interface_1.ParcelStatus.CANCELLED) {
        if (parcel.currentStatus === parcel_interface_1.ParcelStatus.CANCELLED) {
            throw new appError_1.default(400, "Parcel already in CANCELLED status");
        }
        if ([parcel_interface_1.ParcelStatus.DISPATCHED, parcel_interface_1.ParcelStatus.IN_TRANSIT, parcel_interface_1.ParcelStatus.DELIVERED, parcel_interface_1.ParcelStatus.RETURNED].includes(parcel.currentStatus)) {
            throw new appError_1.default(400, `Cannot cancel a ${parcel.currentStatus} parcel`);
        }
    }
    if (currentStatus === parcel_interface_1.ParcelStatus.RETURNED) {
        if (parcel.currentStatus === parcel_interface_1.ParcelStatus.RETURNED) {
            throw new appError_1.default(400, "Parcel already in RETURNED status");
        }
        if (parcel.currentStatus !== parcel_interface_1.ParcelStatus.DELIVERED) {
            throw new appError_1.default(400, "Only delivered parcel can be returned");
        }
    }
    // ✅ Update
    parcel.currentStatus = currentStatus;
    yield parcel.save();
    return parcel;
});
const giveRating = (trackingId, user, rating, feedback) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // console.log(user.role)
    const parcel = yield parcel_model_1.Parcel.findOne({ trackingId });
    if (!parcel) {
        throw new appError_1.default(404, "Parcel not found");
    }
    if (parcel.currentStatus !== parcel_interface_1.ParcelStatus.DELIVERED) {
        throw new appError_1.default(400, "Cannot give rating before parcel is delivered");
    }
    // role based save
    if (user.role === "SENDER") {
        if (parcel.sender.userId.toString() !== user.userId.toString()) {
            throw new appError_1.default(403, "You are not authorized to rate this parcel");
        }
        if (!parcel.ratings) {
            parcel.ratings = {};
        }
        parcel.ratings.senderToReceiver = { rating, feedback };
    }
    else if (user.role === "RECEIVER") {
        if (!((_a = parcel.receiver) === null || _a === void 0 ? void 0 : _a.userId)) {
            throw new appError_1.default(400, "Receiver information is missing for this parcel");
        }
        if (parcel.receiver.userId.toString() !== user.userId.toString()) {
            throw new appError_1.default(403, "You are not authorized to rate this parcel");
        }
        if (!parcel.ratings) {
            parcel.ratings = {};
        }
        parcel.ratings.receiverToSender = { rating, feedback };
    }
    else {
        throw new appError_1.default(400, "Invalid role");
    }
    yield parcel.save();
    return parcel;
});
const getMyParcelsSender = (sender) => __awaiter(void 0, void 0, void 0, function* () {
    if (!sender.userId) {
        throw new appError_1.default(400, "Sender ID missing");
    }
    const filter = { "sender.userId": sender.userId };
    const parcels = yield parcel_model_1.Parcel.find(filter)
        .populate("receiver.userId", "name email") // চাইলে receiver এর info আনতে পারো
        .populate("sender.userId", "name email") // sender এর info confirm করার জন্য
        .sort({ createdAt: -1 });
    const totalCount = yield parcel_model_1.Parcel.countDocuments(filter);
    const deliveredCount = yield parcel_model_1.Parcel.countDocuments({ "currentStatus": "DELIVERED" });
    const cancelledCount = yield parcel_model_1.Parcel.countDocuments({ "currentStatus": "CANCELLED" });
    const returnedCount = yield parcel_model_1.Parcel.countDocuments({ "currentStatus": "RETURNED" });
    const approvedCount = yield parcel_model_1.Parcel.countDocuments({ "currentStatus": "APPROVED" });
    const unclaimed = yield parcel_model_1.Parcel.countDocuments({ "currentStatus": "REQUESTED" });
    const blockedCount = yield parcel_model_1.Parcel.countDocuments({ isBlocked: true });
    const inTransit = yield parcel_model_1.Parcel.countDocuments({ "currentStatus": "IN_TRANSIT" });
    const dispatched = yield parcel_model_1.Parcel.countDocuments({ "currentStatus": "DISPATCHED" });
    return {
        parcels,
        meta: {
            totalCount,
            deliveredCount,
            cancelledCount,
            returnedCount,
            approvedCount,
            blockedCount,
            unclaimed,
            inTransit,
            dispatched,
        }
    };
});
const getMyParcelsReceiver = (receiver) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = { "receiver.userId": receiver.userId };
    const parcels = yield parcel_model_1.Parcel.find(filter);
    const totalParcel = yield parcel_model_1.Parcel.countDocuments(filter);
    const deliveredCount = yield parcel_model_1.Parcel.countDocuments({ "currentStatus": "DELIVERED" });
    const inTransit = yield parcel_model_1.Parcel.countDocuments({ "currentStatus": "IN_TRANSIT" });
    const dispatched = yield parcel_model_1.Parcel.countDocuments({ "currentStatus": "DISPATCHED" });
    const blocked = yield parcel_model_1.Parcel.countDocuments({ "currentStatus": "BLOCKED" });
    const returned = yield parcel_model_1.Parcel.countDocuments({ "currentStatus": "RETURNED" });
    return {
        parcels,
        meta: {
            totalParcel,
            deliveredCount,
            inTransit,
            dispatched,
            blocked,
            returned
        }
    };
});
const getIncomingParcels = () => __awaiter(void 0, void 0, void 0, function* () {
    const filter = { "receiver.userId": { $exists: false } };
    const parcels = yield parcel_model_1.Parcel.find(filter)
        .populate("sender.userId", "name email") // sender info useful for receiver 
        .sort({ createdAt: -1 });
    const totalCount = yield parcel_model_1.Parcel.countDocuments(filter);
    return {
        parcels, totalCount
    };
});
const cancelParcel = (parcelId, sender) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("parcel id", parcelId);
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new appError_1.default(404, "Parcel not found");
    }
    if (parcel.sender.userId.toString() !== sender.userId.toString()) {
        throw new appError_1.default(403, "You are not authorized to cancel this parcel");
    }
    if (parcel.currentStatus === parcel_interface_1.ParcelStatus.CANCELLED) {
        throw new appError_1.default(400, "Parcel already in CANCELLED status");
    }
    if ([parcel_interface_1.ParcelStatus.DISPATCHED, parcel_interface_1.ParcelStatus.IN_TRANSIT, parcel_interface_1.ParcelStatus.DELIVERED, parcel_interface_1.ParcelStatus.RETURNED].includes(parcel.currentStatus)) {
        throw new appError_1.default(400, `Cannot cancel a ${parcel.currentStatus} parcel`);
    }
    parcel.currentStatus = parcel_interface_1.ParcelStatus.CANCELLED;
    yield parcel.save();
    return parcel;
});
exports.ParcelService = {
    createParcel,
    claimParcel,
    updateTrackingReceiver,
    updateTrackingSender,
    giveRating,
    getMyParcelsSender,
    getIncomingParcels,
    cancelParcel,
    getMyParcelsReceiver
};

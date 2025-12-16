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
exports.ParcelController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const parcel_service_1 = require("./parcel.service");
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const createParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sender = req.user;
    // console.log(sender)
    if (!sender) {
        throw new Error("Unauthorized");
    }
    const result = yield parcel_service_1.ParcelService.createParcel(sender, req.body);
    console.log("result from controller", result);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Parcel created successfully",
        data: result
    });
}));
const claimParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.id;
    const receiver = req.user;
    const payload = req.body;
    // console.log("req body", req.body)
    const result = yield parcel_service_1.ParcelService.claimParcel(parcelId, receiver, payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Parcel claimed successfully",
        data: result
    });
}));
const updateTrackingReceiver = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const receiver = req.user;
    const payload = req.body;
    const result = yield parcel_service_1.ParcelService.updateTrackingReceiver(receiver, payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Tracking updated successfully",
        data: result
    });
}));
const updateTrackingSender = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sender = req.user;
    const payload = req.body;
    if (!payload.trackingId || !payload.currentStatus) {
        throw new appError_1.default(400, "Tracking ID and currentStatus are required to update tracking");
    }
    const result = yield parcel_service_1.ParcelService.updateTrackingSender(sender, payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Current Status updated successfully",
        data: result
    });
}));
const giveRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { trackingId } = req.params;
    const { rating, feedback } = req.body;
    const user = req.user;
    const result = yield parcel_service_1.ParcelService.giveRating(trackingId, user, rating, feedback);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Rating submitted successfully",
        data: result.ratings
    });
});
const getMyParcelsSender = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sender = req.user;
    // console.log("user from controller", senderId)
    const result = yield parcel_service_1.ParcelService.getMyParcelsSender(sender);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Parcels retrieved successfully",
        data: result.parcels,
        meta: result.meta,
    });
}));
const getMyParcelsReceiver = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const receiver = req.user;
    // console.log(receiver)
    if (!receiver) {
        throw new appError_1.default(401, "Unauthorized");
    }
    const result = yield parcel_service_1.ParcelService.getMyParcelsReceiver(receiver);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Parcels retrieved successfully",
        data: result.parcels,
        meta: result.meta
    });
}));
const getIncomingParcels = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const receiver = req.user;
    if (!receiver) {
        throw new appError_1.default(401, "Unauthorized");
    }
    const result = yield parcel_service_1.ParcelService.getIncomingParcels();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Parcels retrieved successfully",
        data: result.parcels,
        meta: {
            total: result.totalCount
        }
    });
}));
const cancelParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.parcelId;
    // console.log(parcelId)
    const sender = req.user;
    const result = yield parcel_service_1.ParcelService.cancelParcel(parcelId, sender);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Parcel cancelled successfully",
        data: result
    });
}));
exports.ParcelController = {
    createParcel,
    claimParcel,
    updateTrackingReceiver,
    updateTrackingSender,
    giveRating,
    getMyParcelsSender,
    getMyParcelsReceiver,
    getIncomingParcels,
    cancelParcel
};

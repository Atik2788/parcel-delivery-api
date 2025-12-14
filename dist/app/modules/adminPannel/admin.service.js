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
exports.AdminService = void 0;
const parcel_model_1 = require("../parcel/parcel.model");
const user_model_1 = require("../user/user.model");
const getAllUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    if (!query || Object.keys(query).length === 0) {
        const users = yield user_model_1.User.find();
        const totalUsers = yield user_model_1.User.countDocuments();
        const totalSuperAdmins = yield user_model_1.User.countDocuments({ role: "SUPER_ADMIN" });
        const totalAdmins = yield user_model_1.User.countDocuments({ role: "ADMIN" });
        const totalSenders = yield user_model_1.User.countDocuments({ role: "SENDER" });
        const totalReceivers = yield user_model_1.User.countDocuments({ role: "RECEIVER" });
        return {
            users,
            meta: {
                totalUsers,
                totalSuperAdmins,
                totalAdmins,
                totalSenders,
                totalReceivers,
                page: 1,
                totalPages: 1,
            }
        };
    }
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const filter = search ? {
        $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { "receiver.name": { $regex: search, $options: "i" } },
            { "sender.name": { $regex: search, $options: "i" } },
        ]
    } : {};
    const users = yield user_model_1.User.find(filter).skip(skip).limit(limit);
    const totalUsers = yield user_model_1.User.countDocuments(filter);
    const totalSuperAdmins = yield user_model_1.User.countDocuments({ role: "SUPER_ADMIN" });
    const totalAdmins = yield user_model_1.User.countDocuments({ role: "ADMIN" });
    const totalSenders = yield user_model_1.User.countDocuments({ role: "SENDER" });
    const totalReceivers = yield user_model_1.User.countDocuments({ role: "RECEIVER" });
    const pageNumber = Number(page) || 1;
    return {
        users,
        meta: {
            totalUsers,
            totalSuperAdmins,
            totalAdmins,
            totalSenders,
            totalReceivers,
            page: pageNumber,
            totalPages: Math.ceil(totalUsers / limit),
        }
    };
});
const updatePercelIsBlocked = (parcelId, isBlocked) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new Error("Parcel not found");
    }
    // console.log(isBlocked)
    if (isBlocked === true) {
        if (parcel.currentStatus !== "DELIVERED" &&
            parcel.currentStatus !== "CANCELLED") {
            parcel.currentStatus = "BLOCKED";
            parcel.isBlocked = isBlocked;
        }
        else {
            throw new Error(`This parcel cannot be blocked, because it is already ${parcel.currentStatus} `);
        }
    }
    else if (isBlocked === false) {
        parcel.isBlocked = isBlocked;
        const lastEvents = (_a = parcel.trackingEvents) === null || _a === void 0 ? void 0 : _a[parcel.trackingEvents.length - 1];
        if (lastEvents) {
            parcel.currentStatus = lastEvents.status;
        }
        else {
            parcel.currentStatus = "APPROVED";
        }
    }
    else {
        throw new Error("Invalid isBlocked value. Must be true or false.");
    }
    yield parcel.save();
    return parcel;
});
const getAllPercels = (query) => __awaiter(void 0, void 0, void 0, function* () {
    if (!query || Object.keys(query).length === 0) {
        const parcels = yield parcel_model_1.Parcel.find();
        const totalParcels = yield parcel_model_1.Parcel.countDocuments();
        const deliveredlParcels = yield parcel_model_1.Parcel.countDocuments({ currentStatus: "DELIVERED" });
        const unclaimedParcels = yield parcel_model_1.Parcel.countDocuments({ currentStatus: "REQUESTED" });
        const processingParcels = yield parcel_model_1.Parcel.countDocuments({ currentStatus: { $in: (["DISPATCHED", "IN_TRANSIT"]) } });
        const cancelledParcels = yield parcel_model_1.Parcel.countDocuments({ currentStatus: "CANCELLED" });
        const returnedParcels = yield parcel_model_1.Parcel.countDocuments({ currentStatus: "RETURNED" });
        const approvedParcels = yield parcel_model_1.Parcel.countDocuments({ currentStatus: "APPROVED" });
        const blockedParcels = yield parcel_model_1.Parcel.countDocuments({ isBlocked: true });
        return {
            parcels,
            meta: {
                totalParcels,
                deliveredlParcels,
                unclaimedParcels,
                processingParcels,
                cancelledParcels,
                returnedParcels,
                blockedParcels,
                approvedParcels,
                page: 1,
                totalPage: 1,
            }
        };
    }
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const filter = search ? {
        $or: [
            { trackingId: { $regex: search, $options: "i" } },
            { type: { $regex: search, $options: "i" } },
            { "sender.name": { $regex: search, $options: "i" } },
            { "receiver.name": { $regex: search, $options: "i" } },
            { currentStatus: { $regex: search, $options: "i" } }
        ]
    } : {};
    const parcels = yield parcel_model_1.Parcel.find(filter).skip(skip).limit(limit);
    // Counts for meta
    const totalParcels = yield parcel_model_1.Parcel.countDocuments(filter);
    const deliveredlParcels = yield parcel_model_1.Parcel.countDocuments(Object.assign(Object.assign({}, filter), { currentStatus: "DELIVERED" }));
    const unclaimedParcels = yield parcel_model_1.Parcel.countDocuments(Object.assign(Object.assign({}, filter), { currentStatus: "REQUESTED" }));
    const processingParcels = yield parcel_model_1.Parcel.countDocuments(Object.assign(Object.assign({}, filter), { currentStatus: { $in: ["DISPATCHED", "IN_TRANSIT"] } }));
    const cancelledParcels = yield parcel_model_1.Parcel.countDocuments(Object.assign(Object.assign({}, filter), { currentStatus: "CANCELLED" }));
    const returnedParcels = yield parcel_model_1.Parcel.countDocuments(Object.assign(Object.assign({}, filter), { currentStatus: "RETURNED" }));
    const approvedParcels = yield parcel_model_1.Parcel.countDocuments(Object.assign(Object.assign({}, filter), { currentStatus: "APPROVED" }));
    const blockedParcels = yield parcel_model_1.Parcel.countDocuments(Object.assign(Object.assign({}, filter), { isBlocked: true }));
    const totalPages = Math.ceil(totalParcels / limit);
    const pageNumber = Number(page) || 1;
    return {
        parcels,
        meta: {
            totalParcels,
            deliveredlParcels,
            unclaimedParcels,
            processingParcels,
            cancelledParcels,
            returnedParcels,
            blockedParcels,
            approvedParcels,
            page: pageNumber,
            totalPages
        }
    };
});
exports.AdminService = {
    getAllUsers,
    updatePercelIsBlocked,
    getAllPercels
};

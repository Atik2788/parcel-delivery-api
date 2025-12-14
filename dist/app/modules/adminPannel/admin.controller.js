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
exports.AdminController = void 0;
const sendResponse_1 = require("../../utils/sendResponse");
const catchAsync_1 = require("../../utils/catchAsync");
const admin_service_1 = require("./admin.service");
const getAllUsers = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield admin_service_1.AdminService.getAllUsers(query);
    // console.log(result)
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Users fetched successfully",
        data: result.users,
        meta: result.meta,
    });
}));
const updatePercelIsBlocked = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parcelId = req.params.id;
    const { isBlocked } = req.body;
    if (isBlocked === undefined) {
        throw new Error("isBlocked is required");
    }
    const updatedParcel = yield admin_service_1.AdminService.updatePercelIsBlocked(parcelId, isBlocked);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Parcel updated successfully",
        data: updatedParcel
    });
}));
const getAllPercels = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield admin_service_1.AdminService.getAllPercels(query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Parcels fetched successfully",
        data: result.parcels,
        meta: result.meta
    });
}));
exports.AdminController = {
    getAllUsers,
    updatePercelIsBlocked,
    getAllPercels
};

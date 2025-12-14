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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const user_model_1 = require("./user.model");
const user_interface_1 = require("./user.interface");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../../config/env");
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const http_status_1 = __importDefault(require("http-status"));
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, password, role } = payload, rest = __rest(payload, ["email", "password", "role"]);
    const hashPassword = yield bcryptjs_1.default.hash(password, Number(env_1.envVars.BCRYPT_SALT_ROUNDS));
    const authProvider = { provider: "credential", providerId: email };
    const user = yield user_model_1.User.create(Object.assign(Object.assign({ email, password: hashPassword }, rest), { auths: [authProvider], role: payload.role && Object.values(user_interface_1.Role).includes(payload.role)
            ? payload.role
            : user_interface_1.Role.SENDER }));
    return { user };
});
const updateUser = (userId, payload, verifiedToken) => __awaiter(void 0, void 0, void 0, function* () {
    const ifUserExist = yield user_model_1.User.findById(userId);
    if (!ifUserExist) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User does not exist");
    }
    const senderReceiverFields = [
        "name",
        "email",
        "password",
        "phone",
        "address",
    ];
    const adminFields = [
        "isActive",
        "isDeleted",
        "isValidated",
        "role",
    ];
    // Generic helper to safely assign fields
    const assignFields = (fields, target, source) => {
        fields.forEach((field) => {
            if (field in source && source[field] !== undefined) {
                target[field] = source[field];
            }
        });
    };
    const updateData = {};
    // Sender / Receiver
    if (verifiedToken.role === user_interface_1.Role.SENDER || verifiedToken.role === user_interface_1.Role.RECEIVER) {
        if (verifiedToken.userId !== userId) {
            throw new appError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to update other user profile");
        }
        assignFields(senderReceiverFields, updateData, payload);
    }
    // Admin
    else if (verifiedToken.role === user_interface_1.Role.ADMIN) {
        if (ifUserExist.role === user_interface_1.Role.ADMIN || ifUserExist.role === user_interface_1.Role.SUPER_ADMIN) {
            throw new appError_1.default(http_status_1.default.FORBIDDEN, `You cannot update another ${ifUserExist.role}`);
        }
        assignFields([...senderReceiverFields, ...adminFields], updateData, payload);
    }
    // Super Admin
    else if (verifiedToken.role === user_interface_1.Role.SUPER_ADMIN) {
        if (ifUserExist.role === user_interface_1.Role.SUPER_ADMIN) {
            throw new appError_1.default(http_status_1.default.FORBIDDEN, "You cannot update another Super Admin");
        }
        assignFields([...senderReceiverFields, ...adminFields], updateData, payload);
    }
    // Password handling
    if (payload.password) {
        if (!payload.oldPassword && verifiedToken.role !== user_interface_1.Role.ADMIN && verifiedToken.role !== user_interface_1.Role.SUPER_ADMIN) {
            throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Old password is required to set a new password");
        }
        // Only check old password for self-update
        if ((verifiedToken.role === user_interface_1.Role.SENDER || verifiedToken.role === user_interface_1.Role.RECEIVER) && payload.oldPassword) {
            const isMatch = yield bcryptjs_1.default.compare(payload.oldPassword, ifUserExist.password);
            if (!isMatch) {
                throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "Old password is incorrect");
            }
        }
        const saltRounds = parseInt(env_1.envVars.BCRYPT_SALT_ROUNDS, 10);
        updateData.password = yield bcryptjs_1.default.hash(payload.password, saltRounds);
    }
    const newUpdateUser = yield user_model_1.User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
    });
    return { newUpdateUser };
});
exports.UserService = {
    createUser,
    updateUser
};

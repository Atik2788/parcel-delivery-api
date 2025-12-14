"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateZodSchema = exports.createZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
exports.createZodSchema = zod_1.default.object({
    name: zod_1.default
        .string()
        .min(3, { message: "Name must be at least 3 characters long" })
        .max(50, { message: "Name must be at most 50 characters long" })
        .refine((val) => typeof val === "string", { message: "Name must be string" }),
    email: zod_1.default
        .string()
        .min(5, { message: "Email must be at least 5 characters long" })
        .max(50, { message: "Email must be at most 50 characters long" })
        .email({ message: "Email is invalid" })
        .refine((val) => typeof val === "string", { message: "Email must be string" }),
    password: zod_1.default
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least 1 uppercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least 1 digit" })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least 1 special character" }),
    phone: zod_1.default
        .string()
        .regex(/^\+8801[3-9][0-9]{8}$/, {
        message: "Phone must be a valid Bangladeshi number with +880 and 11 digits",
    })
        .optional(),
    address: zod_1.default
        .string()
        .max(200, { message: "Address must be at most 200 characters long" })
        .optional(),
    role: zod_1.default.enum([user_interface_1.Role.SENDER, user_interface_1.Role.RECEIVER]).optional() // <-- এখানে যোগ করুন
});
exports.updateZodSchema = zod_1.default.object({
    name: zod_1.default
        .string()
        .min(3, { message: "Name must be at least 3 characters long" })
        .max(50, { message: "Name must be at most 50 characters long" })
        .refine((val) => typeof val === "string", { message: "Name must be string" })
        .optional(),
    email: zod_1.default
        .string()
        .min(5, { message: "Email must be at least 5 characters long" })
        .max(50, { message: "Email must be at most 50 characters long" })
        .email({ message: "Email is invalid" })
        .refine((val) => typeof val === "string", { message: "Email must be string" })
        .optional(),
    password: zod_1.default
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least 1 uppercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least 1 digit" })
        .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least 1 special character" })
        .optional(),
    oldPassword: zod_1.default
        .string()
        .min(8, { message: "Old password must be at least 8 characters long" })
        .optional(),
    role: zod_1.default
        // enum 
        .enum(Object.values(user_interface_1.Role))
        .optional(),
    isActive: zod_1.default
        .enum(Object.values(user_interface_1.IsActive))
        .optional(),
    isDeleted: zod_1.default
        .boolean()
        .optional(),
    phone: zod_1.default
        .string()
        .regex(/^\+8801[3-9][0-9]{8}$/, {
        message: "Phone must be a valid Bangladeshi number with +880 and 11 digits",
    })
        .optional(),
    address: zod_1.default
        .string()
        .max(200, { message: "Address must be at most 200 characters long" })
        .optional(),
});

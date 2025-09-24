import z from "zod";
import { IsActive, Role } from "./user.interface";


export const createZodSchema = z.object({
                name: z
                    .string()
                    .min(3, { message: "Name must be at least 3 characters long" })
                    .max(50, { message: "Name must be at most 50 characters long" })
                    .refine((val) => typeof val === "string", { message: "Name must be string" }),

                email: z
                    .string()
                    .min(5, { message: "Email must be at least 5 characters long" })
                    .max(50, { message: "Email must be at most 50 characters long" })
                    .email({ message: "Email is invalid" })
                    .refine((val) => typeof val === "string", { message: "Email must be string" }),

                password: z
                    .string()
                    .min(8, { message: "Password must be at least 8 characters long" })
                    .regex(/[A-Z]/, { message: "Password must contain at least 1 uppercase letter" })
                    .regex(/[0-9]/, { message: "Password must contain at least 1 digit" })
                    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least 1 special character" }),

                phone: z
                    .string()
                    .regex(/^\+8801[3-9][0-9]{8}$/, {
                    message: "Phone must be a valid Bangladeshi number with +880 and 11 digits",
                    })
                    .optional(),

                address: z
                    .string()
                    .max(200, { message: "Address must be at most 200 characters long" })
                    .optional()
                    ,
   })


export const updateZodSchema = z.object({
                name: z
                    .string()
                    .min(3, { message: "Name must be at least 3 characters long" })
                    .max(50, { message: "Name must be at most 50 characters long" })
                    .refine((val) => typeof val === "string", { message: "Name must be string" })
                    .optional(),
    
                password: z
                    .string()
                    .min(8, { message: "Password must be at least 8 characters long" })
                    .regex(/[A-Z]/, { message: "Password must contain at least 1 uppercase letter" })
                    .regex(/[0-9]/, { message: "Password must contain at least 1 digit" })
                    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least 1 special character" })
                    .optional(),

                role: z
                    // enum 
                    .enum(Object.values(Role) as [string])
                    .optional(),

                isActive: z
                    .enum(Object.values(IsActive) as [string])
                    .optional(),
                
                isDeleted: z
                    .boolean()
                    .optional(),

                phone: z
                    .string()
                    .regex(/^\+8801[3-9][0-9]{8}$/, {
                    message: "Phone must be a valid Bangladeshi number with +880 and 11 digits",
                    })
                    .optional(),

                address: z
                    .string()
                    .max(200, { message: "Address must be at most 200 characters long" })
                    .optional(),
   })
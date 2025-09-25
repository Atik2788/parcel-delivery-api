/* eslint-disable no-unused-vars */
import { Types } from "mongoose";


export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    SENDER = "SENDER",
    RECEIVER = "RECEIVER"
}

export enum IsActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED"
}

export interface IAuthProvider{
    provider: "google" | "credential"; // Google, Credential
    providerId: string;
}


export interface IUser {
    _id ?: Types.ObjectId;
    name : string;
    age: number;
    email : string;
    password ?: string;
    phone ?: string;
    picture ?: string;
    address ?: string;
    isDeleted ?: boolean;
    isActive ?: IsActive;
    isValidated ?: boolean;
    role : Role;
    auths : IAuthProvider[];
    bookings ?: Types.ObjectId[];
    guides ?: Types.ObjectId[]; 
}
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
import { User } from "./user.model";
import { IAuthProvider, IUser, Role } from "./user.interface";
import bcryptjs from 'bcryptjs';
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/appError";
import httpStatus from "http-status";


const createUser = async(payload: Partial<IUser>) =>{
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {email, password,role, ...rest} = payload;


    const hashPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUNDS));
    const authProvider: IAuthProvider = {provider: "credential", providerId: email as string};

    const user = await User.create({
        email,
        password: hashPassword,
        ...rest,
        auths: [authProvider],
        role: payload.role && Object.values(Role).includes(payload.role as Role)
          ? (payload.role as Role)
          : Role.SENDER
    });

    return {user};
}

export interface UpdateUserPayload extends Partial<IUser> {
    oldPassword?: string;
}


const updateUser = async (userId: string,payload: UpdateUserPayload, verifiedToken: JwtPayload) => {
    const ifUserExist = await User.findById(userId);
    if (!ifUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
    }

    const senderReceiverFields: (keyof IUser)[] = [
        "name",
        "email",
        "password",
        "phone",
        "address",
    ];

    const adminFields: (keyof IUser)[] = [
        "isActive",
        "isDeleted",
        "isValidated",
        "role",
    ];

    // Generic helper to safely assign fields
    const assignFields = <T extends keyof IUser>(
        fields: T[],
        target: Partial<IUser>,
        source: Partial<IUser>
    ) => {
        fields.forEach((field) => {
            if (field in source && source[field] !== undefined) {
                target[field] = source[field] as IUser[T];
            }
        });
    };

    const updateData: Partial<IUser> = {};

    // Sender / Receiver
    if (verifiedToken.role === Role.SENDER || verifiedToken.role === Role.RECEIVER) {
        if (verifiedToken.userId !== userId) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not allowed to update other user profile"
            );
        }
        assignFields(senderReceiverFields, updateData, payload);
    }
    
    // Admin
    else if (verifiedToken.role === Role.ADMIN) {
        if (ifUserExist.role === Role.ADMIN || ifUserExist.role === Role.SUPER_ADMIN) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                `You cannot update another ${ifUserExist.role}`
            );
        }
        assignFields([...senderReceiverFields, ...adminFields], updateData, payload);
    }

    // Super Admin
     else if (verifiedToken.role === Role.SUPER_ADMIN) {
        if (ifUserExist.role === Role.SUPER_ADMIN) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You cannot update another Super Admin"
            );
        }
        assignFields([...senderReceiverFields, ...adminFields], updateData, payload);
    }



    // Password handling
    if (payload.password) {
        if (!payload.oldPassword && verifiedToken.role !== Role.ADMIN && verifiedToken.role !== Role.SUPER_ADMIN) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Old password is required to set a new password"
            );
        }
    }

        // Only check old password for self-update
        if ((verifiedToken.role === Role.SENDER || verifiedToken.role === Role.RECEIVER) && payload.oldPassword) {
            const isMatch = await bcryptjs.compare(payload.oldPassword, ifUserExist.password as string);

            if (!isMatch) {
                throw new AppError(
                    httpStatus.UNAUTHORIZED,
                    "Old password is incorrect"
                );
            }
        }

        const saltRounds: number = parseInt(envVars.BCRYPT_SALT_ROUNDS as string, 10);
        
        updateData.password = await bcryptjs.hash(payload.password as string, saltRounds);


    const newUpdateUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
    });

    return { newUpdateUser };
}




export const UserService = {
    createUser,
    updateUser
}
import { User } from "./user.model";
import { IAuthProvider, IUser, Role } from "./user.interface";
import bcryptjs from 'bcryptjs';
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/appError";
import httpStatus from "http-status";


const createUser = async(payload: Partial<IUser>) =>{
    const {email, password,role, ...rest} = payload;
    console.log("role", role)

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const isUserExist = await User.findOne({email});

    // if(isUserExist){
    //     throw new Error("User already exist");
    // }

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


const getAllUsers = async() => {
    const users = await User.find();
    const totalUsers = await User.countDocuments();

    return {
        users,
        totalUsers
    };
}

const updateUser = async(userId: string, payload: Partial<IUser>, verifiedToken: JwtPayload) => {
    console.log(verifiedToken)
    const ifUserExist = await User.findById(userId);

    if(!ifUserExist){
        throw new AppError(httpStatus.NOT_FOUND, "User does not exist")
    }   

    if(verifiedToken.role === Role.RECEIVER || verifiedToken.role === Role.SENDER){
        if(verifiedToken.userId !== userId){
            throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to update other user profile")
        }
    }

    if(payload.role){
        if(verifiedToken.role === Role.SENDER || verifiedToken.role === Role.RECEIVER){
            throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to update role")
        }

        if(payload.role === Role.SUPER_ADMIN && verifiedToken.role === Role.ADMIN){
            throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to update role to Super_Admin")
        }
    }
 

    if(payload.isActive || payload.isDeleted || payload.isValidated){
            if(verifiedToken.role === Role.SENDER || verifiedToken.role === Role.RECEIVER){
                throw new AppError(httpStatus.FORBIDDEN, "You are not allowed to update role")
            }
    }

    if(payload.password){
        payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUNDS as string)
    }

    const newUpdateUser = await User.findByIdAndUpdate(userId, payload, {new: true, runValidators: true})

    return {newUpdateUser}

}

export const UserService = {
    createUser,
    getAllUsers,
    updateUser
}
import { JwtPayload } from "jsonwebtoken";
import AppError from "../errorHelpers/appError";
import { IsActive, IUser } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { generateToken, verifyToken } from "./jwt";
import httpStatus from "http-status";
import { envVars } from "../config/env";

export const createUserTokens = (user: Partial<IUser>) =>{
        // jwt perameter valiable
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
    }

    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET as string   , envVars.JWT_ACCESS_EXPIRES as string)
    const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET as string, envVars.JWT_REFRESH_EXPIRES as string)

    return{
        accessToken,
        refreshToken
    }
}

export const createNewRefreshTokenWithAccessToken = async(refreshToken: string) =>{
     const verifyRefreshToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET as string) as JwtPayload


    const isUserExist = await User.findOne({email: verifyRefreshToken.email})

    if(!isUserExist){
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
    }
    if(isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE){
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
    }
    if(isUserExist.isDeleted){
        throw new AppError(httpStatus.BAD_REQUEST, "Usrer is deleted")
    }


    // jwt perameter valiable
    const jwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    }

    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET as string, envVars.JWT_ACCESS_EXPIRES as string)

    return accessToken

}
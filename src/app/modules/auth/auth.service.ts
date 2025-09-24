/* eslint-disable @typescript-eslint/no-non-null-assertion */
import AppError from "../../errorHelpers/appError";
import httpStatus from "http-status";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";
import { createNewRefreshTokenWithAccessToken } from "../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";


const getNewAccessToken = async (refreshToken: string) =>{
   
   const newAccessToken = await createNewRefreshTokenWithAccessToken(refreshToken)

    return {
        accessToken: newAccessToken
    }
}

const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) =>{

    const user = await User.findById(decodedToken.userId)

    const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user!.password as string )

    if(!isOldPasswordMatch){
        throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match")
    }

     user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUNDS));
    user!.save();
}

export const AuthServices = {
    // credentialLogin,
    getNewAccessToken,
    resetPassword
      
}
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import { verifyToken } from "../utils/jwt";
import AppError from "../errorHelpers/appError";
import { User } from "../modules/user/user.model";
import { IsActive } from "../modules/user/user.interface";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";

export const checkAuth = (...authRoles: string[]) => async(req: Request, res: Response, next: NextFunction)=>{

    try {
        const accessToken = req.headers.authorization;
        // console.log(accessToken)
        if(!accessToken || typeof accessToken !== "string"){
            throw new AppError(403, "Access token not found")
        }

        
        const verifiToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET as string) as JwtPayload;

        const isUserExist = await User.findOne({email: verifiToken.email})

        if(!isUserExist){
            throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
        }
        if(isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE){
            throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
        }
        if(isUserExist.isDeleted){
            throw new AppError(httpStatus.BAD_REQUEST, "Usrer is deleted")
        }
        
    
        if(!verifiToken){
            throw new AppError(403, `You are not authorized ${verifiToken}`)
        }

        
        if(!authRoles.includes(verifiToken.role)){
            throw new AppError(403, "Access Denied for You! You are not authorized")
        }
        
        req.user = verifiToken;
        next()

    } catch (error) {
        next(error)
    }
}
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import { verifyToken } from "../utils/jwt";
import AppError from "../errorHelpers/appError";
import { User } from "../modules/user/user.model";
import { IsActive } from "../modules/user/user.interface";
// import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";


export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.headers.authorization;
    if (!accessToken || typeof accessToken !== "string") {
      throw new AppError(403, "Access token not found");
    }

    const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET as string) as JwtPayload;

    const user = await User.findOne({ email: verifiedToken.email });
    if (!user) throw new AppError(400, "User does not exist");

    if (user.isActive === IsActive.BLOCKED || user.isActive === IsActive.INACTIVE) {
      throw new AppError(400, `User is ${user.isActive}`);
    }

    if (user.isDeleted) throw new AppError(400, "User is deleted");

    // Attach user to req first
    req.user = verifiedToken;

    // Case-insensitive role check
    if (authRoles.length && !authRoles.some(r => r.toUpperCase() === verifiedToken.role.toUpperCase())) {
      throw new AppError(403, "Access Denied for You! You are not authorized");
    }

    next();
  } catch (err) {
    next(err);
  }
};






/*
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

*/
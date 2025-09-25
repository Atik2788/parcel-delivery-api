/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/appError"
import { createUserTokens } from "../../utils/userTokens"
import { catchAsync } from "../../utils/catchAsync"
import { NextFunction, Request, Response } from "express"
import { setAuthCookie } from "../../utils/setCookie"
import { sendResponse } from "../../utils/sendResponse"
import  httpStatus  from 'http-status';
import passport from 'passport';


const credentialLogin = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{

        passport.authenticate("local", async (err: any, user: any, info: any) =>{

            if(err){
                // return new AppError(401, err)
                return next(new AppError(401, err))
            }


            if(!user){
                // return new AppError(401, info.message)
                return next(new AppError(401, info.message))
            }


            const userTokens =await createUserTokens(user)

            const {passport, ...rest} = user.toObject();

            setAuthCookie(res, userTokens)        
            sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "User Logged in successfully",
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user: rest
            }
        })

        })(req, res, next)            
        
})

export const AuthController = {
    credentialLogin
}
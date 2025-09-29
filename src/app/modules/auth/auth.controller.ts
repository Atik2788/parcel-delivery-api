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
import { AuthService } from "./auth.service"


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



const getNewAccessToken = catchAsync(async(req: Request, res: Response, next: NextFunction)=>{
        const refreshToken = req.cookies.refreshToken;

        if(!refreshToken){
            throw new AppError(httpStatus.BAD_REQUEST, "Refresh token not found")
        }

        const tokenInfo = await AuthService.getNewAccessToken(refreshToken) 


        setAuthCookie(res, tokenInfo)
        
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "New Access Token Retrieved Successfully",
            data: tokenInfo
        })
})




export const AuthController = {
    credentialLogin,
    getNewAccessToken
}
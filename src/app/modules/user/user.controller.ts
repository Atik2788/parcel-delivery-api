/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UpdateUserPayload, UserService } from "./user.service";
import httpStatus  from 'http-status';
import {JwtPayload } from "jsonwebtoken";


const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Business logic for creating a user goes here
    // console.log("req.body from controller", req.body)
    const user = await UserService.createUser(req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "User created successfully",
        data: user  
    })
})



const updateUser = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const payload: UpdateUserPayload = req.body;
    console.log("payloed",payload)

    if(payload.email){
        throw new Error("Email cannot be updated");
    }

    const verifiedToken = req.user;


    const user = await UserService.updateUser(userId, payload, verifiedToken as JwtPayload );

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User updated successfully",
        data: user
    })



})

export const UserController = {
    createUser,
    updateUser
}



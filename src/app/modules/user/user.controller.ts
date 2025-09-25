/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";
import httpStatus  from 'http-status';
import {JwtPayload } from "jsonwebtoken";


const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Business logic for creating a user goes here
    console.log("req.body from controller", req.body)
    const user = await UserService.createUser(req.body);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "User created successfully",
        data: user  
    })
})

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Business logic for getting all users goes here
    const users = await UserService.getAllUsers();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Users fetched successfully",
        data: users  
    })
})

const updateUser = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const payload = req.body;

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
    getAllUsers,
    updateUser
}



import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { IUser } from "../user/user.interface";
import { ParcelService } from "./parcel.service";


const createParcel = catchAsync(async (req: Request, res: Response) => {
   const sender = req.user;
    // console.log(sender)
   if(!sender) {
    throw new Error("Unauthorized");
   }


    const result = await ParcelService.createParcel(sender as IUser, req.body)

    console.log("result from controller", result)

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Parcel created successfully",
        data: result
    })
})

export const ParcelController = {
    createParcel
}
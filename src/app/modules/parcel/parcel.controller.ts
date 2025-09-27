import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { IUser } from "../user/user.interface";
import { ParcelService } from './parcel.service';
import AppError from "../../errorHelpers/appError";


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

const claimParcel = catchAsync(async(req: Request, res: Response) => {
    const parcelId = req.params.id;
    const receiver = req.user as IUser;
    const payload = req.body;

    // console.log("req body", req.body)

    const result = await ParcelService.claimParcel(parcelId, receiver, payload);

    sendResponse(res,{
        statusCode: 200,
        success: true,
        message: "Parcel claimed successfully",
        data: result
    })

})

const updateTrackingReceiver = catchAsync(async(req: Request, res: Response) => {
    const receiver = req.user as IUser;
    const payload = req.body;

    const result = await ParcelService.updateTrackingReceiver(receiver, payload);

    sendResponse(res,{
        statusCode: 200,
        success: true,
        message: "Tracking updated successfully",
        data: result
    })

})

const updateTrackingSender = catchAsync(async(req: Request, res: Response) => {
    const sender = req.user as IUser;
    const payload = req.body;

    if(!payload.trackingId || !payload.currentStatus){
        throw new AppError(400, "Tracking ID and currentStatus are required to update tracking");
    }

    const result = await ParcelService.updateTrackingSender(sender, payload);

    sendResponse(res,{
        statusCode: 200,
        success: true,
        message: "Current Status updated successfully",
        data: result
    })

})

const giveRating = async (req: Request, res: Response) => {
  const { trackingId } = req.params;
  const { rating, feedback } = req.body; 
  
  if (!req.user) {
    throw new AppError(401, "Unauthorized");
    }
  const user = req.user; // come's from auth middleware(token)
    // console.log("usr",user, "req.body", req.body);

  const result  = await ParcelService.giveRating(trackingId, user, rating, feedback);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Rating submitted successfully",
    data: result.ratings
  });
};


export const ParcelController = {
    createParcel,
    claimParcel,
    updateTrackingReceiver,
    updateTrackingSender,
    giveRating
}
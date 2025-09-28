/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { AdminService } from "./admin.service";
import { GetUsersQuery } from './admin.service';


const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    const query = req.query;

    const result = await AdminService.getAllUsers(query as GetUsersQuery);


    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Users fetched successfully",
        data: result,
        meta:{
            totalUsers: result.totalUsers,
            page: result.page as number,
            totalPages: result.totalPages
        }
    })
})


const updatePercelIsBlocked = catchAsync(async (req: Request, res: Response) => {
    const parcelId = req.params.id;
    const { isBlocked } = req.body;
    if(!isBlocked){
        throw new Error("isBlocked is required");
    }

    const updatedParcel = await AdminService.updatePercelIsBlocked(parcelId, isBlocked);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Parcel updated successfully",
      data: updatedParcel
    });
  })

  const getAllPercels = catchAsync(async(req: Request, res: Response) => {

    const result = await AdminService.getAllPercels();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Parcels fetched successfully",
        data: result,
        meta: {
            totalParcels : result.meta.totalParcels,
            deliveredlParcels : result.meta.deliveredlParcels,
            unclaimedParcels : result.meta.unclaimedParcels,
            processingParcels : result.meta.processingParcels,
            cancelledParcels : result.meta.cancelledParcels,
            returnedParcels : result.meta.returnedParcels,
            blockedParcels : result.meta.blockedParcels,
            approvedParcels : result.meta.approvedParcels
        }
    })
  })


export const AdminController = {
    getAllUsers, 
    updatePercelIsBlocked, 
    getAllPercels
}
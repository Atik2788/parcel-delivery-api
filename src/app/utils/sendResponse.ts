import { Response } from "express";

interface TMeta {
    total: number;
}

interface TMetaParcel{
    totalParcels: number,
    totalDeliveries: number,
    totalUnclaimed: number,
}

interface TMetaAllUsers{
    totalUsers: number,
    superAdmin: number,
    admin:  number,
    sender: number,
    receiver: number,
}

interface TMetaParcelUsers{
    totalUsers: number,
    page: number,
    totalPages: number,
}

interface TMetaAllParcels {
    totalParcels : number,
    deliveredlParcels : number,
    unclaimedParcels : number,
    processingParcels : number,
    cancelledParcels : number,
    returnedParcels : number,
    blockedParcels : number,
    approvedParcels : number,
}

interface tResponse <T>{
    statusCode: number;
    success: boolean; 
    message: string;
    data: T;
    meta?: TMeta | TMetaParcel | TMetaAllUsers | TMetaParcelUsers | TMetaAllParcels;
}

export const sendResponse = <T>(res: Response, data: tResponse<T>) => {

    res.status(data.statusCode).json({
        statusCode: data.statusCode,
        success: data.success,
        message: data.message,
        meta: data.meta,
        data: data.data
    })
}
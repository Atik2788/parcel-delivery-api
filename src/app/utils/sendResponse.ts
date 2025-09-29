import { Response } from "express";

interface TMeta {
    total: number;
}

interface TMetaParcelGetSender{
           totalCount: number,
            deliveredCount: number,
            cancelledCount: number,
            returnedCount: number,
            approvedCount: number,
            blockedCount: number,
            unclaimed: number,
            inTransit: number,
            dispatched: number,
}

interface TMetaParcelGetReceiver{
            totalParcel: number,
            deliveredCount: number,
            inTransit: number,
            dispatched: number,
            blocked: number,
            returned: number,
}

interface TMetaAllUsers{
    totalUsers: number,
    totalSuperAdmins: number,
    totalAdmins:  number,
    totalSenders: number,
    totalReceivers: number,
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
    meta?: TMeta | TMetaParcelGetSender | TMetaAllUsers | TMetaParcelUsers | TMetaAllParcels | TMetaParcelGetReceiver;
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
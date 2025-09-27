import { Response } from "express";

interface TMeta {
    total: number;
}

interface TMetaParcel{
    totalParcels: number,
    totalDeliveries: number,
    totalUnclaimed: number,
}

interface tResponse <T>{
    statusCode: number;
    success: boolean; 
    message: string;
    data: T;
    meta?: TMeta | TMetaParcel;
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